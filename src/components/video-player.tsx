'use client';

import { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player/lazy';
import type { OnProgressProps } from 'react-player/base';
import {
  suggestVideoResolution,
  type SuggestVideoResolutionOutput,
} from '@/ai/flows/suggest-video-resolution';
import { Button } from '@/components/ui/button';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Gauge,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Slider } from './ui/slider';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  videoUrl: string;
}

function formatDuration(seconds: number) {
  const date = new Date(seconds * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes();
  const ss = date.getUTCSeconds().toString().padStart(2, '0');
  if (hh) {
    return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
  }
  return `${mm}:${ss}`;
}

export function VideoPlayer({ videoUrl }: VideoPlayerProps) {
  const [suggestion, setSuggestion] =
    useState<SuggestVideoResolutionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasWindow, setHasWindow] = useState(false);
  const { toast } = useToast();

  const playerRef = useRef<ReactPlayer>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const [playing, setPlaying] = useState(true);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState('1');
  const [seeking, setSeeking] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [controlsVisible, setControlsVisible] = useState(true);
  let controlsTimeout: NodeJS.Timeout;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasWindow(true);
    }
    
    const handleFullscreenChange = () => {
      const isFs = !!document.fullscreenElement;
      setFullscreen(isFs);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      clearTimeout(controlsTimeout);
    };
  }, []);

  const handleSuggestResolution = async () => {
    setIsLoading(true);
    setSuggestion(null);
    try {
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
  
  const handlePlayPause = () => setPlaying(!playing);
  const handleRewind = () => playerRef.current?.seekTo(played * duration - 10);
  const handleFastForward = () => playerRef.current?.seekTo(played * duration + 10);
  
  const handleProgress = (state: OnProgressProps) => {
    if (!seeking) {
      setPlayed(state.played);
    }
  };

  const handleSeekMouseDown = () => setSeeking(true);
  const handleSeekChange = (newPlayed: number[]) => setPlayed(newPlayed[0]);
  
  const handleSeekMouseUp = (newPlayed: number[]) => {
    setSeeking(false);
    playerRef.current?.seekTo(newPlayed[0]);
  };

  const handleToggleFullscreen = () => {
    const container = playerContainerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleMouseMove = () => {
    setControlsVisible(true);
    clearTimeout(controlsTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    controlsTimeout = setTimeout(() => {
      if (playing) {
        setControlsVisible(false);
      }
    }, 3000);
  };

  const handleMouseLeave = () => {
    if (playing) {
      setControlsVisible(false);
    }
  };


  return (
    <div className="space-y-4">
      <div
        ref={playerContainerRef}
        className="aspect-video w-full overflow-hidden rounded-lg bg-black relative group/player"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {hasWindow ? (
          <ReactPlayer
            ref={playerRef}
            url={videoUrl}
            width="100%"
            height="100%"
            playing={playing}
            played={played}
            playbackRate={parseFloat(playbackRate)}
            volume={volume}
            muted={muted}
            onProgress={handleProgress}
            onDuration={setDuration}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onClick={() => setPlaying(p => !p)}
            config={{
              file: {
                attributes: {
                  controlsList: 'nodownload',
                },
              },
            }}
          />
        ) : (
          <Skeleton className="h-full w-full" />
        )}
        
        <div className={cn(
          "absolute inset-0 bg-black/30 transition-opacity duration-300 flex items-center justify-center",
          controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          {/* Main Controls */}
          <div className="flex items-center gap-8">
            <Button onClick={handleRewind} variant="ghost" size="icon" className="h-14 w-14 rounded-full text-white hover:bg-white/20 hover:text-white">
              <RotateCcw className="h-8 w-8" />
            </Button>
            <Button onClick={handlePlayPause} variant="ghost" size="icon" className="h-20 w-20 rounded-full text-white hover:bg-white/20 hover:text-white">
              {playing ? <Pause className="h-12 w-12" /> : <Play className="h-12 w-12" />}
            </Button>
            <Button onClick={handleFastForward} variant="ghost" size="icon" className="h-14 w-14 rounded-full text-white hover:bg-white/20 hover:text-white">
              <RotateCw className="h-8 w-8" />
            </Button>
          </div>

          {/* Bottom Control Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
            <div className="w-full">
              <Slider
                min={0}
                max={1}
                step={0.001}
                value={[played]}
                onValueChange={handleSeekChange}
                onMouseDown={handleSeekMouseDown}
                onMouseUp={handleSeekMouseUp}
                className="w-full h-2 group"
              />
            </div>
            <div className="flex items-center justify-between text-white text-sm">
                <div className="flex items-center gap-4">
                  <Button onClick={handlePlayPause} variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white">
                      {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>

                  <Button onClick={() => setMuted(!muted)} variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white">
                      {muted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>

                  <p>
                    {formatDuration(played * duration)} / {formatDuration(duration)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white">
                          <Gauge className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuRadioGroup value={playbackRate} onValueChange={setPlaybackRate}>
                          <DropdownMenuRadioItem value="0.5">0.5x</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="1">1x (Normal)</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="1.5">1.5x</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="2">2x</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button onClick={handleToggleFullscreen} variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white">
                      {fullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-h-5" />}
                    </Button>
                </div>
            </div>
          </div>
        </div>
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
