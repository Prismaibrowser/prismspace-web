# Prism Dev Browser - Usage Guide

## Quick Start

### 1. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Navigate the Interface

**Main Screen:**
- Large clock display in the center
- Daily greeting messages (can be toggled off)
- Scroll down to see Developer Tools

**Top Right:**
- Motivational quote (can be toggled off)

**Top Left:**
- Prism logo and branding

**Bottom Left:**
- 📝 Notepad button - Opens side panel notepad
- Matrix display (animated, can be toggled off)

**Bottom Right:**
- ⚙️ Settings button - Opens settings modal
- ⛶ Fullscreen button - Toggle fullscreen mode

**Left Side:**
- System Info widget (hover to expand)
  - Shows browser, screen, RAM, connection info
  - Auto-updates every 15 seconds

## Settings Guide

### Opening Settings
Click the **⚙️** button in the bottom right corner.

### Clock Settings

#### Change Clock Format
1. Go to **Clock** section
2. Choose **12-hour** or **24-hour** format
3. Changes apply immediately (page reloads)

#### Change Clock Color
1. Go to **Clock** section → **Clock Color**
2. Use color picker or enter hex code
3. Recent colors are saved for quick access
4. Click **Reset** to restore white
5. Click **Clear History** to remove saved colors

#### Change Clock Style
1. Go to **Clock** section → **Clock Style**
2. Browse 15 different font styles
3. Click any style to preview and apply
4. Changes apply immediately (page reloads)

Available styles:
- **Default**: Bold Montserrat
- **Minimal**: Light Space Grotesk
- **Serif**: Classic Georgia
- **Handwritten**: Brush Script
- **Permanent Marker**: Marker style
- **Serif Condensed**: Narrow serif
- **Bitcount Grid**: Retro monospace
- Plus 8 more custom fonts!

### Theme Settings

#### Change Background Wallpaper
1. Go to **Themes** section → **Background**
2. Click any of the 8 built-in wallpapers
3. Or click **Upload Custom Wallpaper** to use your own
4. Supported formats: JPG, PNG
5. Background changes immediately

#### Switch Theme Mode
1. Go to **Themes** section → **Themes**
2. Choose **Home** (default) or **Focus** mode
3. Each theme has different UI emphasis

### Quotes & Greetings

#### Toggle Dynamic Greetings (Top Quote)
1. Go to **Quotes** section
2. Toggle **Show dynamic greetings**
3. ON = Random tech quotes appear at top right
4. OFF = No top quote displayed

#### Toggle Daily Greetings (Center Messages)
1. Go to **Quotes** section
2. Toggle **Show greetings**
3. ON = Daily messages shown above clock
4. OFF = Only clock is displayed (page reloads)

### Extras

#### Toggle Matrix Display
1. Go to **Extras** section
2. Toggle **Matrix Display**
3. ON = Animated matrix in bottom left
4. OFF = Matrix hidden (page reloads)

### Focus Timer Settings
1. Go to **Focus Timer** section
2. Embedded focus timer settings page loads
3. Configure Pomodoro timer preferences

### Other Sections
Settings sections for **Stats**, **Music**, **Notepad**, **Sounds**, **Profile**, and **Support** are placeholders and will be implemented in future updates.

## Using Developer Tools

### Access Tools
Scroll down from the main screen to see the **Dev Space** with 23 tools.

### Tool Categories

#### Development Tools
- **Localhost**: Opens localhost:3000 in new tab
- **GitHub**: Quick link to GitHub
- **JSON Toolkit**: Side panel for JSON operations
- **Crypto Utils**: Side panel for encryption/hashing
- **Regex Workbench**: Side panel for regex testing
- **Markdown Editor**: Side panel for markdown editing
- **Git Reference**: Side panel with git commands
- **Time & Date**: Side panel for time conversions
- **Color Gen**: Side panel for color palettes

#### AI Tools
- **Prompt Synthesizer**: Large side panel for AI prompts
- **Writing Assistant**: AI writing tools
- **Language Learning**: AI language tutor
- **Code Explainer**: AI code explanation
- **Code Translator**: Convert between languages
- **Decision Analyzer**: AI decision support

#### Productivity Tools
- **Checklist Manager**: Opens in new tab
- **Focus Timer**: Opens in new tab
- **Bookmark Manager**: Opens in new tab
- **Habit Tracker**: Opens in new tab
- **Random Picker**: Opens in new tab
- **Shortcut Reference**: Opens in new tab

#### System Tools
- **System Info**: Copies system info to clipboard
- **PrismBrowser Web**: Link to Prism documentation

## Keyboard Shortcuts

### General
- **Tab**: Navigate between elements
- **Enter**: Activate focused button/link
- **Esc**: Close modals (settings, panels)

### Fullscreen
- Click fullscreen button
- Press **F11** (browser native)
- Click again or **F11** to exit

## Tips & Tricks

### Customize Your Experience
1. **Pick Your Favorite Clock**: Try all 15 styles to find your favorite
2. **Choose Colors**: Match your clock color to your background
3. **Toggle Distractions**: Turn off greetings for minimal view
4. **Save Color Schemes**: Use color history to switch quickly
5. **Upload Wallpaper**: Use your own background for personalization

### Best Practices
1. **Keep Settings Synced**: Settings are per-browser (localStorage)
2. **Clear Cache**: If settings don't apply, clear browser cache
3. **Browser Support**: Best experience in Chrome, Edge, Firefox
4. **RAM Usage**: Only accurate in Chrome (performance.memory API)
5. **Background Size**: Use optimized images (<5MB) for best performance

### Performance Tips
1. **Disable Animations**: Turn off matrix if you want minimal CPU usage
2. **Use Static Backgrounds**: GIFs use more resources
3. **Close Unused Panels**: Side panels consume memory when open
4. **Reload Occasionally**: Refresh page to clear accumulated state

## Troubleshooting

### Settings Not Saving
**Problem**: Changes don't persist after reload
**Solution**: 
- Check if cookies/localStorage are enabled
- Try incognito/private mode to test
- Clear browser cache and try again

### Clock Not Updating
**Problem**: Time doesn't change
**Solution**:
- Refresh the page
- Check if JavaScript is enabled
- Try a different browser

### Background Not Loading
**Problem**: Custom wallpaper doesn't show
**Solution**:
- Check file size (keep under 5MB)
- Use JPG or PNG format only
- Try a different image
- Reload the page

### Panel Not Opening
**Problem**: Tool panel doesn't open when clicked
**Solution**:
- Check browser console for errors
- Ensure popup blockers aren't active
- Try clicking the tool card again
- Refresh the page

### Fullscreen Issues
**Problem**: Fullscreen doesn't work
**Solution**:
- Some browsers require user gesture
- Try clicking the button again
- Use F11 as alternative
- Check browser permissions

### Build Errors
**Problem**: `npm run build` fails
**Solution**:
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

## Data & Privacy

### What's Stored Locally
All settings are stored in **browser localStorage**:
- Clock format (12/24 hour)
- Clock style selection
- Clock color and color history
- Selected background
- Toggle preferences (greetings, matrix)
- Focus timer settings (in iframe)

### What's NOT Stored
- No server-side storage
- No analytics or tracking
- No cookies (except localStorage)
- No personal data collection
- No external API calls for settings

### Clearing Data
To reset all settings:
1. Open browser DevTools (F12)
2. Go to **Application** tab
3. Click **Local Storage** → **localhost:3000**
4. Click **Clear All**
5. Refresh the page

Or manually:
```javascript
// In browser console
localStorage.clear();
location.reload();
```

## Advanced Usage

### Custom Development
See `MIGRATION_GUIDE.md` for:
- Adding new tools
- Creating custom components
- Modifying clock styles
- Adding new fonts
- Customizing themes

### Deployment
See `DEPLOYMENT.md` for:
- Deploying to Vercel
- Deploying to other platforms
- Custom domain setup
- Environment variables
- Performance optimization

## Support

### Resources
- **README.md**: Quick start and overview
- **FEATURES.md**: Complete feature list
- **MIGRATION_GUIDE.md**: Technical details
- **DEPLOYMENT.md**: Deployment instructions

### Getting Help
1. Check this guide first
2. Review the documentation files
3. Check browser console for errors
4. Try in different browser
5. Clear cache and rebuild

### Reporting Issues
When reporting issues, include:
- Browser name and version
- Operating system
- Steps to reproduce
- Console error messages
- Screenshots if applicable

---

Enjoy your personalized Prism Dev Browser! 🚀
