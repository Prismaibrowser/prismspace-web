'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ExternalLink,
  Pencil,
  Copy,
  Trash2,
  Star,
  Pin,
  Palette,
  Files,
} from 'lucide-react';
import type { BookmarkAction, ContextMenuState } from '@/lib/bookmark-canvas/types';
import { STICKY_COLORS } from '@/lib/bookmark-canvas/types';

interface ContextMenuProps {
  state: ContextMenuState;
  isPinned: boolean;
  isFavorite: boolean;
  onAction: (action: BookmarkAction, id: number) => void;
  onClose: () => void;
  onColorChange: (id: number, color: string) => void;
}

export function ContextMenu({
  state,
  isPinned,
  isFavorite,
  onAction,
  onClose,
  onColorChange,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (state.visible) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [state.visible, onClose]);

  if (!state.visible || state.bookmarkId === null) return null;

  const id = state.bookmarkId;

  const menuItems = [
    {
      icon: ExternalLink,
      label: 'Open Website',
      action: () => onAction('open', id),
      className: 'text-blue-300',
    },
    {
      icon: Pencil,
      label: 'Edit',
      action: () => onAction('edit', id),
      className: '',
    },
    {
      icon: Files,
      label: 'Duplicate',
      action: () => onAction('duplicate', id),
      className: '',
    },
    {
      icon: Copy,
      label: 'Copy URL',
      action: () => onAction('copy-url', id),
      className: '',
    },
    null, // divider
    {
      icon: Star,
      label: isFavorite ? 'Remove Favorite' : 'Add to Favorites',
      action: () => onAction('favorite', id),
      className: isFavorite ? 'text-amber-300' : '',
    },
    {
      icon: Pin,
      label: isPinned ? 'Unpin Card' : 'Pin Card',
      action: () => onAction('pin', id),
      className: isPinned ? 'text-violet-300' : '',
    },
    null, // divider
    {
      icon: Trash2,
      label: 'Delete',
      action: () => onAction('delete', id),
      className: 'text-red-400',
    },
  ];

  return (
    <AnimatePresence>
      {state.visible && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.92, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: -4 }}
          transition={{ duration: 0.12 }}
          className="fixed z-[200] min-w-[200px] overflow-hidden rounded-xl border border-white/10"
          style={{
            left: state.x,
            top: state.y,
            background: 'oklch(0.14 0.015 270 / 95%)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 40px oklch(0 0 0 / 60%), 0 2px 8px oklch(0 0 0 / 40%)',
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Color palette row */}
          <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-white/8">
            <Palette size={12} className="text-white/40 shrink-0" />
            <div className="flex gap-1">
              {STICKY_COLORS.map((c) => (
                <button
                  key={c.value}
                  title={c.label}
                  className="w-4 h-4 rounded-full transition-transform hover:scale-125 focus:outline-none ring-1 ring-white/20"
                  style={{ background: c.value }}
                  onClick={() => {
                    onColorChange(id, c.value);
                    onClose();
                  }}
                />
              ))}
            </div>
          </div>

          <div className="py-1">
            {menuItems.map((item, i) => {
              if (item === null) {
                return <div key={i} className="my-1 mx-3 h-px bg-white/8" />;
              }
              const Icon = item.icon;
              return (
                <button
                  key={i}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors hover:bg-white/8 focus:bg-white/8 focus:outline-none ${item.className || 'text-white/80'}`}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                >
                  <Icon size={14} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
