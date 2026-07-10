'use client';

import { useCallback, useRef } from 'react';
import {
  Plus,
  Search,
  Download,
  Upload,
  Star,
  ChevronDown,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

interface ToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchRef: React.RefObject<HTMLInputElement | null>;
  categories: string[];
  categoryFilter: string;
  onCategoryChange: (c: string) => void;
  showFavoritesOnly: boolean;
  onToggleFavorites: () => void;
  onAddBookmark: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  totalCount: number;
  filteredCount: number;
}

export function Toolbar({
  searchQuery,
  onSearchChange,
  searchRef,
  categories,
  categoryFilter,
  onCategoryChange,
  showFavoritesOnly,
  onToggleFavorites,
  onAddBookmark,
  onExport,
  onImport,
  scale,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  totalCount,
  filteredCount,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onImport(file);
        e.target.value = '';
      }
    },
    [onImport]
  );

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] h-14 flex items-center gap-2 px-4 border-b border-white/8"
      style={{
        background: 'oklch(0.1 0.015 270 / 90%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* Back button */}
      <Link
        href="/"
        className="flex items-center gap-1.5 text-white/40 hover:text-white/80 transition-colors text-xs mr-1 shrink-0"
      >
        <ArrowLeft size={14} />
        <span className="hidden sm:inline">Back</span>
      </Link>

      {/* Divider */}
      <div className="w-px h-5 bg-white/10 shrink-0" />

      {/* Logo & title */}
      <div className="flex items-center gap-2 shrink-0">
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center text-sm"
          style={{ background: 'oklch(0.55 0.25 270)', boxShadow: '0 2px 8px oklch(0.55 0.25 270 / 40%)' }}
        >
          🔖
        </div>
        <span className="text-sm font-semibold text-white/90 hidden sm:block">Bookmark Canvas</span>
      </div>

      {/* Count */}
      <span className="text-xs text-white/30 shrink-0 hidden md:block">
        {filteredCount !== totalCount ? `${filteredCount} / ${totalCount}` : totalCount}
      </span>

      {/* Search */}
      <div className="flex-1 max-w-xs relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 pointer-events-none" />
        <input
          ref={searchRef}
          type="text"
          placeholder="Search bookmarks… (Ctrl+K)"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white border border-white/20 text-sm text-black placeholder-black/30 focus:outline-none focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/20 transition-all"
        />
      </div>

      {/* Category filter */}
      <div className="relative shrink-0 hidden md:block">
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="appearance-none pl-3 pr-7 py-1.5 rounded-lg bg-white border border-white/20 text-sm text-black focus:outline-none focus:border-violet-400/60 cursor-pointer"
          style={{ backgroundImage: 'none' }}
        >
          <option value="all" style={{ background: '#ffffff', color: '#000000' }}>All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c} style={{ background: '#ffffff', color: '#000000' }}>
              {c}
            </option>
          ))}
        </select>
        <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
      </div>

      {/* Favorites toggle */}
      <button
        onClick={onToggleFavorites}
        title="Show Favorites Only"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-all shrink-0 hidden sm:flex ${
          showFavoritesOnly
            ? 'bg-amber-500/20 border-amber-500/30 text-amber-300'
            : 'bg-white/5 border-white/8 text-white/50 hover:text-white/80'
        }`}
      >
        <Star size={12} fill={showFavoritesOnly ? 'currentColor' : 'none'} />
        <span className="hidden lg:inline">Favorites</span>
      </button>

      <div className="flex-1" />

      {/* Zoom controls */}
      <div className="flex items-center gap-0.5 shrink-0 hidden sm:flex">
        <button
          onClick={onZoomOut}
          className="p-1.5 rounded-lg hover:bg-white/8 text-white/40 hover:text-white/80 transition-colors"
          title="Zoom Out (Ctrl+-)"
        >
          <ZoomOut size={14} />
        </button>
        <button
          onClick={onResetZoom}
          className="px-2 py-1 rounded-lg hover:bg-white/8 text-xs text-white/40 hover:text-white/80 transition-colors min-w-[42px] text-center"
          title="Reset Zoom (Ctrl+0)"
        >
          {Math.round(scale * 100)}%
        </button>
        <button
          onClick={onZoomIn}
          className="p-1.5 rounded-lg hover:bg-white/8 text-white/40 hover:text-white/80 transition-colors"
          title="Zoom In (Ctrl+=)"
        >
          <ZoomIn size={14} />
        </button>
        <button
          onClick={onResetZoom}
          className="p-1.5 rounded-lg hover:bg-white/8 text-white/40 hover:text-white/80 transition-colors"
          title="Fit to screen"
        >
          <Maximize2 size={13} />
        </button>
      </div>

      <div className="w-px h-5 bg-white/10 shrink-0" />

      {/* Import / Export */}
      <button
        onClick={() => fileInputRef.current?.click()}
        title="Import JSON"
        className="p-1.5 rounded-lg hover:bg-white/8 text-white/40 hover:text-white/80 transition-colors shrink-0"
      >
        <Upload size={14} />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        onClick={onExport}
        title="Export JSON"
        className="p-1.5 rounded-lg hover:bg-white/8 text-white/40 hover:text-white/80 transition-colors shrink-0"
      >
        <Download size={14} />
      </button>

      {/* Add bookmark */}
      <button
        onClick={onAddBookmark}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-all active:scale-95 shrink-0"
        style={{
          background: 'oklch(0.55 0.25 270)',
          boxShadow: '0 2px 12px oklch(0.55 0.25 270 / 35%)',
        }}
        title="New Bookmark (Ctrl+N)"
      >
        <Plus size={14} />
        <span className="hidden sm:inline">Add</span>
      </button>
    </div>
  );
}
