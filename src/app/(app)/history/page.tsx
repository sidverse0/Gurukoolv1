'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import {
  History,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
    variant: 'default',
    text: 'Successful',
    className: 'border-green-500 text-green-600',
    bgClassName: 'bg-green-100',
  },
  pending: {
    icon: AlertCircle,
    variant: 'secondary',
    text: 'Pending',
    className: 'border-yellow-500 text-yellow-600',
    bgClassName: 'bg-yellow-100',

  },
  failed: {
    icon: XCircle,
    variant: 'destructive',
    text: 'Failed',
    className: 'border-red-500 text-red-600',
    bgClassName: 'bg-red-100',
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
    // We removed orderBy from the query to avoid needing a composite index.
    // We will sort the data on the client side.
    const q = query(
      paymentsRef,
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      querySnapshot => {
        const paymentHistory: Payment[] = [];
        querySnapshot.forEach(doc => {
          paymentHistory.push({ id: doc.id, ...doc.data() } as Payment);
        });
        
        // Sort payments by submittedAt date in descending order
        paymentHistory.sort((a, b) => b.submittedAt.seconds - a.submittedAt.seconds);

        setPayments(paymentHistory);
        setLoading(false);
      },
      error => {
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
      <div className="space-y-4">
        {payments.map(payment => {
          const config =
            statusConfig[payment.status] || statusConfig.pending;
          const Icon = config.icon;

          return (
            <Card key={payment.id} className={cn('overflow-hidden border-l-4', config.className)}>
              <div className="flex">
                <div className={cn('flex w-16 items-center justify-center', config.bgClassName)}>
                   <Icon className={cn('h-8 w-8', config.className.replace('border-', 'text-'))} />
                </div>
                <div className="flex-1">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                       <CardTitle className="text-lg font-bold">{payment.batchId}</CardTitle>
                       <p className="text-lg font-bold">₹{payment.price}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                     <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <Badge variant={config.variant}>
                          {config.text}
                        </Badge>
                        <p title={formatDate(payment.submittedAt)}>
                          {formatDistanceToNow(payment.submittedAt.seconds * 1000, { addSuffix: true })}
                        </p>
                      </div>
                  </CardContent>
                  {payment.remark && (
                    <CardFooter className="p-4 pt-0">
                       <p className="text-xs text-muted-foreground">
                         <strong>Remark:</strong> {payment.remark}
                       </p>
                    </CardFooter>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
