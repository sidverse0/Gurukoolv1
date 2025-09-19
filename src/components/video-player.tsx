
'use client';

import { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player/lazy';
import type { OnProgressProps } from 'react-player/base';
import { Button } from '@/components/ui/button';
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
  if (isNaN(seconds) || seconds < 0) {
    return '0:00';
  }
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
  const [hasWindow, setHasWindow] = useState(false);

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
    if (playing) {
      setControlsVisible(false);
    }
  };

  const showControls = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setControlsVisible(true);
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
          // Can be ignored
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
    if (playing) {
      showControls();
    } else {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      setControlsVisible(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  const handlePlayPause = () => {
    setPlaying(!playing);
  }
  
  const handleProgress = (state: OnProgressProps) => {
    if (!seeking) {
      setPlayed(state.played);
    }
  };

  const handleSeekPointerDown = () => {
    setSeeking(true);
  };
  
  const handleSeekChange = (newPlayed: number[]) => {
      setPlayed(newPlayed[0]);
  }
  
  const handleSeekPointerUp = (newPlayed: number[]) => {
    setSeeking(false);
    if(playerRef.current){
      playerRef.current.seekTo(newPlayed[0]);
    }
  };

  const handleSeek = (seconds: number) => {
    if (!duration) return;
    const newPlayedTime = (played * duration) + seconds;
    const newPlayed = Math.min(Math.max(newPlayedTime / duration, 0), 1);
    setPlayed(newPlayed);
    playerRef.current?.seekTo(newPlayed);
  };

  const handleToggleFullscreen = async () => {
    const container = playerContainerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      try {
        await container.requestFullscreen();
        screen.orientation.lock('landscape').catch(() => {});
      } catch (err) {
        // Can be ignored
      }
    } else {
      try {
        await document.exitFullscreen();
      } catch (err) {
        // Can be ignored
      }
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume[0]);
    setMuted(newVolume[0] === 0);
  };

  const toggleControls = () => {
    if (controlsVisible) {
      setControlsVisible(false);
    } else {
      showControls();
    }
  }

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.player-controls')) {
      return;
    }
    toggleControls();
  }


  return (
    <div className="space-y-4">
      <div
        ref={playerContainerRef}
        className="aspect-video w-full overflow-hidden rounded-lg bg-black relative group/player"
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
            light={false}
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
            <Button onClick={() => handleSeek(-10)} variant="ghost" size="icon" className="h-16 w-16 rounded-full text-white bg-black/30 hover:bg-black/40">
              <RotateCcw className="h-8 w-8" />
            </Button>
            <Button onClick={handlePlayPause} variant="ghost" size="icon" className="h-24 w-24 rounded-full text-white bg-black/30 hover:bg-black/40">
              {playing ? <Pause className="h-16 w-16" /> : <Play className="h-16 w-16" />}
            </Button>
             <Button onClick={() => handleSeek(10)} variant="ghost" size="icon" className="h-16 w-16 rounded-full text-white bg-black/30 hover:bg-black/40">
              <RotateCw className="h-8 w-8" />
            </Button>
          </div>
        </div>
        
        <div className={cn(
          "player-controls absolute bottom-0 left-0 right-0 p-3 transition-opacity duration-300 bg-gradient-to-t from-black/60 via-black/30 to-transparent",
          controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          <div className="flex flex-col gap-2 text-white">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono">{formatDuration(played * duration)}</span>
              <Slider
                min={0}
                max={0.999999}
                step={0.001}
                value={[played]}
                onValueChange={handleSeekChange}
                onPointerDown={handleSeekPointerDown}
                onValueCommit={handleSeekPointerUp}
                className="w-full h-2 group"
              />
              <span className="text-xs font-mono">{formatDuration(duration)}</span>
              <Button onClick={handleToggleFullscreen} variant="ghost" size="icon" className="text-white hover:bg-transparent hover:text-white/80">
                {fullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        <div className={cn(
          "player-controls absolute top-0 right-0 p-3 transition-opacity duration-300",
           controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          {!fullscreen && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-transparent hover:text-white/80">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-black/80 border-white/20 text-white p-2 mb-2 mr-2">
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
          )}
        </div>
      </div>
    </div>
  );
}
