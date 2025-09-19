
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  const [showReceipt, setShowReceipt] = useState(false);
  const [submissionTime, setSubmissionTime] = useState<Date | null>(null);
  
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
      const currentTime = new Date();
      const paymentRef = doc(db, 'payments', `${user.uid}_${batchId}`);
      await setDoc(paymentRef, {
        userId: user.uid,
        batchId: batchId,
        utr: utr,
        price: batchPrice,
        status: 'pending',
        submittedAt: serverTimestamp(),
      });

      setSubmissionTime(currentTime);
      setShowReceipt(true);

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

  const handleReceiptClose = () => {
    setShowReceipt(false);
    router.push('/batches');
  }

  return (
    <>
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
            <CardContent className="grid gap-6 pt-6">
              <div className="flex flex-col items-center gap-4">
                <div className="relative aspect-square w-full max-w-[250px] rounded-lg bg-muted p-4">
                   <Image
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=reyazsiddique2003@okicici&pn=Reyaz%20Siddique&am=${batchPrice}&cu=INR&tn=Batch-${batchId}`}
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

       <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="items-center text-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <DialogTitle className="font-headline text-2xl">Payment Submitted</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
             <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
              <h4 className="font-semibold text-center text-muted-foreground">RECEIPT</h4>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Batch:</span>
                <span className="font-medium text-right">{batchDetails.batch_info.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium">₹{batchPrice}</span>
              </div>
               <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction ID:</span>
                <span className="font-medium">{utr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date & Time:</span>
                <span className="font-medium text-right">{submissionTime?.toLocaleString()}</span>
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Your payment is under review. You will get access once verified.
            </p>
          </div>
          <Button onClick={handleReceiptClose}>Okay</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
