'use client';

import { useState, useEffect } from 'react';

interface ColorGeneratorProps {
  onClose: () => void;
}

export function ColorGenerator({ onClose }: ColorGeneratorProps) {
  const [baseColor, setBaseColor] = useState('#667eea');
  const [palette, setPalette] = useState<string[]>([]);
  const [mode, setMode] = useState<'analogous' | 'complementary' | 'triadic' | 'monochromatic'>('analogous');

  useEffect(() => {
    generatePalette();
  }, [baseColor, mode]);

  const hexToHSL = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  };

  const HSLToHex = (h: number, s: number, l: number) => {
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
    else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
    else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
    else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
    else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
    else if (h >= 300 && h < 360) { r = c; g = 0; b = x; }

    const toHex = (n: number) => {
      const hex = Math.round((n + m) * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const generatePalette = () => {
    const { h, s, l } = hexToHSL(baseColor);
    let colors: string[] = [baseColor];

    switch (mode) {
      case 'analogous':
        colors = [
          HSLToHex((h - 30 + 360) % 360, s, l),
          HSLToHex((h - 15 + 360) % 360, s, l),
          baseColor,
          HSLToHex((h + 15) % 360, s, l),
          HSLToHex((h + 30) % 360, s, l),
        ];
        break;
      case 'complementary':
        colors = [
          baseColor,
          HSLToHex((h + 180) % 360, s, l),
          HSLToHex(h, s, Math.min(l + 20, 100)),
          HSLToHex((h + 180) % 360, s, Math.min(l + 20, 100)),
          HSLToHex(h, s, Math.max(l - 20, 0)),
        ];
        break;
      case 'triadic':
        colors = [
          baseColor,
          HSLToHex((h + 120) % 360, s, l),
          HSLToHex((h + 240) % 360, s, l),
          HSLToHex(h, s, Math.min(l + 15, 100)),
          HSLToHex((h + 120) % 360, s, Math.min(l + 15, 100)),
        ];
        break;
      case 'monochromatic':
        colors = [
          HSLToHex(h, s, Math.max(l - 30, 10)),
          HSLToHex(h, s, Math.max(l - 15, 20)),
          baseColor,
          HSLToHex(h, s, Math.min(l + 15, 80)),
          HSLToHex(h, s, Math.min(l + 30, 90)),
        ];
        break;
    }

    setPalette(colors);
  };

  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color);
  };

  const randomColor = () => {
    const random = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    setBaseColor(random);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#0a0a0a] to-black text-white">
      {/* Header */}
      <div className="flex justify-between items-center p-5 border-b border-white/15 bg-white/[0.02]">
        <div className="flex items-center gap-3 text-xl font-semibold">
          <span>🎨</span>
          <span>Color Generator</span>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 
                     border border-white/20 hover:bg-red-500/20 hover:border-red-500/40 
                     hover:text-red-500 transition-all text-xl"
        >
          ×
        </button>
      </div>

      {/* Controls */}
      <div className="p-4 border-b border-white/15 bg-white/[0.03] space-y-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Base Color:</label>
          <input
            type="color"
            value={baseColor}
            onChange={(e) => setBaseColor(e.target.value)}
            className="w-16 h-10 rounded-lg cursor-pointer border border-white/20"
          />
          <input
            type="text"
            value={baseColor}
            onChange={(e) => setBaseColor(e.target.value)}
            className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg 
                       text-white outline-none focus:border-white/40 transition-all"
            maxLength={7}
          />
          <button
            onClick={randomColor}
            className="px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/40 
                       hover:bg-purple-500/30 transition-all font-medium"
          >
            Random
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {(['analogous', 'complementary', 'triadic', 'monochromatic'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-lg border font-medium capitalize transition-all ${
                mode === m
                  ? 'bg-blue-500/30 border-blue-500/50 text-white'
                  : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Palette Display */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-3">
          {palette.map((color, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 
                         rounded-lg hover:bg-white/10 transition-all"
            >
              <div
                className="w-16 h-16 rounded-lg border-2 border-white/20"
                style={{ backgroundColor: color }}
              />
              <div className="flex-1">
                <div className="font-mono text-lg font-medium">{color.toUpperCase()}</div>
                <div className="text-sm text-white/60 mt-1">
                  {(() => {
                    const { h, s, l } = hexToHSL(color);
                    return `HSL(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
                  })()}
                </div>
              </div>
              <button
                onClick={() => copyColor(color)}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 
                           hover:bg-white/20 transition-all"
              >
                Copy
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
