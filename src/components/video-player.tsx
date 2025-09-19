
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
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  Settings,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Slider } from './ui/slider';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

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
      if (!isFs) {
        try {
          screen.orientation.unlock();
        } catch (e) {
          console.warn("Could not unlock screen orientation:", e);
        }
      }
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

  const handleToggleFullscreen = async () => {
    const container = playerContainerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      try {
        await container.requestFullscreen();
        await screen.orientation.lock('landscape');
      } catch (err) {
        console.error("Fullscreen or orientation lock failed:", err);
      }
    } else {
      try {
        await document.exitFullscreen();
      } catch (err) {
        console.error("Exit fullscreen failed:", err);
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

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume[0]);
    setMuted(newVolume[0] === 0);
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
            playbackRate={parseFloat(playbackRate)}
            volume={volume}
            muted={muted}
            onProgress={handleProgress}
            onDuration={setDuration}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onClick={handlePlayPause}
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
          "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300",
          controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          {/* Main Play/Pause Button in Center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Button onClick={handlePlayPause} variant="ghost" size="icon" className="h-20 w-20 rounded-full text-white bg-black/30 hover:bg-black/50 hover:text-white">
              {playing ? <Pause className="h-12 w-12" /> : <Play className="h-12 w-12" />}
            </Button>
          </div>

          {/* Bottom Control Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col gap-2 text-white">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono">{formatDuration(played * duration)}</span>
              <Slider
                min={0}
                max={0.999999}
                step={0.001}
                value={[played]}
                onValueChange={handleSeekChange}
                onMouseDown={handleSeekMouseDown}
                onValueChangeCommit={handleSeekMouseUp}
                className="w-full h-2 group"
              />
              <span className="text-xs font-mono">{formatDuration(duration)}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white">
                      <Settings className="h-5 w-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 bg-black/80 border-white/20 text-white p-2">
                    <div className="space-y-2">
                      <DropdownMenuLabel className='px-2 py-1.5'>Playback Speed</DropdownMenuLabel>
                      <DropdownMenuRadioGroup value={playbackRate} onValueChange={setPlaybackRate} className="px-2">
                        <DropdownMenuRadioItem value="0.5">0.5x</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="1">1x (Normal)</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="1.5">1.5x</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="2">2x</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                      <DropdownMenuSeparator className='bg-white/20' />
                       <div className='flex items-center gap-2 px-2 py-1.5'>
                         <button onClick={() => setMuted(!muted)}>
                           {muted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                         </button>
                         <Slider 
                           min={0}
                           max={1}
                           step={0.05}
                           value={[volume]}
                           onValueChange={handleVolumeChange}
                         />
                       </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-center gap-1">
                <Button onClick={handleToggleFullscreen} variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white">
                  {fullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
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

    