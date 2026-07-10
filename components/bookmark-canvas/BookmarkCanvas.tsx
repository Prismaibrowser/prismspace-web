'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from 'react';
import { AnimatePresence } from 'motion/react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { BookmarkCard } from './BookmarkCard';
import { BookmarkModal } from './BookmarkModal';
import { ContextMenu } from './ContextMenu';
import { Toolbar } from './Toolbar';
import { useBookmarks } from '@/hooks/bookmark-canvas/useBookmarks';
import { useCanvas } from '@/hooks/bookmark-canvas/useCanvas';
import { useKeyboardShortcuts } from '@/hooks/bookmark-canvas/useKeyboardShortcuts';
import type { Bookmark, BookmarkFormData, ContextMenuState } from '@/lib/bookmark-canvas/types';
import { copyToClipboard } from '@/lib/bookmark-canvas/utils';

export function BookmarkCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const dropPositionRef = useRef<{ x: number; y: number } | undefined>(undefined);

  // State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    bookmarkId: null,
  });

  // Hooks
  const {
    allBookmarks,
    filteredBookmarks,
    categories,
    selectedId,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    showFavoritesOnly,
    setShowFavoritesOnly,
    setSelectedId,
    // Operations
    addBookmark,
    updateBookmark,
    updatePosition,
    updateSize,
    deleteBookmark,
    undoDelete,
    duplicateBookmark,
    toggleFavorite,
    togglePin,
    recordVisit,
    exportToJson,
    importFromJson,
  } = useBookmarks();

  const { camera, zoomIn, zoomOut, resetZoom } = useCanvas(canvasRef);

  // ── Helpers ────────────────────────────────────────────────────

  const openAddModal = useCallback((position?: { x: number; y: number }) => {
    setEditingBookmark(null);
    dropPositionRef.current = position;
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback((bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    dropPositionRef.current = undefined;
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingBookmark(null);
  }, []);

  const handleModalConfirm = useCallback(
    async (data: BookmarkFormData, position?: { x: number; y: number }) => {
      if (editingBookmark?.id) {
        await updateBookmark(editingBookmark.id, {
          title: data.title,
          url: data.url,
          category: data.category,
          notes: data.notes,
          color: data.color,
          favorite: data.favorite,
        });
        toast.success('Bookmark updated!');
      } else {
        await addBookmark(data, position);
      }
    },
    [editingBookmark, updateBookmark, addBookmark]
  );

  // ── Context menu ────────────────────────────────────────────────

  const openContextMenu = useCallback((e: React.MouseEvent, bookmarkId: number) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, bookmarkId });
    setSelectedId(bookmarkId);
  }, [setSelectedId]);

  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, visible: false }));
  }, []);

  const handleContextAction = useCallback(
    async (action: string, id: number) => {
      const bm = allBookmarks.find((b) => b.id === id);
      if (!bm) return;

      switch (action) {
        case 'open':
          await recordVisit(id);
          window.open(bm.url, '_blank', 'noopener,noreferrer');
          break;
        case 'edit':
          openEditModal(bm);
          break;
        case 'duplicate':
          await duplicateBookmark(id);
          break;
        case 'copy-url':
          await copyToClipboard(bm.url);
          toast.success('URL copied!');
          break;
        case 'favorite':
          await toggleFavorite(id);
          break;
        case 'pin':
          await togglePin(id);
          break;
        case 'delete':
          await deleteBookmark(id);
          break;
      }
    },
    [allBookmarks, recordVisit, openEditModal, duplicateBookmark, toggleFavorite, togglePin, deleteBookmark]
  );

  const handleColorChange = useCallback(
    async (id: number, color: string) => {
      await updateBookmark(id, { color });
    },
    [updateBookmark]
  );

  // ── Card interactions ───────────────────────────────────────────

  const handleCardDoubleClick = useCallback(
    async (bookmark: Bookmark) => {
      if (!bookmark.id) return;
      await recordVisit(bookmark.id);
      window.open(bookmark.url, '_blank', 'noopener,noreferrer');
    },
    [recordVisit]
  );

  // ── Canvas double-click to add ──────────────────────────────────

  const handleCanvasDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).closest('.rnd-resizer, [data-rnd]')) return;
      // Convert screen coords to canvas coords
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left - camera.x) / camera.scale;
      const y = (e.clientY - rect.top - camera.y) / camera.scale;
      openAddModal({ x, y });
    },
    [camera, openAddModal]
  );

  // ── Deselect on canvas click ────────────────────────────────────

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === canvasRef.current || e.target === e.currentTarget) {
        setSelectedId(null);
        closeContextMenu();
      }
    },
    [setSelectedId, closeContextMenu]
  );

  // ── Keyboard shortcuts ──────────────────────────────────────────

  const contextMenuBm = useMemo(
    () => allBookmarks.find((b) => b.id === contextMenu.bookmarkId),
    [allBookmarks, contextMenu.bookmarkId]
  );

  useKeyboardShortcuts({
    onNewBookmark: () => openAddModal(),
    onFocusSearch: () => searchRef.current?.focus(),
    onDeleteSelected: async () => {
      if (selectedId) await deleteBookmark(selectedId);
    },
    onDuplicateSelected: async () => {
      if (selectedId) await duplicateBookmark(selectedId);
    },
    onSave: () => toast.success('All changes saved automatically ✓'),
    onZoomIn: zoomIn,
    onZoomOut: zoomOut,
    onResetZoom: resetZoom,
    onEscape: () => {
      closeModal();
      closeContextMenu();
      setSelectedId(null);
    },
  });

  // Ctrl+Z undo
  const handleUndoKey = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undoDelete();
      }
    },
    [undoDelete]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleUndoKey);
    return () => window.removeEventListener('keydown', handleUndoKey);
  }, [handleUndoKey]);

  // ── Sorted bookmarks (pinned on top) ───────────────────────────

  const sortedBookmarks = useMemo(() => {
    return [...filteredBookmarks].sort((a, b) => {
      if (a.pinned && !b.pinned) return 1;
      if (!a.pinned && b.pinned) return -1;
      return 0;
    });
  }, [filteredBookmarks]);

  const existingUrls = useMemo(
    () => allBookmarks.filter((b) => !editingBookmark || b.id !== editingBookmark.id).map((b) => b.url),
    [allBookmarks, editingBookmark]
  );

  // ── Empty state ────────────────────────────────────────────────

  const isEmpty = allBookmarks.length === 0;

  return (
    <>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: 'oklch(0.18 0.015 270)',
            color: 'white',
            border: '1px solid oklch(1 0 0 / 10%)',
            borderRadius: '12px',
            fontSize: '13px',
          },
          success: {
            iconTheme: { primary: '#8b5cf6', secondary: 'white' },
          },
        }}
      />

      {/* Toolbar */}
      <Toolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchRef={searchRef}
        categories={categories}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        showFavoritesOnly={showFavoritesOnly}
        onToggleFavorites={() => setShowFavoritesOnly((p) => !p)}
        onAddBookmark={() => openAddModal()}
        onExport={exportToJson}
        onImport={importFromJson}
        scale={camera.scale}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
        totalCount={allBookmarks.length}
        filteredCount={filteredBookmarks.length}
      />

      {/* Canvas wrapper */}
      <div
        ref={canvasRef}
        className="fixed inset-0 overflow-hidden"
        style={{
          top: '56px',
          background: 'oklch(0.1 0.012 270)',
          cursor: 'default',
        }}
        onClick={handleCanvasClick}
        onDoubleClick={handleCanvasDoubleClick}
      >
        {/* Dot grid background */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ opacity: 0.4 }}
          aria-hidden
        >
          <defs>
            <pattern
              id="dot-grid"
              x={camera.x % (24 * camera.scale)}
              y={camera.y % (24 * camera.scale)}
              width={24 * camera.scale}
              height={24 * camera.scale}
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx={1}
                cy={1}
                r={1}
                fill="oklch(1 0 0 / 30%)"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-grid)" />
        </svg>

        {/* Camera transform layer */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transformOrigin: '0 0',
            transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`,
            width: '10000px',
            height: '10000px',
          }}
        >
          <AnimatePresence>
            {sortedBookmarks.map((bm) => (
              <BookmarkCard
                key={bm.id}
                bookmark={bm}
                isSelected={selectedId === bm.id}
                scale={camera.scale}
                onSelect={setSelectedId}
                onDoubleClick={handleCardDoubleClick}
                onDragStop={updatePosition}
                onResizeStop={updateSize}
                onContextMenu={openContextMenu}
                onToggleFavorite={toggleFavorite}
                onTogglePin={togglePin}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Empty state */}
        {isEmpty && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <div className="text-center space-y-4">
              <div className="text-6xl opacity-20">🔖</div>
              <div>
                <p className="text-white/30 text-lg font-medium">Your canvas is empty</p>
                <p className="text-white/20 text-sm mt-1">
                  Press{' '}
                  <kbd className="px-1.5 py-0.5 rounded text-xs bg-white/10 text-white/40">Ctrl+N</kbd>
                  {' '}or double-click anywhere to add a bookmark
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Hint strip */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
          <p className="text-white/15 text-xs text-center">
            Scroll to zoom · Space+drag to pan · Double-click canvas to add
          </p>
        </div>
      </div>

      {/* Modals & Overlays */}
      <BookmarkModal
        isOpen={modalOpen}
        editingBookmark={editingBookmark}
        existingUrls={existingUrls}
        dropPosition={dropPositionRef.current}
        onConfirm={handleModalConfirm}
        onClose={closeModal}
      />

      <ContextMenu
        state={contextMenu}
        isPinned={contextMenuBm?.pinned ?? false}
        isFavorite={contextMenuBm?.favorite ?? false}
        onAction={handleContextAction}
        onClose={closeContextMenu}
        onColorChange={handleColorChange}
      />
    </>
  );
}
