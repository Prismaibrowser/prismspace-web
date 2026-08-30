// Bookmark Canvas — Shared TypeScript Interfaces

export interface Bookmark {
  id?: number;
  title: string;
  url: string;
  favicon: string;
  notes: string;
  color: string;
  favorite: boolean;
  pinned: boolean;
  category: string;
  x: number;
  y: number;
  width: number;
  height: number;
  createdAt: Date;
  updatedAt: Date;
  lastVisited?: Date;
  visitCount: number;
}

export interface CanvasCamera {
  x: number;
  y: number;
  scale: number;
}

export interface BookmarkFormData {
  title: string;
  url: string;
  category: string;
  notes: string;
  color: string;
  favorite: boolean;
}

export type BookmarkAction =
  | 'open'
  | 'edit'
  | 'delete'
  | 'duplicate'
  | 'copy-url'
  | 'change-color'
  | 'pin'
  | 'favorite';

export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  bookmarkId: number | null;
}

export const STICKY_COLORS = [
  { value: '#FFF59D', label: 'Yellow' },
  { value: '#FFCCBC', label: 'Peach' },
  { value: '#B2DFDB', label: 'Teal' },
  { value: '#BBDEFB', label: 'Blue' },
  { value: '#D1C4E9', label: 'Lavender' },
  { value: '#C8E6C9', label: 'Green' },
  { value: '#F8BBD0', label: 'Pink' },
  { value: '#ECEFF1', label: 'Silver' },
] as const;

export const DEFAULT_CARD_WIDTH = 280;
export const DEFAULT_CARD_HEIGHT = 200;
export const MIN_CARD_WIDTH = 200;
export const MIN_CARD_HEIGHT = 150;
export const MAX_CARD_WIDTH = 600;
export const MAX_CARD_HEIGHT = 800;

export const GRID_SNAP = 20;
export const MIN_SCALE = 0.2;
export const MAX_SCALE = 3;
export const ZOOM_STEP = 0.1;

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
