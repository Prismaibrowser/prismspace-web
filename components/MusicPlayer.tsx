'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Pause, Play, Volume2, VolumeX, List } from 'lucide-react';
import { LiquidGlassCard } from './kokonutui/liquid-glass-card';
import { cn } from '@/lib/utils';
import { defaultPlaylist, type Track } from '@/lib/musicData';

const VOLUME_BAR_COUNT = 8;
const MIN_TIME = 0;
const BAR_DELAY_INCREMENT = 0.1;
const PROGRESS_PERCENTAGE_MULTIPLIER = 100;

const formatTime = (timeInSeconds: number): string => {
  if (isNaN(timeInSeconds)) return '0:00';
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

interface VolumeBarsProps {
  isPlaying: boolean;
}

const VolumeBars = React.memo(({ isPlaying }: VolumeBarsProps) => {
  const bars = Array.from({ length: VOLUME_BAR_COUNT }, (_, i) => ({
    id: `bar-${i}`,
    delay: i * BAR_DELAY_INCREMENT,
  }));

  return (
    <div className="pointer-events-none flex h-8 w-10 items-end gap-0.5">
      {bars.map((bar) => (
        <div
          key={bar.id}
          className={cn(
            'w-[3px] rounded-sm transition-all duration-300',
            isPlaying && 'animate-bounce-music'
          )}
          style={{
            height: isPlaying ? undefined : '6px',
            animationDelay: `${bar.delay}s`,
            background: 'linear-gradient(to top, #FF2E55, #FF6B88)',
          }}
        />
      ))}
    </div>
  );
});
VolumeBars.displayName = 'VolumeBars';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (newTime: number) => void;
}

const ProgressBar = React.memo(({ currentTime, duration, onSeek }: ProgressBarProps) => {
  const progress = duration > 0 ? (currentTime / duration) * PROGRESS_PERCENTAGE_MULTIPLIER : 0;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const newTime = Math.min(Math.max(MIN_TIME, percent * duration), duration);
    onSeek(newTime);
  };

  return (
    <>
      <div className="flex justify-between font-medium text-xs text-white/70">
        <span className="tabular-nums">{formatTime(currentTime)}</span>
        <span className="tabular-nums">{formatTime(duration)}</span>
      </div>
      <div
        role="slider"
        aria-label="Seek progress bar"
        aria-valuemin={MIN_TIME}
        aria-valuemax={duration}
        aria-valuenow={currentTime}
        className="relative z-10 h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-white/20 hover:bg-white/30 transition-colors"
        onClick={handleClick}
        tabIndex={0}
      >
        <div
          className="h-full bg-gradient-to-r from-[#FF2E55] to-[#FF6B88] transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>
    </>
  );
});
ProgressBar.displayName = 'ProgressBar';

interface Track {
  id: number;
  title: string;
  artist: string;
  cover: string;
  url: string;
}

interface MusicPlayerProps {
  playlist?: Track[];
  autoPlay?: boolean;
}

export function MusicPlayer({ playlist = defaultPlaylist, autoPlay = false }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const currentTrack = playlist[currentTrackIndex];
  const hasPlaylist = playlist.length > 0;

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleEnded = () => {
      handleNext();
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('waiting', handleWaiting);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('waiting', handleWaiting);
    };
  }, []);

  // Load new track
  useEffect(() => {
    if (audioRef.current && currentTrack && hasPlaylist) {
      setIsLoading(true);
      audioRef.current.src = currentTrack.url;
      audioRef.current.load();
      
      if (autoPlay || isPlaying) {
        audioRef.current.play().catch((error) => {
          console.error('Playback failed:', error);
          setIsPlaying(false);
          setIsLoading(false);
        });
      }
    }
  }, [currentTrackIndex, hasPlaylist]);

  const handlePlayPause = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((error) => {
          console.error('Playback failed:', error);
          setIsPlaying(false);
        });
    }
  };

  const handleSeek = (newTime: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handlePrevious = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentTrackIndex((prev) => (prev === 0 ? playlist.length - 1 : prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentTrackIndex((prev) => (prev === playlist.length - 1 ? 0 : prev + 1));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const handleMuteToggle = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTrackSelect = (index: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentTrackIndex(index);
    setShowPlaylist(false);
  };

  return (
    <div className="w-full max-w-sm relative" onClick={(e) => e.stopPropagation()}>
      {!hasPlaylist ? (
        // Empty State
        <LiquidGlassCard className="gap-4 rounded-3xl border border-white/20 bg-white/5 backdrop-blur-xl p-6 shadow-xl">
          <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
            <div className="text-6xl mb-2">🎵</div>
            <h3 className="font-semibold text-xl text-white">No Music Yet</h3>
            <p className="text-sm text-white/60 max-w-xs leading-relaxed">
              Add your music files to start playing.
              <br />
              Edit <code className="text-xs bg-white/10 px-2 py-1 rounded">lib/musicData.ts</code> to add tracks.
            </p>
            <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10 text-left w-full">
              <p className="text-xs text-white/50 font-mono mb-2">Quick Start:</p>
              <ol className="text-xs text-white/70 space-y-1 list-decimal list-inside">
                <li>Create <code className="bg-white/10 px-1 rounded">public/music</code> folder</li>
                <li>Add your MP3 files</li>
                <li>Update the playlist array</li>
                <li>Restart the app</li>
              </ol>
            </div>
          </div>
        </LiquidGlassCard>
      ) : (
        // Player with Music
        <LiquidGlassCard className="gap-3.5 rounded-3xl border border-white/20 bg-white/5 backdrop-blur-xl p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="relative mr-2 mb-4 h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-pink-400 via-pink-300 to-rose-200 shadow-lg ring-1 ring-white/20">
            <img
              alt={`Album art for ${currentTrack.title}`}
              className="h-full w-full object-cover"
              src={currentTrack.cover}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=Music';
              }}
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
              </div>
            )}
          </div>

          <div className="flex-1 overflow-hidden">
            <h3 className="overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-lg text-white">
              {currentTrack.title}
            </h3>
            <p className="mt-0.5 text-sm text-white/70">{currentTrack.artist}</p>
          </div>

          <VolumeBars isPlaying={isPlaying} />
        </div>

        <div className="flex flex-col gap-2">
          <ProgressBar currentTime={currentTime} duration={duration} onSeek={handleSeek} />

          <div className="mt-1 flex items-center justify-between">
            <div className="flex items-center justify-center gap-2">
              <button
                aria-label="Previous track"
                className="h-10 w-10 rounded-full bg-white/5 text-white hover:bg-white/10 transition-all flex items-center justify-center"
                onClick={handlePrevious}
              >
                <ArrowLeft className="size-4" />
              </button>
              <button
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="h-11 w-11 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handlePlayPause}
                disabled={isLoading}
              >
                {isPlaying ? <Pause className="size-5" /> : <Play className="size-5 ml-0.5" />}
              </button>
              <button
                aria-label="Next track"
                className="h-10 w-10 rounded-full bg-white/5 text-white hover:bg-white/10 transition-all flex items-center justify-center"
                onClick={handleNext}
              >
                <ArrowRight className="size-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                className="h-10 w-10 rounded-full bg-white/5 text-white hover:bg-white/10 transition-all flex items-center justify-center"
                onClick={handleMuteToggle}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="size-4" />
                ) : (
                  <Volume2 className="size-4" />
                )}
              </button>
              <button
                aria-label="Show playlist"
                className="h-10 w-10 rounded-full bg-white/5 text-white hover:bg-white/10 transition-all flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPlaylist(!showPlaylist);
                }}
              >
                <List className="size-4" />
              </button>
            </div>
          </div>

          {/* Volume Slider */}
          <div className="flex items-center gap-2 mt-1" onClick={(e) => e.stopPropagation()}>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-[#FF2E55] [&::-webkit-slider-thumb]:to-[#FF6B88] [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>
        </div>
      </LiquidGlassCard>
      )}

      {/* Playlist Dropdown */}
      {showPlaylist && hasPlaylist && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-white/20 bg-black/80 backdrop-blur-xl p-2 shadow-xl z-50 max-h-64 overflow-y-auto">
          {playlist.map((track, index) => (
            <button
              key={track.id}
              onClick={(e) => handleTrackSelect(index, e)}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-white/10',
                index === currentTrackIndex && 'bg-white/5'
              )}
            >
              <img
                src={track.cover}
                alt={track.title}
                className="w-10 h-10 rounded-lg object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=♪';
                }}
              />
              <div className="flex-1 text-left">
                <div className="font-medium text-sm text-white">{track.title}</div>
                <div className="text-xs text-white/60">{track.artist}</div>
              </div>
              {index === currentTrackIndex && isPlaying && (
                <div className="flex gap-0.5">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-0.5 h-3 bg-gradient-to-t from-[#FF2E55] to-[#FF6B88] rounded-full animate-bounce-music"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes bounce-music {
          0%, 100% { height: 6px; }
          50% { height: 16px; }
        }
        .animate-bounce-music {
          animation: bounce-music 0.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
