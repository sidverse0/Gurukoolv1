'use client';

import { Suspense } from 'react';
import { useSearchParams, useParams, notFound, useRouter } from 'next/navigation';
import { VideoPlayer } from '@/components/video-player';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function VideoPlayerContent() {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();

  const videoId = params.videoId as string;
  const title = searchParams.get('title');
  const date = searchParams.get('date');

  const videoUrl = decodeURIComponent(videoId);

  if (!videoUrl) {
    return notFound();
  }

  return (
    <div className="container mx-auto max-w-5xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Lectures
      </Button>

      <div className="space-y-4">
        <VideoPlayer videoUrl={videoUrl} />
        <div>
          <h1 className="font-headline text-2xl font-bold tracking-tight md:text-3xl">
            {title ? decodeURIComponent(title) : 'Untitled Video'}
          </h1>
          {date && (
            <p className="mt-1 text-muted-foreground">
              Published on {decodeURIComponent(date)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function VideoPlayerSkeleton() {
  return (
    <div className="container mx-auto max-w-5xl">
        <Skeleton className="mb-4 h-8 w-40" />
        <Skeleton className="aspect-video w-full" />
        <div className="mt-4 space-y-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
        </div>
    </div>
  )
}

export default function VideoPage() {
  return (
    <Suspense fallback={<VideoPlayerSkeleton />}>
      <VideoPlayerContent />
    </Suspense>
  );
}
