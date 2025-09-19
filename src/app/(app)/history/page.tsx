'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  History,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Card } from '@/components/ui/card';

type Payment = {
  id: string;
  batchId: string;
  status: 'pending' | 'successful' | 'failed';
  submittedAt: {
    seconds: number;
    nanoseconds: number;
  };
  price: string;
  remark?: string;
};

const statusConfig = {
  successful: {
    icon: CheckCircle,
    color: 'bg-green-500',
    text: 'Successful',
    variant: 'default',
  },
  pending: {
    icon: AlertCircle,
    color: 'bg-yellow-500',
    text: 'Pending',
    variant: 'secondary',
  },
  failed: {
    icon: XCircle,
    color: 'bg-red-500',
    text: 'Failed',
    variant: 'destructive',
  },
} as const;

export default function HistoryPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const paymentsRef = collection(db, 'payments');
    const q = query(
      paymentsRef,
      where('userId', '==', user.uid),
      orderBy('submittedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const paymentHistory: Payment[] = [];
        querySnapshot.forEach((doc) => {
          paymentHistory.push({ id: doc.id, ...doc.data() } as Payment);
        });
        setPayments(paymentHistory);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching payment history:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="container mx-auto flex h-[60vh] flex-col items-center justify-center text-center">
        <div className="rounded-full bg-secondary p-6">
          <History className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="mt-8 font-headline text-3xl font-bold tracking-tight md:text-4xl">
          No Payment History
        </h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          Your payment transactions will appear here.
        </p>
      </div>
    );
  }
  
  const formatDate = (timestamp: { seconds: number; nanoseconds: number }) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp.seconds * 1000);
    return format(date, "MMM d, yyyy 'at' h:mm a");
  };

  return (
    <div className="container mx-auto">
      <h1 className="mb-6 font-headline text-3xl font-bold tracking-tight md:text-4xl">
        Payment History
      </h1>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Batch ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Remark</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => {
              const config = statusConfig[payment.status] || statusConfig.pending;
              const Icon = config.icon;
              return (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.batchId}</TableCell>
                   <TableCell>₹{payment.price}</TableCell>
                  <TableCell>
                    <Badge variant={config.variant}>
                      <Icon className="mr-2 h-4 w-4" />
                      {config.text}
                    </Badge>
                  </TableCell>
                  <TableCell title={formatDate(payment.submittedAt)}>
                    {formatDistanceToNow(payment.submittedAt.seconds * 1000, { addSuffix: true })}
                  </TableCell>
                  <TableCell>{payment.remark || '-'}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
