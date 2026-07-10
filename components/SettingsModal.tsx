'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ClockStyle } from './Clock';
import { ClockPreview } from './ClockPreview';
import { db } from '@/lib/db';

type SettingsSection = 'clock' | 'themes' | 'stats' | 'quotes' | 'extras' | 'profile';
type BackgroundMediaType = 'image' | 'video';

interface BackgroundChoice {
  name: string;
  path: string;
  mediaType: BackgroundMediaType;
}

interface StoredBackgroundSetting {
  source: 'static' | 'custom';
  mediaType: BackgroundMediaType;
  path?: string;
  fileKey?: string;
  name?: string;
}

const BACKGROUND_SETTING_KEY = 'selected_background';
const CUSTOM_WALLPAPER_KEY = 'custom-wallpaper';

const clockStyles: { name: string; value: ClockStyle }[] = [
  { name: 'Default', value: 'default' },
  { name: 'Minimal', value: 'minimal' },
  { name: 'Serif', value: 'serif' },
  { name: 'Handwritten', value: 'handwritten' },
  { name: 'Permanent Marker', value: 'minimal-light' },
  { name: 'Serif Condensed', value: 'serif-condensed' },
  { name: 'Bitcount Grid', value: 'bitcount' },
  { name: 'Corpta', value: 'corpta' },
  { name: 'Fenotype Wonder', value: 'fenotype' },
  { name: 'NCL Kemgor', value: 'nclkemgor' },
  { name: 'Westiva', value: 'westiva' },
  { name: 'Ammonite', value: 'ammonite' },
  { name: 'Crude', value: 'crude' },
  { name: 'Ghetto', value: 'ghetto' },
  { name: 'Zombiess', value: 'zombiess' },
];

const backgrounds: BackgroundChoice[] = [
  { name: 'Default', path: '/images/BG.png', mediaType: 'image' },
  { name: 'Animated 1', path: '/images/bg-gifs/1.gif', mediaType: 'image' },
  { name: 'Animated 2', path: '/images/bg-gifs/2.gif', mediaType: 'image' },
  { name: 'Wallpaper 1', path: '/images/Wallpapers/1 (1).jpg', mediaType: 'image' },
  { name: 'Wallpaper 2', path: '/images/Wallpapers/1 (1).png', mediaType: 'image' },
  { name: 'Wallpaper 3', path: '/images/Wallpapers/1 (2).jpg', mediaType: 'image' },
  { name: 'Wallpaper 4', path: '/images/Wallpapers/1 (2).png', mediaType: 'image' },
  { name: 'Wallpaper 5', path: '/images/Wallpapers/1 (3).jpg', mediaType: 'image' },
  { name: 'Wallpaper 6', path: '/images/Wallpapers/1 (3).png', mediaType: 'image' },
  { name: 'Wallpaper 7', path: '/images/Wallpapers/1 (4).png', mediaType: 'image' },
];

function getMediaTypeFromMime(mimeType: string): BackgroundMediaType {
  return mimeType.startsWith('video/') ? 'video' : 'image';
}

function getMediaTypeFromPath(path: string): BackgroundMediaType {
  return /\.(mp4|webm|ogg)$/i.test(path) ? 'video' : 'image';
}

function toSelectedBackground(value: string): StoredBackgroundSetting {
  if (value === 'custom') {
    return {
      source: 'custom',
      mediaType: 'image',
      fileKey: CUSTOM_WALLPAPER_KEY,
    };
  }

  return {
    source: 'static',
    mediaType: getMediaTypeFromPath(value),
    path: value,
  };
}

function getSelectionId(setting: StoredBackgroundSetting | null | undefined) {
  if (!setting) return '/images/BG.png';
  return setting.source === 'custom' ? 'custom' : setting.path || '/images/BG.png';
}

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const [activeSection, setActiveSection] = useState<SettingsSection>('clock');
  const [clockFormat, setClockFormat] = useState<'12' | '24'>('24');
  const [clockStyle, setClockStyle] = useState<ClockStyle>('default');
  const [clockColor, setClockColor] = useState('#ffffff');
  const [colorHistory, setColorHistory] = useState<string[]>([]);
  const [selectedBg, setSelectedBg] = useState('/images/BG.png');
  const [customPreviewUrl, setCustomPreviewUrl] = useState<string | null>(null);
  const [customMediaType, setCustomMediaType] = useState<BackgroundMediaType>('image');
  const [dynamicGreetings, setDynamicGreetings] = useState(true);
  const [showGreetings, setShowGreetings] = useState(true);
  const [matrixDisplay, setMatrixDisplay] = useState(true);

  useEffect(() => {
    return () => {
      if (customPreviewUrl) URL.revokeObjectURL(customPreviewUrl);
    };
  }, [customPreviewUrl]);

  useEffect(() => {
    // Load saved settings
    const savedFormat = (localStorage.getItem('clockFormat') || '24') as '12' | '24';
    const savedStyle = (localStorage.getItem('clockStyle') || 'default') as ClockStyle;
    const savedColor = localStorage.getItem('clockColor') || '#ffffff';
    const savedHistory = JSON.parse(localStorage.getItem('colorHistory') || '[]');
    const savedDynamicGreetings = localStorage.getItem('dynamicGreetings') !== 'false';
    const savedShowGreetings = localStorage.getItem('showGreetings') !== 'false';
    const savedMatrixDisplay = localStorage.getItem('matrixDisplay') !== 'false';
    
    setClockFormat(savedFormat);
    setClockStyle(savedStyle);
    setClockColor(savedColor);
    setColorHistory(savedHistory);
    setDynamicGreetings(savedDynamicGreetings);
    setShowGreetings(savedShowGreetings);
    setMatrixDisplay(savedMatrixDisplay);

    let isMounted = true;
    let previewUrl: string | null = null;

    const loadBackgroundSetting = async () => {
      try {
        const savedSetting = await db.settings.get(BACKGROUND_SETTING_KEY);
        const parsedSetting = savedSetting
          ? (JSON.parse(savedSetting.value) as StoredBackgroundSetting)
          : null;
        const legacyBg = localStorage.getItem('selectedBackground');
        const nextSetting = parsedSetting || toSelectedBackground(legacyBg || '/images/BG.png');

        if (!parsedSetting && legacyBg) {
          await db.settings.put({
            key: BACKGROUND_SETTING_KEY,
            value: JSON.stringify(nextSetting),
          });
        }

        if (nextSetting.source === 'custom') {
          const file = await db.files.get(nextSetting.fileKey || CUSTOM_WALLPAPER_KEY);
          if (file?.blob) {
            previewUrl = URL.createObjectURL(file.blob);
            if (isMounted) {
              setCustomPreviewUrl(previewUrl);
              setCustomMediaType(getMediaTypeFromMime(file.mimeType));
            }
          }
        }

        if (isMounted) {
          setSelectedBg(getSelectionId(nextSetting));
        }
      } catch (err) {
        console.error('Failed to load background setting:', err);
      }
    };

    loadBackgroundSetting();

    return () => {
      isMounted = false;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, []);

  const handleFormatChange = (format: '12' | '24') => {
    setClockFormat(format);
    localStorage.setItem('clockFormat', format);
    window.location.reload();
  };

  const handleStyleChange = (style: ClockStyle) => {
    setClockStyle(style);
    localStorage.setItem('clockStyle', style);
    window.location.reload();
  };

  const handleColorChange = (color: string) => {
    setClockColor(color);
    localStorage.setItem('clockColor', color);
    
    // Add to history
    const newHistory = [color, ...colorHistory.filter(c => c !== color)].slice(0, 10);
    setColorHistory(newHistory);
    localStorage.setItem('colorHistory', JSON.stringify(newHistory));
    
    window.location.reload();
  };

  const clearColorHistory = () => {
    setColorHistory([]);
    localStorage.removeItem('colorHistory');
  };

  const handleBackgroundChange = async (bgPath: string) => {
    const background = backgrounds.find((item) => item.path === bgPath);
    const setting: StoredBackgroundSetting = background
      ? {
          source: 'static',
          mediaType: background.mediaType,
          path: background.path,
          name: background.name,
        }
      : toSelectedBackground(bgPath);

    setSelectedBg(getSelectionId(setting));
    await db.settings.put({
      key: BACKGROUND_SETTING_KEY,
      value: JSON.stringify(setting),
    });
    window.dispatchEvent(new CustomEvent('prism:background-change'));
  };

  const handleCustomBackgroundSelect = async () => {
    const file = await db.files.get(CUSTOM_WALLPAPER_KEY);
    if (!file?.blob) return;

    const setting: StoredBackgroundSetting = {
      source: 'custom',
      mediaType: getMediaTypeFromMime(file.mimeType),
      fileKey: CUSTOM_WALLPAPER_KEY,
    };

    setSelectedBg('custom');
    setCustomMediaType(setting.mediaType);
    await db.settings.put({
      key: BACKGROUND_SETTING_KEY,
      value: JSON.stringify(setting),
    });
    window.dispatchEvent(new CustomEvent('prism:background-change'));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        alert('Please upload an image, GIF, or video file.');
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        alert("File is too large! Please upload a file smaller than 50MB.");
        return;
      }

      try {
        await db.files.put({
          key: CUSTOM_WALLPAPER_KEY,
          blob: file,
          mimeType: file.type
        });
        await db.settings.put({
          key: BACKGROUND_SETTING_KEY,
          value: JSON.stringify({
            source: 'custom',
            mediaType: getMediaTypeFromMime(file.type),
            fileKey: CUSTOM_WALLPAPER_KEY,
            name: file.name,
          } satisfies StoredBackgroundSetting),
        });

        if (customPreviewUrl) URL.revokeObjectURL(customPreviewUrl);
        setCustomPreviewUrl(URL.createObjectURL(file));
        setCustomMediaType(getMediaTypeFromMime(file.type));
        setSelectedBg('custom');
        window.dispatchEvent(new CustomEvent('prism:background-change'));
      } catch (err) {
        console.error('Failed to save custom wallpaper:', err);
        alert('Failed to save custom wallpaper.');
      }
    }
  };

  const navItems: { id: SettingsSection; icon: string; label: string }[] = [
    { id: 'clock', icon: '🕐', label: 'Clock' },
    { id: 'themes', icon: '🎨', label: 'Themes' },
    { id: 'stats', icon: '📊', label: 'Stats' },
    { id: 'quotes', icon: '💬', label: 'Quotes' },
    { id: 'extras', icon: '⚡', label: 'Extras' },
    { id: 'profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-lg z-[1000] flex items-center justify-center p-4">
      <div className="glass-dark rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex">
        {/* Sidebar */}
        <div className="w-64 bg-black/50 p-6 flex flex-col overflow-y-auto">
          <div className="mb-8">
            <Image src="/images/prism-logo.svg" alt="Prism" width={40} height={40} />
          </div>
          
          <nav className="flex-1 space-y-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                  activeSection === item.id ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
              >
                <span>{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-6 space-y-2">
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 overflow-y-auto relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 rounded-lg bg-white/10 
                       hover:bg-white/20 flex items-center justify-center text-2xl transition-all"
          >
            ×
          </button>

          {/* Clock Section */}
          {activeSection === 'clock' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold mb-6">Clock Format</h2>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleFormatChange('12')}
                    className={`flex-1 p-6 rounded-xl border-2 transition-all ${
                      clockFormat === '12'
                        ? 'border-pink-500 bg-pink-500/10'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                  >
                    <div className="text-4xl font-semibold mb-2">2:24</div>
                    <div>12-hour</div>
                  </button>
                  <button
                    onClick={() => handleFormatChange('24')}
                    className={`flex-1 p-6 rounded-xl border-2 transition-all ${
                      clockFormat === '24'
                        ? 'border-pink-500 bg-pink-500/10'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                  >
                    <div className="text-4xl font-semibold mb-2">14:24</div>
                    <div>24-hour</div>
                  </button>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-6">Clock Color</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={clockColor}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="w-20 h-12 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={clockColor}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="flex-1 px-4 py-2 bg-white/10 rounded-lg border border-white/20 text-white"
                      maxLength={7}
                      placeholder="#ffffff"
                    />
                    <button
                      onClick={() => handleColorChange('#ffffff')}
                      className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
                    >
                      Reset
                    </button>
                  </div>

                  {colorHistory.length > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-white/60">Recent Colors:</span>
                        <button
                          onClick={clearColorHistory}
                          className="text-xs text-white/60 hover:text-white transition-all"
                        >
                          Clear History
                        </button>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {colorHistory.map((color, i) => (
                          <button
                            key={i}
                            onClick={() => handleColorChange(color)}
                            className="w-10 h-10 rounded-lg border-2 border-white/20 hover:border-white/40 transition-all"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-6">Clock Style</h2>
                <p className="text-white/60 text-sm mb-8">
                  Choose the perfect typography to match your vibe
                </p>
                <div className="grid grid-cols-3 gap-5">
                  {clockStyles.map((style) => {
                    const isSelected = clockStyle === style.value;
                    return (
                      <button
                        key={style.value}
                        onClick={() => handleStyleChange(style.value)}
                        className={`group relative overflow-hidden rounded-2xl transition-all duration-300 ${
                          isSelected
                            ? 'ring-2 ring-pink-500 ring-offset-2 ring-offset-black/50 shadow-[0_0_40px_rgba(236,72,153,0.3)]'
                            : 'ring-1 ring-white/10 hover:ring-white/30 hover:shadow-[0_8px_32px_rgba(255,255,255,0.08)]'
                        }`}
                        style={{ aspectRatio: '16/11' }}
                      >
                        {/* Background gradient overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-300 ${
                          isSelected
                            ? 'from-pink-500/20 via-purple-500/10 to-transparent opacity-100'
                            : 'from-white/5 to-transparent opacity-0 group-hover:opacity-100'
                        }`} />
                        
                        {/* Clock preview component */}
                        <div className="relative h-full w-full overflow-hidden">
                          <div className={`absolute inset-0 w-full h-full transition-all duration-300 pointer-events-none ${isSelected ? 'scale-110 brightness-110' : 'scale-100'}`}>
                            <ClockPreview style={style.value} color={clockColor} />
                          </div>
                          
                          {/* Gloss effect */}
                          <div className={`absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 
                                         group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
                            isSelected ? 'opacity-40' : ''
                          }`} />
                        </div>

                        {/* Label with backdrop */}
                        <div className={`absolute bottom-0 left-0 right-0 p-3.5 backdrop-blur-xl transition-all duration-300 ${
                          isSelected
                            ? 'bg-gradient-to-t from-pink-500/30 via-pink-500/20 to-transparent'
                            : 'bg-gradient-to-t from-black/60 via-black/40 to-transparent group-hover:from-black/70'
                        }`}>
                          <div className={`text-sm font-medium transition-all duration-300 ${
                            isSelected 
                              ? 'text-white' 
                              : 'text-white/80 group-hover:text-white'
                          }`}>
                            {style.name}
                          </div>
                          
                          {/* Selection indicator */}
                          {isSelected && (
                            <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-pink-500 
                                          flex items-center justify-center animate-in zoom-in-0 duration-200">
                              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Hover shine effect */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent 
                                        translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Themes Section */}
          {activeSection === 'themes' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold mb-6">Themes</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 rounded-xl border-2 border-pink-500 bg-pink-500/10">
                    <div className="text-5xl font-semibold mb-2">12:34</div>
                    <div>Home</div>
                  </div>
                  <div className="p-6 rounded-xl border-2 border-white/20 hover:border-white/40 transition-all cursor-pointer">
                    <div className="text-4xl font-semibold mb-2">⏱️ 25:00</div>
                    <div>Focus</div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-6">Background</h2>
                <div className="mb-4">
                  <input
                    type="file"
                    accept="image/*,image/gif,video/mp4,video/webm,video/ogg"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="wallpaperUpload"
                  />
                  <label
                    htmlFor="wallpaperUpload"
                    className="inline-block px-6 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all cursor-pointer"
                  >
                    Upload GIF or Video Wallpaper
                  </label>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {customPreviewUrl && (
                    <button
                      onClick={handleCustomBackgroundSelect}
                      className={`group relative aspect-video rounded-xl overflow-hidden border-2 transition-all ${
                        selectedBg === 'custom'
                          ? 'border-pink-500'
                          : 'border-white/20 hover:border-white/40'
                      }`}
                      title="Custom wallpaper"
                    >
                      {customMediaType === 'video' ? (
                        <video
                          src={customPreviewUrl}
                          autoPlay
                          muted
                          loop
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={customPreviewUrl}
                          alt="Custom wallpaper"
                          className="w-full h-full object-cover"
                        />
                      )}
                      <span className="absolute left-2 top-2 rounded bg-black/60 px-2 py-1 text-[11px] font-medium text-white">
                        Custom
                      </span>
                    </button>
                  )}
                  {backgrounds.map((bg, i) => (
                    <button
                      key={i}
                      onClick={() => handleBackgroundChange(bg.path)}
                      className={`aspect-video rounded-xl overflow-hidden border-2 transition-all ${
                        selectedBg === bg.path
                          ? 'border-pink-500'
                          : 'border-white/20 hover:border-white/40'
                      }`}
                      title={bg.name}
                    >
                      {bg.mediaType === 'video' ? (
                        <video
                          src={bg.path}
                          muted
                          loop
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={bg.path}
                          alt={bg.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quotes Section */}
          {activeSection === 'quotes' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-6">Quotes & Greetings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <div className="font-medium mb-1">Show dynamic greetings</div>
                    <div className="text-sm text-white/60">Turn off for generic greetings.</div>
                  </div>
                  <label className="relative inline-block w-12 h-6">
                    <input
                      type="checkbox"
                      checked={dynamicGreetings}
                      onChange={(e) => {
                        setDynamicGreetings(e.target.checked);
                        localStorage.setItem('dynamicGreetings', e.target.checked.toString());
                      }}
                      className="opacity-0 w-0 h-0 peer"
                    />
                    <span className="absolute cursor-pointer inset-0 bg-white/20 rounded-full transition-all
                                   peer-checked:bg-pink-500 before:absolute before:content-[''] before:h-5 before:w-5
                                   before:left-0.5 before:bottom-0.5 before:bg-white before:rounded-full before:transition-all
                                   peer-checked:before:translate-x-6" />
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <div className="font-medium mb-1">Show greetings</div>
                    <div className="text-sm text-white/60">Turn off to hide dashboard greetings.</div>
                  </div>
                  <label className="relative inline-block w-12 h-6">
                    <input
                      type="checkbox"
                      checked={showGreetings}
                      onChange={(e) => {
                        setShowGreetings(e.target.checked);
                        localStorage.setItem('showGreetings', e.target.checked.toString());
                        window.location.reload();
                      }}
                      className="opacity-0 w-0 h-0 peer"
                    />
                    <span className="absolute cursor-pointer inset-0 bg-white/20 rounded-full transition-all
                                   peer-checked:bg-pink-500 before:absolute before:content-[''] before:h-5 before:w-5
                                   before:left-0.5 before:bottom-0.5 before:bg-white before:rounded-full before:transition-all
                                   peer-checked:before:translate-x-6" />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Extras Section */}
          {activeSection === 'extras' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-6">Extras</h2>
              
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <div className="font-medium mb-1">Matrix Display</div>
                  <div className="text-sm text-white/60">Show animated matrix display in bottom corner. Click to cycle animations.</div>
                </div>
                <label className="relative inline-block w-12 h-6">
                  <input
                    type="checkbox"
                    checked={matrixDisplay}
                    onChange={(e) => {
                      setMatrixDisplay(e.target.checked);
                      localStorage.setItem('matrixDisplay', e.target.checked.toString());
                      window.location.reload();
                    }}
                    className="opacity-0 w-0 h-0 peer"
                  />
                  <span className="absolute cursor-pointer inset-0 bg-white/20 rounded-full transition-all
                                 peer-checked:bg-pink-500 before:absolute before:content-[''] before:h-5 before:w-5
                                 before:left-0.5 before:bottom-0.5 before:bg-white before:rounded-full before:transition-all
                                 peer-checked:before:translate-x-6" />
                </label>
              </div>
            </div>
          )}

          {/* Placeholder Sections */}
          {['stats', 'profile'].includes(activeSection) && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">
                {navItems.find(i => i.id === activeSection)?.label}
              </h2>
              <p className="text-white/60">Settings for this section coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
