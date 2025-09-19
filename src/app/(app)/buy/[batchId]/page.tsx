
'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { getBatchDetails } from '@/lib/data';
import type { BatchDetails } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';


function BuyPageSkeleton() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="mt-2 h-4 w-1/2" />
      </CardHeader>
      <CardContent className="grid gap-6">
        <Skeleton className="aspect-square w-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}

export default function BuyPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const batchId = params.batchId as string;
  const { toast } = useToast();

  const [batchDetails, setBatchDetails] = useState<BatchDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [utr, setUtr] = useState('');
  
  const batchPrice = '199';


  useEffect(() => {
    if (!batchId) return;
    async function fetchData() {
      setLoading(true);
      const details = await getBatchDetails(batchId);
      if (!details) {
        notFound();
      }
      setBatchDetails(details);
      setLoading(false);
    }
    fetchData();
  }, [batchId]);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utr) {
      toast({
        variant: 'destructive',
        title: 'UTR Number Required',
        description: 'Please enter the UTR number to proceed.',
      });
      return;
    }
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Not Logged In',
        description: 'You must be logged in to make a purchase.',
      });
      return;
    }

    setSubmitting(true);
    
    try {
      const paymentRef = doc(db, 'payments', `${user.uid}_${batchId}`);
      await setDoc(paymentRef, {
        userId: user.uid,
        batchId: batchId,
        utr: utr,
        price: batchPrice,
        status: 'pending',
        submittedAt: serverTimestamp(),
      });

      toast({
        title: 'Payment Submitted!',
        description: 'Your payment is being verified. You will be notified once it is confirmed.',
      });
      router.push('/batches');

    } catch (error) {
      console.error('Payment Submission Error:', error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'There was an error submitting your payment. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto flex max-w-md flex-col items-center">
         <div className="w-full">
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/batches">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Batches
              </Link>
            </Button>
          </div>
        <BuyPageSkeleton />
      </div>
    );
  }

  if (!batchDetails) {
    return notFound();
  }

  return (
    <div className="container mx-auto max-w-md">
       <div className="w-full">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/batches">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Batches
            </Link>
          </Button>
        </div>
      <form onSubmit={handlePaymentSubmit}>
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              {batchDetails.batch_info.title}
            </CardTitle>
            <CardDescription>
              Complete the payment to get access to this batch.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative aspect-square w-full max-w-[250px] rounded-lg bg-muted p-4">
                 <Image
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=sid@google.com&pn=Siddhant&am=${batchPrice}&cu=INR&tn=Batch-${batchId}`}
                  alt="Payment QR Code"
                  width={250}
                  height={250}
                  className="rounded-md"
                  data-ai-hint="qr code"
                />
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Scan to pay</p>
                <p className="font-headline text-3xl font-bold text-primary">
                  ₹{batchPrice}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="utr">Enter UTR / Transaction ID</Label>
              <Input
                id="utr"
                placeholder="12-digit transaction number"
                required
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                disabled={submitting}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <CheckCircle />
              )}
              <span className="ml-2">{submitting ? 'Submitting...' : "I've Paid"}</span>
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
