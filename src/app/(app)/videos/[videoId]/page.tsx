
'use client';

import { Suspense } from 'react';
import {
  useSearchParams,
  useParams,
  notFound,
  useRouter,
} from 'next/navigation';
import { VideoPlayer } from '@/components/video-player';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Star,
  FileText,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Video } from '@/lib/types';


function VideoPlayerContent() {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();

  const videoId = params.videoId as string;
  const videoDataString = searchParams.get('videoData');
  
  let video: Video | null = null;
  try {
    if (videoDataString) {
      video = JSON.parse(decodeURIComponent(videoDataString));
    }
  } catch (e) {
    console.error("Failed to parse video data", e);
  }

  if (!video) {
    // Fallback if videoData is not available
    const title = searchParams.get('title');
    const date = searchParams.get('date');
    const noteUrl = searchParams.get('noteUrl');
    const noteTitle = searchParams.get('noteTitle');

    const decodedVideoUrl = decodeURIComponent(videoId);

    if (!decodedVideoUrl) {
      return notFound();
    }
    // Reconstruct a partial video object for display
    video = {
      video_url: decodedVideoUrl,
      title: title ? decodeURIComponent(title) : 'Untitled Video',
      published_date: date ? decodeURIComponent(date) : '',
      notes: noteUrl ? [{ url: decodeURIComponent(noteUrl), title: noteTitle ? decodeURIComponent(noteTitle) : 'Notes' }] : [],
      serial: 0,
      hd_video_url: '',
      thumbnail: '',
    }
  }

  return (
    <div className="container mx-auto max-w-5xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Lectures
      </Button>

      <div className="space-y-4">
        <VideoPlayer videoUrl={video.video_url} />
        <div className="space-y-4">
          <div>
            <h1 className="font-headline text-2xl font-bold tracking-tight md:text-3xl">
              {video.title}
            </h1>
            {video.published_date && (
              <p className="mt-1 text-muted-foreground">
                Published on {video.published_date}
              </p>
            )}
          </div>
          <Separator />
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" className="text-muted-foreground">
              <ThumbsUp className="mr-2" />
              Like
            </Button>
            <Button variant="ghost" className="text-muted-foreground">
              <ThumbsDown className="mr-2" />
              Dislike
            </Button>
            <Button variant="ghost" className="text-muted-foreground">
              <Star className="mr-2" />
              Rate
            </Button>
            {video.notes && video.notes.length > 0 ? (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="text-muted-foreground">
                    <FileText className="mr-2" />
                    Notes
                  </Button>
                </DialogTrigger>
                <DialogContent className="h-screen max-h-[95svh] w-screen max-w-[95vw] flex flex-col p-0">
                  <DialogHeader className="p-4 border-b">
                    <DialogTitle className="font-headline">
                      {video.notes[0].title}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="flex-1">
                    <iframe
                      src={video.notes[0].url}
                      className="h-full w-full border-0"
                      title={video.notes[0].title}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <Button
                variant="ghost"
                className="text-muted-foreground"
                disabled
              >
                <FileText className="mr-2" />
                Notes
              </Button>
            )}
          </div>
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
  );
}

export default function VideoPage() {
  return (
    <Suspense fallback={<VideoPlayerSkeleton />}>
      <VideoPlayerContent />
    </Suspense>
  );
}
