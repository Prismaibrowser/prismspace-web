'use client';

import { memo, useCallback, useState } from 'react';
import { Rnd } from 'react-rnd';
import { motion, AnimatePresence } from 'motion/react';
import {
  Star,
  Pin,
  ExternalLink,
  MoreHorizontal,
} from 'lucide-react';
import type { Bookmark } from '@/lib/bookmark-canvas/types';
import {
  MIN_CARD_WIDTH,
  MIN_CARD_HEIGHT,
  MAX_CARD_WIDTH,
  MAX_CARD_HEIGHT,
  GRID_SNAP,
} from '@/lib/bookmark-canvas/types';
import { getDomain, getTextColor, getStickyRotation, formatRelativeTime } from '@/lib/bookmark-canvas/utils';

interface BookmarkCardProps {
  bookmark: Bookmark;
  isSelected: boolean;
  scale: number;
  onSelect: (id: number) => void;
  onDoubleClick: (bookmark: Bookmark) => void;
  onDragStop: (id: number, x: number, y: number) => void;
  onResizeStop: (id: number, width: number, height: number) => void;
  onContextMenu: (e: React.MouseEvent, id: number) => void;
  onToggleFavorite: (id: number) => void;
  onTogglePin: (id: number) => void;
}

export const BookmarkCard = memo(function BookmarkCard({
  bookmark,
  isSelected,
  scale,
  onSelect,
  onDoubleClick,
  onDragStop,
  onResizeStop,
  onContextMenu,
  onToggleFavorite,
  onTogglePin,
}: BookmarkCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const id = bookmark.id!;
  const textColor = getTextColor(bookmark.color);
  const rotation = getStickyRotation(id);
  const domain = getDomain(bookmark.url);
  const isLight = textColor === '#1a1a2e';

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect(id);
    },
    [id, onSelect]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDoubleClick(bookmark);
    },
    [bookmark, onDoubleClick]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onContextMenu(e, id);
    },
    [id, onContextMenu]
  );

  return (
    <Rnd
      position={{ x: bookmark.x, y: bookmark.y }}
      size={{ width: bookmark.width, height: bookmark.height }}
      minWidth={MIN_CARD_WIDTH}
      minHeight={MIN_CARD_HEIGHT}
      maxWidth={MAX_CARD_WIDTH}
      maxHeight={MAX_CARD_HEIGHT}
      dragGrid={[GRID_SNAP, GRID_SNAP]}
      resizeGrid={[GRID_SNAP, GRID_SNAP]}
      scale={scale}
      enableResizing
      bounds="parent"
      style={{
        zIndex: bookmark.pinned ? 20 : isSelected ? 15 : 10,
      }}
      onDragStart={() => {
        setIsDragging(true);
        onSelect(id);
      }}
      onDragStop={(_e, d) => {
        setIsDragging(false);
        onDragStop(id, d.x, d.y);
      }}
      onResizeStop={(_e, _dir, ref, _delta, pos) => {
        onResizeStop(
          id,
          parseInt(ref.style.width),
          parseInt(ref.style.height)
        );
        onDragStop(id, pos.x, pos.y);
      }}
      cancel=".no-drag"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="w-full h-full select-none"
        style={{
          transform: `rotate(${isDragging ? 0 : rotation}deg)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="w-full h-full flex flex-col overflow-hidden cursor-grab active:cursor-grabbing"
          style={{
            background: bookmark.color,
            borderRadius: '12px',
            boxShadow: isSelected
              ? `0 0 0 2px oklch(0.65 0.25 270), 0 12px 40px oklch(0 0 0 / 40%)`
              : isHovered
              ? `0 8px 30px oklch(0 0 0 / 35%)`
              : `0 4px 16px oklch(0 0 0 / 28%)`,
            transition: 'box-shadow 0.2s ease',
            color: textColor,
          }}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          onContextMenu={handleContextMenu}
        >
          {/* Header */}
          <div
            className="flex items-start gap-2 px-3 pt-3 pb-2"
            style={{
              borderBottom: `1px solid ${isLight ? 'rgba(26,26,46,0.1)' : 'rgba(255,255,255,0.15)'}`,
            }}
          >
            {/* Favicon */}
            <div className="shrink-0 w-6 h-6 rounded-md overflow-hidden mt-0.5 flex items-center justify-center"
              style={{ background: isLight ? 'rgba(26,26,46,0.08)' : 'rgba(255,255,255,0.15)' }}>
              {bookmark.favicon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={bookmark.favicon}
                  alt=""
                  className="w-4 h-4 object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <ExternalLink size={10} style={{ color: textColor, opacity: 0.5 }} />
              )}
            </div>

            {/* Title & domain */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-tight truncate" style={{ color: textColor }}>
                {bookmark.title}
              </p>
              <p className="text-xs opacity-60 truncate mt-0.5" style={{ color: textColor }}>
                {domain}
              </p>
            </div>

            {/* Action buttons */}
            <div className={`flex items-center gap-0.5 no-drag shrink-0 transition-opacity ${isHovered || isSelected ? 'opacity-100' : 'opacity-0'}`}>
              <button
                className="p-1 rounded-md hover:bg-black/10 transition-colors"
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(id); }}
                title="Toggle Favorite"
              >
                <Star
                  size={12}
                  fill={bookmark.favorite ? 'currentColor' : 'none'}
                  style={{ color: bookmark.favorite ? '#f59e0b' : textColor, opacity: bookmark.favorite ? 1 : 0.5 }}
                />
              </button>
              <button
                className="p-1 rounded-md hover:bg-black/10 transition-colors"
                onClick={(e) => { e.stopPropagation(); onTogglePin(id); }}
                title="Toggle Pin"
              >
                <Pin
                  size={12}
                  fill={bookmark.pinned ? 'currentColor' : 'none'}
                  style={{ color: bookmark.pinned ? '#8b5cf6' : textColor, opacity: bookmark.pinned ? 1 : 0.5 }}
                />
              </button>
              <button
                className="p-1 rounded-md hover:bg-black/10 transition-colors no-drag"
                onClick={handleContextMenu}
                title="More options"
              >
                <MoreHorizontal size={12} style={{ color: textColor, opacity: 0.5 }} />
              </button>
            </div>
          </div>

          {/* Notes body */}
          {bookmark.notes ? (
            <div className="flex-1 px-3 py-2 overflow-hidden">
              <p
                className="text-xs leading-relaxed line-clamp-5 font-mono"
                style={{ color: textColor, opacity: 0.75 }}
              >
                {bookmark.notes}
              </p>
            </div>
          ) : (
            <div className="flex-1" />
          )}

          {/* Footer */}
          <div
            className="flex items-center justify-between px-3 pb-2.5 pt-1.5 flex-shrink-0"
            style={{
              borderTop: `1px solid ${isLight ? 'rgba(26,26,46,0.08)' : 'rgba(255,255,255,0.12)'}`,
            }}
          >
            {/* Category badge */}
            {bookmark.category ? (
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                style={{
                  background: isLight ? 'rgba(26,26,46,0.1)' : 'rgba(255,255,255,0.2)',
                  color: textColor,
                }}
              >
                {bookmark.category}
              </span>
            ) : <span />}

            {/* Visit counter + last visited */}
            <div className="flex items-center gap-1.5">
              {bookmark.visitCount > 0 && (
                <span
                  className="text-[10px] opacity-55"
                  style={{ color: textColor }}
                  title={`Last visited: ${formatRelativeTime(bookmark.lastVisited)}`}
                >
                  {bookmark.visitCount} visit{bookmark.visitCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Pinned indicator */}
          <AnimatePresence>
            {bookmark.pinned && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: '#8b5cf6', boxShadow: '0 2px 8px rgba(139,92,246,0.5)' }}
              >
                <Pin size={9} fill="white" color="white" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </Rnd>
  );
});
