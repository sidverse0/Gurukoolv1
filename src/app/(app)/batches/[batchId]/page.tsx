'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBatchDetails } from '@/lib/data';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  BookCopy,
  ChevronRight,
  Clapperboard,
  FileText,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { BatchDetails } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function SubjectSkeleton() {
  return (
    <div className="flex items-center space-x-4 rounded-lg border p-4">
      <Skeleton className="h-12 w-12 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-6 w-6" />
    </div>
  );
}

export default function BatchDetailsPage({
  params,
}: {
  params: { batchId: string };
}) {
  const { batchId } = params;
  const [batchDetails, setBatchDetails] = useState<BatchDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl">
        <Skeleton className="mb-4 h-8 w-40" />
        <Skeleton className="mb-2 h-10 w-3/4" />
        <Skeleton className="mb-8 h-5 w-1/2" />
        <div className="space-y-4">
          <SubjectSkeleton />
          <SubjectSkeleton />
          <SubjectSkeleton />
          <SubjectSkeleton />
        </div>
      </div>
    );
  }

  if (!batchDetails) {
    return notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/batches">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Batches
        </Link>
      </Button>

      <h1 className="mb-2 font-headline text-3xl font-bold tracking-tight md:text-4xl">
        {batchDetails.batch_info.title}
      </h1>
      <p className="mb-8 text-muted-foreground">
        Please select a subject to start learning.
      </p>

      <div className="space-y-4">
        {batchDetails.subjects.map(subject => (
          <Link
            href={`/batches/${batchId}/${subject.id}`}
            key={subject.id}
            className="block"
          >
            <Card className="transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="font-headline text-lg">
                    {subject.name}
                  </CardTitle>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Clapperboard className="mr-2 h-4 w-4" />
                      <span>{subject.video_count} Videos</span>
                    </div>
                    <div className="flex items-center">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>{subject.note_count} Notes</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-6 w-6 text-muted-foreground" />
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {batchDetails.subjects.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
          <BookCopy className="h-12 w-12 text-muted-foreground" />
          <h2 className="mt-6 font-headline text-xl font-semibold">
            No Subjects Found
          </h2>
          <p className="mt-2 text-muted-foreground">
            The curriculum for this batch is being finalized. Please check back
            later.
          </p>
        </div>
      )}
    </div>
  );
}
