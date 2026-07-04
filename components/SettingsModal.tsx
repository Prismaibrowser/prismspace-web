'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

type ClockStyle = 'default' | 'minimal' | 'serif' | 'handwritten' | 'minimal-light' | 
  'serif-condensed' | 'bitcount' | 'corpta' | 'fenotype' | 'nclkemgor' | 
  'westiva' | 'ammonite' | 'crude' | 'ghetto' | 'zombiess';

type SettingsSection = 'clock' | 'themes' | 'focus' | 'stats' | 'music' | 
  'notepad' | 'sounds' | 'quotes' | 'extras' | 'profile' | 'support';

const clockStyles: { name: string; value: ClockStyle; preview: string }[] = [
  { name: 'Default', value: 'default', preview: '/clock-previews/default.html' },
  { name: 'Minimal', value: 'minimal', preview: '/clock-previews/minimal.html' },
  { name: 'Serif', value: 'serif', preview: '/clock-previews/serif.html' },
  { name: 'Handwritten', value: 'handwritten', preview: '/clock-previews/handwritten.html' },
  { name: 'Permanent Marker', value: 'minimal-light', preview: '/clock-previews/minimal-light.html' },
  { name: 'Serif Condensed', value: 'serif-condensed', preview: '/clock-previews/serif-condensed.html' },
  { name: 'Bitcount Grid', value: 'bitcount', preview: '/clock-previews/bitcount.html' },
  { name: 'Corpta', value: 'corpta', preview: '/clock-previews/corpta.html' },
  { name: 'Fenotype Wonder', value: 'fenotype', preview: '/clock-previews/fenotype.html' },
  { name: 'NCL Kemgor', value: 'nclkemgor', preview: '/clock-previews/nclkemgor.html' },
  { name: 'Westiva', value: 'westiva', preview: '/clock-previews/westiva.html' },
  { name: 'Ammonite', value: 'ammonite', preview: '/clock-previews/ammonite.html' },
  { name: 'Crude', value: 'crude', preview: '/clock-previews/crude.html' },
  { name: 'Ghetto', value: 'ghetto', preview: '/clock-previews/ghetto.html' },
  { name: 'Zombiess', value: 'zombiess', preview: '/clock-previews/zombiess.html' },
];

const backgrounds = [
  { name: 'Default', path: '/images/BG.png' },
  { name: 'Wallpaper 1', path: '/images/Wallpapers/1 (1).jpg' },
  { name: 'Wallpaper 2', path: '/images/Wallpapers/1 (1).png' },
  { name: 'Wallpaper 3', path: '/images/Wallpapers/1 (2).jpg' },
  { name: 'Wallpaper 4', path: '/images/Wallpapers/1 (2).png' },
  { name: 'Wallpaper 5', path: '/images/Wallpapers/1 (3).jpg' },
  { name: 'Wallpaper 6', path: '/images/Wallpapers/1 (3).png' },
  { name: 'Wallpaper 7', path: '/images/Wallpapers/1 (4).png' },
];

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const [activeSection, setActiveSection] = useState<SettingsSection>('clock');
  const [clockFormat, setClockFormat] = useState<'12' | '24'>('24');
  const [clockStyle, setClockStyle] = useState<ClockStyle>('default');
  const [clockColor, setClockColor] = useState('#ffffff');
  const [colorHistory, setColorHistory] = useState<string[]>([]);
  const [selectedBg, setSelectedBg] = useState('/images/BG.png');
  const [dynamicGreetings, setDynamicGreetings] = useState(true);
  const [showGreetings, setShowGreetings] = useState(true);
  const [matrixDisplay, setMatrixDisplay] = useState(true);

  useEffect(() => {
    // Load saved settings
    const savedFormat = (localStorage.getItem('clockFormat') || '24') as '12' | '24';
    const savedStyle = (localStorage.getItem('clockStyle') || 'default') as ClockStyle;
    const savedColor = localStorage.getItem('clockColor') || '#ffffff';
    const savedHistory = JSON.parse(localStorage.getItem('colorHistory') || '[]');
    const savedBg = localStorage.getItem('selectedBackground') || '/images/BG.png';
    const savedDynamicGreetings = localStorage.getItem('dynamicGreetings') !== 'false';
    const savedShowGreetings = localStorage.getItem('showGreetings') !== 'false';
    const savedMatrixDisplay = localStorage.getItem('matrixDisplay') !== 'false';
    
    setClockFormat(savedFormat);
    setClockStyle(savedStyle);
    setClockColor(savedColor);
    setColorHistory(savedHistory);
    setSelectedBg(savedBg);
    setDynamicGreetings(savedDynamicGreetings);
    setShowGreetings(savedShowGreetings);
    setMatrixDisplay(savedMatrixDisplay);
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

  const handleBackgroundChange = (bgPath: string) => {
    setSelectedBg(bgPath);
    localStorage.setItem('selectedBackground', bgPath);
    document.body.style.backgroundImage = `url('${bgPath}')`;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        handleBackgroundChange(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const navItems: { id: SettingsSection; icon: string; label: string }[] = [
    { id: 'clock', icon: '🕐', label: 'Clock' },
    { id: 'themes', icon: '🎨', label: 'Themes' },
    { id: 'focus', icon: '⏱️', label: 'Focus Timer' },
    { id: 'stats', icon: '📊', label: 'Stats' },
    { id: 'music', icon: '🎵', label: 'Music' },
    { id: 'notepad', icon: '📝', label: 'Notepad' },
    { id: 'sounds', icon: '🔊', label: 'Sounds' },
    { id: 'quotes', icon: '💬', label: 'Quotes' },
    { id: 'extras', icon: '⚡', label: 'Extras' },
    { id: 'profile', icon: '👤', label: 'Profile' },
    { id: 'support', icon: '❓', label: 'Support & Feedback' },
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
            <button className="w-full flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5 transition-all text-sm">
              <span>⚡</span>
              <span>Explore Prism Plus</span>
            </button>
            <button className="w-full flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5 transition-all text-sm">
              <span>🎁</span>
              <span>Share with friends</span>
            </button>
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
                <div className="grid grid-cols-3 gap-4">
                  {clockStyles.map((style) => (
                    <button
                      key={style.value}
                      onClick={() => handleStyleChange(style.value)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        clockStyle === style.value
                          ? 'border-pink-500 bg-pink-500/10'
                          : 'border-white/20 hover:border-white/40'
                      }`}
                    >
                      <iframe
                        src={style.preview}
                        className="w-full h-20 pointer-events-none mb-2 rounded"
                      />
                      <div className="text-sm">{style.name}</div>
                    </button>
                  ))}
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
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="wallpaperUpload"
                  />
                  <label
                    htmlFor="wallpaperUpload"
                    className="inline-block px-6 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all cursor-pointer"
                  >
                    Upload Custom Wallpaper
                  </label>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {backgrounds.map((bg, i) => (
                    <button
                      key={i}
                      onClick={() => handleBackgroundChange(bg.path)}
                      className={`aspect-video rounded-xl overflow-hidden border-2 transition-all ${
                        selectedBg === bg.path
                          ? 'border-pink-500'
                          : 'border-white/20 hover:border-white/40'
                      }`}
                    >
                      <Image
                        src={bg.path}
                        alt={bg.name}
                        width={200}
                        height={113}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Focus Timer Section */}
          {activeSection === 'focus' && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">Focus Timer</h2>
              <iframe
                src="/dev-space/focus-settings.html"
                className="w-full h-[600px] rounded-xl border border-white/20"
              />
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
          {['stats', 'music', 'notepad', 'sounds', 'profile', 'support'].includes(activeSection) && (
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
