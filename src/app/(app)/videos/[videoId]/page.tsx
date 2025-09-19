
'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
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
  Clapperboard,
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
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';


function VideoPlayerContent() {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  const videoId = params.videoId as string;
  const videoDataString = searchParams.get('videoData');
  const quality = searchParams.get('quality');
  
  let video: Video | null = null;
  try {
    if (videoDataString) {
      video = JSON.parse(decodeURIComponent(videoDataString));
    }
  } catch (e) {
    console.error("Failed to parse video data", e);
  }

  if (!video) {
    const title = searchParams.get('title');
    const decodedVideoUrl = decodeURIComponent(videoId);

    if (!decodedVideoUrl) {
      return notFound();
    }
    video = {
      video_url: decodedVideoUrl,
      title: title ? decodeURIComponent(title) : 'Untitled Video',
      published_date: '',
      notes: [],
      serial: 0,
      hd_video_url: '',
      thumbnail: '',
    }
  }

  const handleInteraction = async (interaction: 'Like' | 'Dislike' | 'Rate') => {
    if (!user || !video) return;

    let message = '';
    let emoji = '';

    if (interaction === 'Like') {
      setLiked(true);
      setDisliked(false);
      emoji = '👍';
      message = `*Video Liked!*`;
    } else if (interaction === 'Dislike') {
      setDisliked(true);
      setLiked(false);
      emoji = '👎';
      message = `*Video Disliked!*`;
    } else if (interaction === 'Rate') {
      emoji = '⭐';
      message = `*Video Rated!*`;
    }

    toast({
      title: `${emoji} Thank you!`,
      description: `You've ${interaction.toLowerCase()}d the video.`,
    });

    const notificationMessage = `${emoji} ${message}\n\n*User:* ${user.displayName || user.email}\n*Video:* ${video.title}`;
    await fetch('/api/notify', {
      method: 'POST',
      body: JSON.stringify({ message: notificationMessage }),
      headers: { 'Content-Type': 'application/json' },
    });
  };

  const videoUrlToPlay = 
    (quality === 'hd' && video.hd_video_url) 
    ? video.hd_video_url 
    : video.video_url 
    ? video.video_url
    : video.hd_video_url;

  const constructHdUrl = () => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('quality', 'hd');
    return `/videos/${videoId}?${newSearchParams.toString()}`;
  };

  return (
    <div className="container mx-auto max-w-5xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Lectures
      </Button>

      <div className="space-y-4">
        <VideoPlayer videoUrl={videoUrlToPlay || ''} />
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
            <Button
              variant={liked ? 'default' : 'ghost'}
              className="text-muted-foreground"
              onClick={() => handleInteraction('Like')}
            >
              <ThumbsUp className="mr-2" />
              Like
            </Button>
            <Button
              variant={disliked ? 'destructive' : 'ghost'}
              className="text-muted-foreground"
              onClick={() => handleInteraction('Dislike')}
            >
              <ThumbsDown className="mr-2" />
              Dislike
            </Button>
            <Button
              variant="ghost"
              className="text-muted-foreground"
              onClick={() => handleInteraction('Rate')}
            >
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
            {video.hd_video_url ? (
              <Button asChild variant="ghost" className="text-muted-foreground">
                <Link href={constructHdUrl()}>
                  <Clapperboard className="mr-2" />
                  Watch in HD
                </Link>
              </Button>
            ) : (
               <Button variant="ghost" className="text-muted-foreground" disabled>
                  <Clapperboard className="mr-2" />
                  HD Not Available
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
