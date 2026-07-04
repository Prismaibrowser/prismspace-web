'use client';

import { useState, useEffect } from 'react';
import { X, Minimize2, Maximize2 } from 'lucide-react';
import { MusicPlayer } from './MusicPlayer';

interface FloatingMusicPlayerProps {
  onClose: () => void;
}

export function FloatingMusicPlayer({ onClose }: FloatingMusicPlayerProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't drag if clicking on buttons or player controls
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('.player-content')) return;
    
    e.preventDefault();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = Math.max(0, Math.min(window.innerWidth - 400, e.clientX - dragOffset.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 200, e.clientY - dragOffset.y));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  return (
    <div
      className="fixed z-[200]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        pointerEvents: 'auto',
      }}
    >
      <div className="relative select-none">
        {/* Header Bar */}
        <div
          className="absolute -top-10 left-0 right-0 h-10 bg-black/80 backdrop-blur-xl border border-white/20 rounded-t-2xl flex items-center justify-between px-4"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-2">
            <span className="text-white text-sm font-medium">🎵 Music Player</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white/70 hover:text-white transition-colors p-1"
              title={isMinimized ? 'Maximize' : 'Minimize'}
            >
              {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </button>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-red-400 transition-colors p-1"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Player Content */}
        {!isMinimized && (
          <div className="player-content animate-fadeIn">
            <MusicPlayer />
          </div>
        )}

        {/* Minimized State */}
        {isMinimized && (
          <div 
            className="w-full max-w-sm h-12 bg-black/80 backdrop-blur-xl border border-white/20 rounded-b-2xl flex items-center justify-center cursor-pointer"
            onClick={() => setIsMinimized(false)}
          >
            <span className="text-white/50 text-sm">Click to expand</span>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
