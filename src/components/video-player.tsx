'use client';

import { useState, useEffect } from 'react';
import ReactPlayer from 'react-player/lazy';
import {
  suggestVideoResolution,
  type SuggestVideoResolutionOutput,
} from '@/ai/flows/suggest-video-resolution';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';

interface VideoPlayerProps {
  videoUrl: string;
}

export function VideoPlayer({ videoUrl }: VideoPlayerProps) {
  const [suggestion, setSuggestion] =
    useState<SuggestVideoResolutionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasWindow, setHasWindow] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasWindow(true);
    }
  }, []);

  const handleSuggestResolution = async () => {
    setIsLoading(true);
    setSuggestion(null);
    try {
      // Simulate a random network speed between 1 and 100 Mbps
      const networkSpeedMbps = Math.floor(Math.random() * 100) + 1;
      const result = await suggestVideoResolution({ networkSpeedMbps });
      setSuggestion(result);
    } catch (error) {
      console.error('Error suggesting video resolution:', error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Could not get suggestion. Please try again.',
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="aspect-video w-full overflow-hidden rounded-lg border bg-black">
        {hasWindow ? (
          <ReactPlayer
            url={videoUrl}
            controls
            width="100%"
            height="100%"
            playing
          />
        ) : (
          <Skeleton className="h-full w-full" />
        )}
      </div>
      <div>
        <Button onClick={handleSuggestResolution} disabled={isLoading}>
          <Sparkles className="mr-2 h-4 w-4" />
          {isLoading ? 'Analyzing...' : 'Suggest Optimal Resolution'}
        </Button>
      </div>
      {suggestion && (
        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertTitle className="font-headline">
            AI Suggestion: Play at {suggestion.suggestedResolution}
          </AlertTitle>
          <AlertDescription>{suggestion.reason}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
