'use client';

import NumberFlow from '@number-flow/react';
import { AnimatePresence, motion } from 'motion/react';
import { Plus, Settings2, X, Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface PomodoroTimerProps {
  onClose: () => void;
}

// ── Color palettes ──────────────────────────────────────────────────────────
const PALETTES = [
  {
    name: 'Tomato',
    bg: '#f5f4f3',
    text: '#111111',
    accent: '#ff3828',
    ring: '#ff3828',
    btnText: '#f5f4f3',
  },
  {
    name: 'Midnight',
    bg: '#0f0f14',
    text: '#e8e8f0',
    accent: '#818cf8',
    ring: '#818cf8',
    btnText: '#0f0f14',
  },
  {
    name: 'Forest',
    bg: '#0d1f18',
    text: '#d4ede3',
    accent: '#34d399',
    ring: '#34d399',
    btnText: '#0d1f18',
  },
  {
    name: 'Amber',
    bg: '#1c1609',
    text: '#fef3c7',
    accent: '#f59e0b',
    ring: '#f59e0b',
    btnText: '#1c1609',
  },
  {
    name: 'Rose',
    bg: '#1a0a10',
    text: '#fce7f3',
    accent: '#f472b6',
    ring: '#f472b6',
    btnText: '#1a0a10',
  },
  {
    name: 'Sky',
    bg: '#040d1a',
    text: '#e0f2fe',
    accent: '#38bdf8',
    ring: '#38bdf8',
    btnText: '#040d1a',
  },
] as const;

type Palette = (typeof PALETTES)[number];

export function PomodoroTimer({ onClose: _onClose }: PomodoroTimerProps) {
  // Timer state
  const DEFAULT_MINUTES = 25;
  const [totalSeconds, setTotalSeconds] = useState(DEFAULT_MINUTES * 60);
  const [count, setCount] = useState(DEFAULT_MINUTES * 60);
  const [isPaused, setIsPaused] = useState(true);
  const [resetTrigger, setResetTrigger] = useState(0);

  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [palette, setPalette] = useState<Palette>(PALETTES[0]);
  const [draftMinutes, setDraftMinutes] = useState(DEFAULT_MINUTES);
  const [draftPalette, setDraftPalette] = useState<Palette>(PALETTES[0]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Countdown
  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          setIsPaused(true);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isPaused]);

  // Reset count when resetTrigger fires
  useEffect(() => {
    setCount(totalSeconds);
    setIsPaused(true);
  }, [resetTrigger, totalSeconds]);

  const handleReset = () => setResetTrigger((p) => p + 1);

  const openSettings = () => {
    setDraftMinutes(Math.round(totalSeconds / 60));
    setDraftPalette(palette);
    setShowSettings(true);
    setTimeout(() => inputRef.current?.select(), 80);
  };

  const applySettings = () => {
    const mins = Math.max(1, Math.min(99, draftMinutes));
    setTotalSeconds(mins * 60);
    setPalette(draftPalette);
    setShowSettings(false);
    setResetTrigger((p) => p + 1);
  };

  const minutes = Math.floor(count / 60);
  const seconds = count % 60;
  const progress = totalSeconds > 0 ? count / totalSeconds : 1;
  const circumference = 2 * Math.PI * 120;
  const dashOffset = circumference * (1 - progress);

  return (
    <div
      className="relative flex h-screen w-full flex-col items-center justify-center transition-colors duration-500"
      style={{ background: palette.bg, color: palette.text }}
    >
      {/* Progress ring */}
      <svg
        className="absolute inset-0 m-auto pointer-events-none"
        width="300"
        height="300"
        viewBox="0 0 300 300"
      >
        <circle
          cx="150"
          cy="150"
          r="120"
          fill="none"
          strokeWidth="2"
          stroke={palette.accent}
          strokeOpacity="0.12"
        />
        <circle
          cx="150"
          cy="150"
          r="120"
          fill="none"
          strokeWidth="2"
          stroke={palette.accent}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '150px 150px',
            transition: 'stroke-dashoffset 1s linear',
          }}
        />
      </svg>

      {/* Label */}
      <span
        className="mb-6 text-[10px] font-medium uppercase tracking-[0.25em] opacity-40 select-none"
        style={{ color: palette.text }}
      >
        {isPaused && count === totalSeconds ? 'Ready' : isPaused ? 'Paused' : 'Focus'}
      </span>

      {/* Timer digits */}
      <div
        className="font-bebas-neue text-[22vw] sm:text-[16vw] leading-none tracking-tight select-none"
        style={{ color: palette.text }}
      >
        <NumberFlow value={minutes} />
        <span>:</span>
        <NumberFlow value={seconds} format={{ minimumIntegerDigits: 2 }} />
      </div>

      {/* Controls */}
      <div className="mt-8 flex items-center gap-3">
        {/* Play / Pause */}
        <motion.button
          aria-label="Play or pause timer"
          onClick={() => setIsPaused((p) => !p)}
          whileTap={{ scale: 0.88 }}
          className="flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-opacity hover:opacity-90"
          style={{ background: palette.accent }}
        >
          <AnimatePresence initial={false} mode="wait">
            {isPaused ? (
              <motion.svg
                key="play"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.1 }}
                viewBox="0 0 12 14"
                fill="none"
                className="h-4 w-4"
                style={{ fill: palette.btnText }}
              >
                <path d="M0.9375 13.2422C1.25 13.2422 1.51562 13.1172 1.82812 12.9375L10.9375 7.67188C11.5859 7.28906 11.8125 7.03906 11.8125 6.625C11.8125 6.21094 11.5859 5.96094 10.9375 5.58594L1.82812 0.3125C1.51562 0.132812 1.25 0.015625 0.9375 0.015625C0.359375 0.015625 0 0.453125 0 1.13281V12.1172C0 12.7969 0.359375 13.2422 0.9375 13.2422Z" />
              </motion.svg>
            ) : (
              <motion.svg
                key="pause"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.1 }}
                viewBox="0 0 10 13"
                fill="none"
                className="h-4 w-4"
                style={{ fill: palette.btnText }}
              >
                <path d="M1.03906 12.7266H2.82031C3.5 12.7266 3.85938 12.3672 3.85938 11.6797V1.03906C3.85938 0.328125 3.5 0 2.82031 0H1.03906C0.359375 0 0 0.359375 0 1.03906V11.6797C0 12.3672 0.359375 12.7266 1.03906 12.7266ZM6.71875 12.7266H8.49219C9.17969 12.7266 9.53125 12.3672 9.53125 11.6797V1.03906C9.53125 0.328125 9.17969 0 8.49219 0H6.71875C6.03125 0 5.67188 0.359375 5.67188 1.03906V11.6797C5.67188 12.3672 6.03125 12.7266 6.71875 12.7266Z" />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Reset */}
        <motion.button
          aria-label="Reset timer"
          onClick={handleReset}
          whileTap={{ scale: 0.88 }}
          className="flex h-10 w-10 items-center justify-center rounded-full shadow transition-opacity hover:opacity-80"
          style={{ background: `${palette.accent}22` }}
        >
          <Plus className="rotate-45" size={18} style={{ color: palette.accent }} />
        </motion.button>

        {/* Edit / Settings */}
        <motion.button
          aria-label="Edit timer settings"
          onClick={openSettings}
          whileTap={{ scale: 0.88 }}
          className="flex h-10 w-10 items-center justify-center rounded-full shadow transition-opacity hover:opacity-80"
          style={{ background: `${palette.accent}22` }}
        >
          <Settings2 size={15} style={{ color: palette.accent }} />
        </motion.button>
      </div>

      {/* ── Settings panel ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showSettings && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(90vw,340px)] rounded-2xl border shadow-2xl p-6"
              style={{
                background: palette.bg,
                borderColor: `${palette.accent}30`,
                boxShadow: `0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px ${palette.accent}18`,
                color: palette.text,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold tracking-wide" style={{ color: palette.text }}>
                  Timer Settings
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1 rounded-lg opacity-40 hover:opacity-80 transition-opacity"
                  style={{ color: palette.text }}
                >
                  <X size={15} />
                </button>
              </div>

              {/* Duration */}
              <div className="mb-5">
                <label
                  className="block text-[11px] uppercase tracking-widest mb-2 opacity-50"
                  style={{ color: palette.text }}
                >
                  Duration (minutes)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="number"
                    min={1}
                    max={99}
                    value={draftMinutes}
                    onChange={(e) => setDraftMinutes(parseInt(e.target.value) || 1)}
                    className="w-full rounded-xl px-4 py-2.5 text-lg font-mono font-semibold text-center outline-none border transition-all"
                    style={{
                      background: `${palette.accent}12`,
                      borderColor: `${palette.accent}30`,
                      color: palette.text,
                    }}
                    onFocus={(e) => e.target.style.borderColor = palette.accent}
                    onBlur={(e) => e.target.style.borderColor = `${palette.accent}30`}
                  />
                </div>
                {/* Quick presets */}
                <div className="flex gap-1.5 mt-2">
                  {[5, 15, 25, 45, 60].map((m) => (
                    <button
                      key={m}
                      onClick={() => setDraftMinutes(m)}
                      className="flex-1 py-1 rounded-lg text-[11px] font-medium transition-all"
                      style={{
                        background: draftMinutes === m ? palette.accent : `${palette.accent}15`,
                        color: draftMinutes === m ? palette.btnText : palette.text,
                        opacity: draftMinutes === m ? 1 : 0.6,
                      }}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Color palette */}
              <div className="mb-6">
                <label
                  className="block text-[11px] uppercase tracking-widest mb-3 opacity-50"
                  style={{ color: palette.text }}
                >
                  Color Palette
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PALETTES.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => setDraftPalette(p)}
                      className="relative flex items-center gap-2 rounded-xl px-2.5 py-2 text-left transition-all border"
                      style={{
                        background: p.bg,
                        borderColor: draftPalette.name === p.name ? p.accent : 'transparent',
                        boxShadow: draftPalette.name === p.name ? `0 0 0 2px ${p.accent}40` : 'none',
                      }}
                    >
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ background: p.accent }}
                      />
                      <span
                        className="text-[11px] font-medium leading-none"
                        style={{ color: p.text }}
                      >
                        {p.name}
                      </span>
                      {draftPalette.name === p.name && (
                        <Check
                          size={10}
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                          style={{ color: p.accent }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Apply button */}
              <button
                onClick={applySettings}
                className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.97]"
                style={{ background: draftPalette.accent, color: draftPalette.btnText }}
              >
                Apply
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
