/**
 * Music Player Playlist Data
 * 
 * Customize this file to add your own music tracks.
 * You can use local files from /public/music or external URLs.
 */

export interface Track {
  id: number;
  title: string;
  artist: string;
  cover: string; // Image URL or path to /public/images
  url: string;   // Audio file URL or path to /public/music
}

/**
 * Default Playlist - Empty by default, add your own tracks!
 */
export const defaultPlaylist: Track[] = [];

/**
 * Example: How to add your tracks
 * 
 * Uncomment and modify the example below:
 */
/*
export const defaultPlaylist: Track[] = [
  {
    id: 1,
    title: 'Your Song Title',
    artist: 'Artist Name',
    cover: 'https://your-image-url.com/cover.jpg',
    url: 'https://your-music-url.com/song.mp3'
  },
  {
    id: 2,
    title: 'Another Song',
    artist: 'Another Artist',
    cover: '/images/covers/cover2.jpg',
    url: '/music/song2.mp3'
  }
];
*/

/**
 * Example: Using local files
 * 
 * 1. Create a /public/music folder
 * 2. Add your MP3 files there
 * 3. Create a /public/images/covers folder for album art
 * 4. Use like this:
 */
export const localPlaylistExample: Track[] = [
  {
    id: 1,
    title: 'My Local Song',
    artist: 'Me',
    cover: '/images/covers/song1.jpg',
    url: '/music/song1.mp3'
  },
  // Add more...
];

/**
 * Example: Different genres
 */
export const chillPlaylist: Track[] = [
  {
    id: 1,
    title: 'Coffee Shop Vibes',
    artist: 'Lo-Fi Collective',
    cover: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=200&h=200&fit=crop',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
  },
];

export const codingPlaylist: Track[] = [
  {
    id: 1,
    title: 'Deep Focus',
    artist: 'Code Beats',
    cover: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=200&h=200&fit=crop',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
  },
];

/**
 * Helper function to create a track
 */
export function createTrack(
  id: number,
  title: string,
  artist: string,
  cover: string,
  url: string
): Track {
  return { id, title, artist, cover, url };
}

/**
 * Helper to load playlist from localStorage
 */
export function loadPlaylistFromStorage(): Track[] | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem('musicPlayerPlaylist');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load playlist from storage:', error);
  }
  
  return null;
}

/**
 * Helper to save playlist to localStorage
 */
export function savePlaylistToStorage(playlist: Track[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('musicPlayerPlaylist', JSON.stringify(playlist));
  } catch (error) {
    console.error('Failed to save playlist to storage:', error);
  }
}

/**
 * Get the active playlist (from storage or default)
 */
export function getActivePlaylist(): Track[] {
  return loadPlaylistFromStorage() || defaultPlaylist;
}
