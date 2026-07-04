# Music Player Component 🎵

A beautiful, fully-functional music player built with the Liquid Glass Card component that controls browser audio playback.

## Features

✅ **Real Audio Playback** - Uses HTML5 Audio API to play actual music files
✅ **Playlist Support** - Load multiple tracks with album art, titles, and artists
✅ **Full Controls** - Play/Pause, Previous, Next, Seek, Volume control
✅ **Visual Feedback** - Animated volume bars, progress bar, loading states
✅ **Floating & Draggable** - Can be moved anywhere on screen and minimized
✅ **Glass Morphism UI** - Beautiful liquid glass design matching PrismSpace aesthetic
✅ **Responsive** - Works on all screen sizes

## Components

### 1. `MusicPlayer.tsx`
Core music player component with all functionality:
- Audio playback control
- Progress bar with seek functionality
- Volume slider with mute toggle
- Playlist dropdown
- Animated visualizer bars
- Album art display

### 2. `FloatingMusicPlayer.tsx`
Wrapper that makes the player draggable and floating:
- Draggable window
- Minimize/Maximize functionality
- Close button
- Fixed z-index for always-on-top behavior

### 3. Integration in `page.tsx`
- Added to main page with toggle state
- Triggered by music player button in QuickActions

## Usage

### Basic Usage

The music player is already integrated into the app. Just click the 🎵 button in the bottom-left corner of the screen!

### Custom Playlist

To add your own music, edit the `DEFAULT_PLAYLIST` in `components/MusicPlayer.tsx`:

```typescript
const DEFAULT_PLAYLIST = [
  {
    id: 1,
    title: 'Your Song Title',
    artist: 'Artist Name',
    cover: 'https://your-image-url.com/cover.jpg', // Or local /images/cover.jpg
    url: 'https://your-music-url.com/song.mp3' // Or local /music/song.mp3
  },
  // Add more tracks...
];
```

### Using Local Music Files

1. Create a `public/music` folder in your project
2. Add your MP3 files there
3. Update the playlist URLs:

```typescript
url: '/music/your-song.mp3'
```

### Custom Component Usage

You can use the music player anywhere in your app:

```tsx
import { MusicPlayer } from '@/components/MusicPlayer';

// With default playlist
<MusicPlayer />

// With custom playlist
<MusicPlayer 
  playlist={customPlaylist}
  autoPlay={true}
/>

// As floating player
import { FloatingMusicPlayer } from '@/components/FloatingMusicPlayer';

<FloatingMusicPlayer onClose={() => setShowPlayer(false)} />
```

## Controls

| Control | Function |
|---------|----------|
| ⏯️ Play/Pause | Start or pause playback |
| ⏮️ Previous | Go to previous track |
| ⏭️ Next | Go to next track |
| 🔊 Volume | Adjust volume (0-100%) |
| 🔇 Mute | Toggle mute on/off |
| 📋 Playlist | Show/hide playlist |
| Progress Bar | Click to seek to position |
| ➖ Minimize | Collapse the player |
| ✖️ Close | Close the player |

## Features in Detail

### Auto-Next Track
When a song finishes, it automatically plays the next track in the playlist (loops back to first track at the end).

### Playlist Management
- Click the playlist button (📋) to view all tracks
- Current playing track is highlighted
- Click any track to jump to it immediately

### Visual Feedback
- **Volume Bars**: Animated bars that bounce with the music
- **Loading State**: Spinner shows when loading a new track
- **Progress Bar**: Visual indicator of playback position with timestamps

### Error Handling
- Gracefully handles failed image loads (shows placeholder)
- Catches and logs audio playback errors
- Prevents errors from crashing the app

## Customization

### Styling
The player uses Tailwind CSS and can be customized via:
- Color gradients (currently pink/red theme)
- Glass morphism effects in `liquid-glass-card.tsx`
- Animation speeds and effects

### Add More Features

**Loop/Shuffle:**
```typescript
const [isLooping, setIsLooping] = useState(false);
// In useEffect for ended event:
if (isLooping) {
  audioRef.current.currentTime = 0;
  audioRef.current.play();
}
```

**Keyboard Shortcuts:**
```typescript
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.code === 'Space') handlePlayPause();
    if (e.code === 'ArrowRight') handleNext();
    if (e.code === 'ArrowLeft') handlePrevious();
  };
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

**Persist State:**
```typescript
// Save current track to localStorage
useEffect(() => {
  localStorage.setItem('currentTrack', currentTrackIndex.toString());
}, [currentTrackIndex]);
```

## Free Music Sources

For testing, you can use these free music sources:

- **SoundHelix** (used in demo): https://www.soundhelix.com/audio-examples
- **Free Music Archive**: https://freemusicarchive.org
- **YouTube Audio Library**: https://studio.youtube.com/channel/UC/music
- **Incompetech**: https://incompetech.com/music/royalty-free/music.html
- **Bensound**: https://www.bensound.com

**Note:** Always respect copyright and licensing requirements!

## Technical Details

### Audio API
- Uses `HTMLAudioElement` for playback
- Event listeners for: `timeupdate`, `loadedmetadata`, `ended`, `canplay`, `waiting`
- Proper cleanup in useEffect return functions

### Performance
- Memoized components with `React.memo`
- Optimized re-renders
- Efficient event handling

### Browser Compatibility
- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Requires user interaction to start playback (autoplay policy)
- Falls back gracefully if audio not supported

## Troubleshooting

**Music won't play:**
- Check browser console for CORS errors
- Ensure audio URLs are accessible
- Try local files instead of external URLs
- Check browser autoplay policies

**Dragging not working:**
- Make sure you're dragging the header bar, not the player content
- Check z-index conflicts with other components

**Playlist not showing:**
- Check console for errors
- Verify playlist array structure matches expected format

## Future Enhancements

Potential features to add:
- [ ] Equalizer visualization
- [ ] Playlist editing (add/remove tracks)
- [ ] Save playlists to database (Dexie.js integration)
- [ ] Lyrics display
- [ ] Shuffle mode
- [ ] Repeat modes (one, all, none)
- [ ] Keyboard shortcuts
- [ ] Mini player mode
- [ ] Integration with music streaming APIs (Spotify, SoundCloud)

## License

Part of PrismSpace Web - MIT License
