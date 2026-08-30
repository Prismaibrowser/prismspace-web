# MatrixDisplay Component

A fully interactive React/TypeScript matrix animation component with multiple animation modes and a playable Snake game.

## Features

### 🎨 Six Animation Modes
1. **Wave** - Smooth sine wave animation
2. **Pulse** - Expanding circular pulse from center
3. **Loader** - Rotating spinner animation
4. **Snake** - Animated snake path traversal
5. **Rain** - Matrix-style falling drops
6. **Spiral** - Rotating spiral pattern

### 🎮 Interactive Snake Game
- Right-click the matrix to open game dialog
- Use arrow keys (↑ ↓ ← →) to control snake
- Collect food to grow and increase score
- Speed increases as you score more points
- Game over detection with visual feedback
- Press Space to restart after game over
- Press Escape to exit game

### ✨ Visual Effects
- Glassy background with backdrop blur
- Hover effects with glow and scale
- Smooth transitions between pixels
- Radial gradients for pixel lighting
- Drop shadow effects for active pixels

## Usage

```tsx
import { MatrixDisplay } from '@/components/tools';

// Basic usage
<MatrixDisplay />

// Custom configuration
<MatrixDisplay
  rows={10}
  cols={10}
  size={12}
  gap={2}
  fps={30}
  brightness={1.2}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `rows` | `number` | `7` | Number of rows in the matrix |
| `cols` | `number` | `7` | Number of columns in the matrix |
| `size` | `number` | `10` | Size of each pixel in pixels |
| `gap` | `number` | `2` | Gap between pixels in pixels |
| `fps` | `number` | `20` | Animation frames per second |
| `brightness` | `number` | `1` | Brightness multiplier for pixels |
| `onClose` | `() => void` | `undefined` | Callback when component is closed |

## Interactions

### Click Behavior
- **Left Click**: Cycle through animation modes
- **Right Click**: Open Snake game dialog

### Keyboard Controls (Snake Game)
- **↑ Arrow Up**: Move snake up
- **↓ Arrow Down**: Move snake down
- **← Arrow Left**: Move snake left
- **→ Arrow Right**: Move snake right
- **Space**: Restart game (when game over)
- **Escape**: Close game dialog

## Animation Details

### Wave Animation
- 24 frames
- Sine wave across columns
- Smooth interpolation between pixels

### Pulse Animation
- 16 frames
- Center point with expanding rings
- Intensity varies with radius

### Loader Animation
- 12 frames
- 8 dots rotating in circle
- Trailing effect on dots

### Snake Animation
- Dynamic frame count based on grid
- Follows spiral path
- 5-pixel trail length

### Rain Animation
- 20 frames
- Multiple drops falling at different speeds
- Trail length varies per drop

### Spiral Animation
- 24 frames
- Rotates around center point
- Brightness fades with radius

## Game Mechanics

### Snake Game Rules
1. Control snake with arrow keys
2. Collect glowing food pixels
3. Snake grows by 1 segment per food
4. Score increases by 1 per food
5. Speed increases every 3 points
6. Game over on wall or self collision
7. Win condition: Fill entire grid

### Scoring
- +1 point per food collected
- Speed increase: -5ms every 3 points
- Minimum speed: 50ms between moves
- Starting speed: 200ms between moves

## Technical Implementation

### React Hooks Used
- `useState` - Game state and animation mode
- `useEffect` - Animation loop, game loop, keyboard controls
- `useRef` - SVG elements, pixels, animation frames

### Performance Optimization
- RequestAnimationFrame for smooth animations
- Frame caching for all animation types
- Minimal DOM updates (only changed pixels)
- CSS transitions for visual effects

### Browser Compatibility
- Modern browsers with SVG support
- RequestAnimationFrame API
- Backdrop-filter support (optional)
- ES6+ JavaScript features

## Styling

The component uses:
- Inline Tailwind CSS classes
- SVG gradients and filters
- CSS transitions for smooth effects
- Custom matrix green color (#00ff88)
- Glassmorphism effects

## Example Integration

```tsx
// In a modal or panel
import { MatrixDisplay } from '@/components/tools';

function MyComponent() {
  const [showMatrix, setShowMatrix] = useState(false);

  return (
    <>
      <button onClick={() => setShowMatrix(true)}>
        Show Matrix
      </button>
      
      {showMatrix && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
          <MatrixDisplay onClose={() => setShowMatrix(false)} />
        </div>
      )}
    </>
  );
}
```

## Future Enhancements

Possible additions:
- Custom color schemes
- Adjustable game difficulty
- High score tracking
- More animation patterns
- Customizable pixel shapes
- Touch controls for mobile
- Sound effects (optional)
- Multiplayer snake mode

## Credits

Converted from vanilla JavaScript to React/TypeScript
Original: `matrix-test.html` and `matrix.js`
Enhanced with TypeScript types and React patterns
