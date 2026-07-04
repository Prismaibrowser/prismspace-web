# How to Add Music to the Player 🎵

The music player is now empty by default. Here's how to add your own music:

## Method 1: Using Local Files (Recommended)

### Step 1: Create Folders
```bash
# In your project root
mkdir public\music
mkdir public\images\covers
```

### Step 2: Add Your Files
- Put your MP3 files in `public/music/`
- Put album cover images in `public/images/covers/`

### Step 3: Edit the Playlist
Open `lib/musicData.ts` and update the playlist:

```typescript
export const defaultPlaylist: Track[] = [
  {
    id: 1,
    title: 'My Favorite Song',
    artist: 'Artist Name',
    cover: '/images/covers/song1.jpg',
    url: '/music/song1.mp3'
  },
  {
    id: 2,
    title: 'Another Great Track',
    artist: 'Another Artist',
    cover: '/images/covers/song2.jpg',
    url: '/music/song2.mp3'
  },
  // Add more tracks...
];
```

### Step 4: Restart the App
```bash
npm run dev
```

## Method 2: Using External URLs

If you have music hosted online, you can use direct URLs:

```typescript
export const defaultPlaylist: Track[] = [
  {
    id: 1,
    title: 'Online Song',
    artist: 'Artist Name',
    cover: 'https://example.com/cover.jpg',
    url: 'https://example.com/song.mp3'
  }
];
```

**Note:** Make sure the URLs support CORS (Cross-Origin Resource Sharing), otherwise the browser will block them.

## Method 3: Free Music Sources

For testing, you can use these free music sources:

### Free Music Archive
```typescript
{
  id: 1,
  title: 'Free Music Track',
  artist: 'Free Artist',
  cover: 'https://example.com/cover.jpg',
  url: 'https://files.freemusicarchive.org/path/to/song.mp3'
}
```

### SoundHelix (Generated Music)
```typescript
{
  id: 1,
  title: 'Generated Track',
  artist: 'SoundHelix',
  cover: 'https://via.placeholder.com/200',
  url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
}
```

## Track Object Reference

Each track must have these fields:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | number | Unique identifier | `1` |
| `title` | string | Song title | `"Chill Vibes"` |
| `artist` | string | Artist name | `"Lo-Fi Beats"` |
| `cover` | string | Image URL or path | `"/images/covers/cover1.jpg"` |
| `url` | string | Audio file URL or path | `"/music/song1.mp3"` |

## Example: Complete Playlist

```typescript
import type { Track } from './musicData';

export const defaultPlaylist: Track[] = [
  {
    id: 1,
    title: 'Morning Coffee',
    artist: 'Café Beats',
    cover: '/images/covers/morning.jpg',
    url: '/music/morning-coffee.mp3'
  },
  {
    id: 2,
    title: 'Focus Flow',
    artist: 'Deep Work',
    cover: '/images/covers/focus.jpg',
    url: '/music/focus-flow.mp3'
  },
  {
    id: 3,
    title: 'Night Coding',
    artist: 'Synthwave Studios',
    cover: '/images/covers/night.jpg',
    url: '/music/night-coding.mp3'
  },
  {
    id: 4,
    title: 'Debug Session',
    artist: 'Code Music',
    cover: '/images/covers/debug.jpg',
    url: '/music/debug-session.mp3'
  }
];
```

## Tips

### Image Covers
- Use square images (200x200px or larger)
- Supported formats: JPG, PNG, WebP
- If cover fails to load, a placeholder will show

### Audio Files
- Supported formats: MP3, WAV, OGG
- MP3 is recommended for best compatibility
- Keep file sizes reasonable (3-10MB per song)

### File Naming
Use lowercase with hyphens for URLs:
- ✅ `morning-coffee.mp3`
- ✅ `album-cover-1.jpg`
- ❌ `Morning Coffee.mp3`
- ❌ `Album Cover 1.jpg`

## Troubleshooting

### Music Doesn't Play
1. Check browser console (F12) for errors
2. Verify file paths are correct
3. Make sure files exist in `public/` folder
4. Try with absolute URLs first to test

### Cover Images Don't Show
1. Check image paths
2. Verify images exist in `public/images/covers/`
3. Try with placeholder URL: `https://via.placeholder.com/200`

### CORS Errors with External URLs
External URLs might be blocked. Solutions:
1. Use local files instead
2. Find URLs that support CORS
3. Use a proxy service (not recommended for production)

## Empty State

When there's no playlist, the player will show:
- 🎵 Empty state message
- Instructions to add music
- Link to edit `lib/musicData.ts`

## Advanced: Dynamic Playlists

You can create multiple playlists:

```typescript
// In lib/musicData.ts
export const chillPlaylist: Track[] = [...];
export const codingPlaylist: Track[] = [...];
export const workoutPlaylist: Track[] = [...];

// Use different playlists
<MusicPlayer playlist={codingPlaylist} />
```

## Next Steps

Once you have music playing:
- Customize the player appearance in `components/MusicPlayer.tsx`
- Add keyboard shortcuts
- Implement shuffle/repeat modes
- Save playlists to database (Dexie.js integration)
- Add playlist management UI

---

Need help? Check:
- `MUSIC_PLAYER_README.md` - Full documentation
- `MUSIC_PLAYER_TEST.md` - Testing guide
- `lib/musicData.ts` - Playlist configuration
