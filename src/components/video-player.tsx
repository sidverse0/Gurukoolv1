
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
  RotateCcw,
  RotateCw,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
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
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const hideControls = () => {
    if (playing && !seeking) {
      setControlsVisible(false);
    }
  };

  const showControls = () => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(hideControls, 3000);
  };
  
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
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (playing && !seeking) {
      showControls();
    } else {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      setControlsVisible(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, seeking]);

  const handleSuggestResolution = async () => {
    setIsLoading(true);
    setSuggestion(null);
    try {
      // Mock network speed for demonstration
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

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };
  const handleSeekChange = (newPlayed: number[]) => {
      setPlayed(newPlayed[0]);
  }
  
  const handleSeekMouseUp = () => {
    setSeeking(false);
    if(playerRef.current){
      playerRef.current.seekTo(played);
    }
  };

  const handleSeek = (seconds: number) => {
    const newPlayed = Math.min(Math.max(played + seconds / duration, 0), 1);
    setPlayed(newPlayed);
    playerRef.current?.seekTo(newPlayed);
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

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume[0]);
    setMuted(newVolume[0] === 0);
  };

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.player-controls')) {
      return;
    }
    // Only toggle play/pause if controls are visible to avoid accidental pauses
    if(controlsVisible) {
      handlePlayPause();
    } else {
      showControls();
    }
  }


  return (
    <div className="space-y-4">
      <div
        ref={playerContainerRef}
        className="aspect-video w-full overflow-hidden rounded-lg bg-black relative group/player"
        onMouseMove={showControls}
        onMouseLeave={hideControls}
        onClick={handleContainerClick}
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
            config={{
              file: {
                attributes: {
                  controlsList: 'nodownload',
                  onContextMenu: (e: Event) => e.preventDefault(),
                },
              },
            }}
          />
        ) : (
          <Skeleton className="h-full w-full" />
        )}
        
        <div 
          className={cn(
            "player-controls absolute inset-0 flex items-center justify-center bg-transparent transition-opacity duration-300",
            controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
           <div className="flex items-center justify-center gap-8 md:gap-16">
            <Button onClick={(e) => {e.stopPropagation(); handleSeek(-10);}} variant="ghost" size="icon" className="h-16 w-16 rounded-full text-white bg-transparent hover:bg-transparent hover:text-white">
              <RotateCcw className="h-8 w-8" />
            </Button>
            <Button onClick={(e) => {e.stopPropagation(); handlePlayPause();}} variant="ghost" size="icon" className="h-20 w-20 rounded-full text-white bg-transparent hover:bg-transparent hover:text-white">
              {playing ? <Pause className="h-12 w-12" /> : <Play className="h-12 w-12" />}
            </Button>
             <Button onClick={(e) => {e.stopPropagation(); handleSeek(10);}} variant="ghost" size="icon" className="h-16 w-16 rounded-full text-white bg-transparent hover:bg-transparent hover:text-white">
              <RotateCw className="h-8 w-8" />
            </Button>
          </div>
        </div>
        
        <div className={cn(
          "player-controls absolute bottom-0 left-0 right-0 p-3 transition-opacity duration-300 bg-gradient-to-t from-black/60 via-black/30 to-transparent",
          controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          <div className="flex flex-col gap-2 text-white">
             <div className="flex items-center justify-between text-xs font-mono px-1">
                <span>{formatDuration(played * duration)}</span>
                <span>{formatDuration(duration)}</span>
             </div>
            <div className="flex items-center gap-3">
              <Slider
                min={0}
                max={0.999999}
                step={0.001}
                value={[played]}
                onValueChange={handleSeekChange}
                onMouseDown={handleSeekMouseDown}
                onPointerUp={handleSeekMouseUp}
                className="w-full h-2 group"
                onClick={e => e.stopPropagation()}
              />
              <Button onClick={(e) => {e.stopPropagation(); handleToggleFullscreen();}} variant="ghost" size="icon" className="text-white hover:bg-transparent hover:text-white">
                {fullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        <div className={cn(
          "player-controls absolute top-0 right-0 p-3 transition-opacity duration-300",
           controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button onClick={e => e.stopPropagation()} variant="ghost" size="icon" className="text-white hover:bg-transparent hover:text-white">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent onClick={e => e.stopPropagation()} className="w-48 bg-black/80 border-white/20 text-white p-2 mb-2 mr-2">
              <DropdownMenuGroup>
                <p className='px-2 py-1.5 text-xs font-semibold'>Playback Speed</p>
                <DropdownMenuRadioGroup value={playbackRate} onValueChange={setPlaybackRate} className="px-2">
                  <DropdownMenuRadioItem value="0.5">0.5x</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="1">Normal</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="1.5">1.5x</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="2">2x</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator className='bg-white/20 my-2' />
                  <div className='flex items-center gap-2 px-2 py-1.5'>
                    <button onClick={() => setMuted(!muted)}>
                      {muted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </button>
                    <Slider 
                      min={0}
                      max={1}
                      step={0.05}
                      value={muted ? [0] : [volume]}
                      onValueChange={handleVolumeChange}
                    />
                  </div>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
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
