
'use client';

import { Suspense, useEffect, useState } from 'react';
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
  CheckCircle,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import type { Video } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';


function VideoPlayerContent() {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [dialogState, setDialogState] = useState<{ open: boolean; title: string; description: string; }>({ open: false, title: '', description: '' });

  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);


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

  useEffect(() => {
    // Simulate fetching initial counts
    setLikeCount(Math.floor(Math.random() * 100) + 10);
    setDislikeCount(Math.floor(Math.random() * 20) + 1);
  }, [video?.video_url]);

  // This effect will reset the player's playing state when the video data changes.
  // This is a workaround to prevent two videos from playing simultaneously when switching quality.
  useEffect(() => {
    // setPlaying(false); // This will cause the player to pause on quality change
  }, [video?.video_url, quality]);


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

  const handleLike = async () => {
    if (!user || !video) return;

    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount(prev => wasLiked ? prev - 1 : prev + 1);

    if (disliked) {
      setDisliked(false);
      setDislikeCount(prev => prev - 1);
    }
    
    if(!wasLiked){
      setDialogState({ open: true, title: `👍 Thank you!`, description: `You've liked the video.` });
  
      const notificationMessage = `👍 *Video Liked!* \n\n*User:* ${user.displayName || user.email}\n*Video:* ${video.title}`;
      await fetch('/api/notify', {
        method: 'POST',
        body: JSON.stringify({ message: notificationMessage }),
        headers: { 'Content-Type': 'application/json' },
      });
    }
  };
  
  const handleDislike = async () => {
    if (!user || !video) return;

    const wasDisliked = disliked;
    setDisliked(!wasDisliked);
    setDislikeCount(prev => wasDisliked ? prev - 1 : prev + 1);
    
    if (liked) {
      setLiked(false);
      setLikeCount(prev => prev - 1);
    }

    if (!wasDisliked) {
       setDialogState({ open: true, title: `👎 Thank you for your feedback!`, description: '' });

      const notificationMessage = `👎 *Video Disliked!* \n\n*User:* ${user.displayName || user.email}\n*Video:* ${video.title}`;
      await fetch('/api/notify', {
        method: 'POST',
        body: JSON.stringify({ message: notificationMessage }),
        headers: { 'Content-Type': 'application/json' },
      });
    }
  };
  
  const handleRatingSubmit = async () => {
    if (!user || !video || rating === 0) return;

    setDialogState({ open: true, title: `⭐ Thank you for rating!`, description: `You rated this video ${rating} out of 5.` });
    
    const notificationMessage = `⭐ *Video Rated! (${rating}/5)* \n\n*User:* ${user.displayName || user.email}\n*Video:* ${video.title}`;
    await fetch('/api/notify', {
        method: 'POST',
        body: JSON.stringify({ message: notificationMessage }),
        headers: { 'Content-Type': 'application/json' },
    });
    setIsRatingDialogOpen(false);
  };


  const videoUrlToPlay = 
    (quality === 'hd' && video.hd_video_url) 
    ? video.hd_video_url 
    : video.video_url;

  const constructHdUrl = () => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('quality', 'hd');
    return `/videos/${videoId}?${newSearchParams.toString()}`;
  };

  return (
    <>
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
              onClick={handleLike}
            >
              <ThumbsUp className="mr-2" />
              {likeCount}
            </Button>
            <Button
              variant={disliked ? 'destructive' : 'ghost'}
              className="text-muted-foreground"
              onClick={handleDislike}
            >
              <ThumbsDown className="mr-2" />
              {dislikeCount}
            </Button>
            
            <Dialog open={isRatingDialogOpen} onOpenChange={setIsRatingDialogOpen}>
                <DialogTrigger asChild>
                    <Button
                    variant="ghost"
                    className="text-muted-foreground"
                    >
                    <Star className="mr-2" />
                    Rate
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                    <DialogTitle>Rate this video</DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-center py-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                            key={star}
                            className={cn(
                                "h-10 w-10 cursor-pointer",
                                (hoverRating || rating) >= star
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            )}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                            />
                        ))}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">
                            Cancel
                            </Button>
                        </DialogClose>
                        <Button onClick={handleRatingSubmit} disabled={rating === 0}>
                            Submit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
              <Button asChild variant={quality === 'hd' ? 'default' : 'ghost'} className={quality !== 'hd' ? "text-muted-foreground" : ""}>
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
     <Dialog open={dialogState.open} onOpenChange={(open) => setDialogState({...dialogState, open})}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="items-center text-center">
            <DialogTitle className="font-headline text-2xl">{dialogState.title}</DialogTitle>
             <DialogDescription>
                {dialogState.description}
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setDialogState({ ...dialogState, open: false })}>Okay</Button>
        </DialogContent>
      </Dialog>
    </>
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
