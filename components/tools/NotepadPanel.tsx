'use client';

import { useState, useEffect, useRef } from 'react';

interface Note {
  id: number;
  title: string;
  content: string;
}

interface NotepadPanelProps {
  onClose: () => void;
}

// ── Inline SVG icons (no extra dep) ──────────────────────────────────────────

const BoldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
    <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
  </svg>
);

const ItalicIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="4" x2="10" y2="4"/>
    <line x1="14" y1="20" x2="5" y2="20"/>
    <line x1="15" y1="4" x2="9" y2="20"/>
  </svg>
);

const ListIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="9" y1="6" x2="20" y2="6"/>
    <line x1="9" y1="12" x2="20" y2="12"/>
    <line x1="9" y1="18" x2="20" y2="18"/>
    <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="14" height="14" rx="2"/>
    <polyline points="7 12 10 15 14 9"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

// ── NotepadPanel ──────────────────────────────────────────────────────────────

export function NotepadPanel({ onClose }: NotepadPanelProps) {
  const [notes, setNotes] = useState<Note[]>([
    { id: Date.now(), title: 'Your ideas here', content: '' },
  ]);
  const [currentTab, setCurrentTab] = useState(0);
  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [saved, setSaved] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load from localStorage
  useEffect(() => {
    const raw = localStorage.getItem('notepadTabs');
    if (raw) {
      try {
        const loaded: Note[] = JSON.parse(raw);
        if (loaded.length > 0) {
          setNotes(loaded);
          setContent(loaded[0].content);
        }
      } catch {}
    }
  }, []);

  // Stats + auto-save
  useEffect(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setCharCount(content.length);
    setSaved(false);

    const timer = setTimeout(() => {
      setNotes((prev) => {
        const next = [...prev];
        next[currentTab] = { ...next[currentTab], content };
        localStorage.setItem('notepadTabs', JSON.stringify(next));
        return next;
      });
      setSaved(true);
    }, 800);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const switchTab = (index: number) => {
    setNotes((prev) => {
      const next = [...prev];
      next[currentTab] = { ...next[currentTab], content };
      setCurrentTab(index);
      setContent(next[index].content);
      return next;
    });
  };

  const addNewTab = () => {
    const newNote: Note = {
      id: Date.now(),
      title: `Note ${notes.length + 1}`,
      content: '',
    };
    setNotes((prev) => {
      const next = [...prev, newNote];
      setCurrentTab(next.length - 1);
      setContent('');
      return next;
    });
  };

  const deleteTab = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (notes.length === 1) return;
    setNotes((prev) => {
      const next = prev.filter((_, i) => i !== index);
      localStorage.setItem('notepadTabs', JSON.stringify(next));
      const newIdx = Math.min(currentTab, next.length - 1);
      setCurrentTab(newIdx);
      setContent(next[newIdx].content);
      return next;
    });
  };

  const downloadNote = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${notes[currentTab]?.title ?? 'note'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatText = (format: 'bold' | 'italic' | 'bullet' | 'checkbox') => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const sel = content.substring(start, end);

    const map: Record<string, string> = {
      bold: `**${sel}**`,
      italic: `*${sel}*`,
      bullet: `\n• ${sel}`,
      checkbox: `\n☐ ${sel}`,
    };

    const next =
      content.substring(0, start) + map[format] + content.substring(end);
    setContent(next);

    // Restore caret after state update
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + map[format].length;
      ta.setSelectionRange(pos, pos);
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'linear-gradient(160deg, #0d0d0f 0%, #0a0a0c 100%)',
        color: '#fff',
        fontFamily: "'Space Grotesk', system-ui, sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top accent line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, #00ff88 40%, #00ccff 100%)',
          opacity: 0.9,
          zIndex: 10,
        }}
      />

      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '18px 20px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {/* Left: icon + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Prism-green notepad glyph */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(0,255,136,0.1)',
              border: '1px solid rgba(0,255,136,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>
              Notepad
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              PrismSpace
            </div>
          </div>
        </div>

        {/* Right: stats + actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Word / char stats */}
          <div
            style={{
              display: 'flex',
              gap: 10,
              fontSize: 11,
              color: 'rgba(255,255,255,0.4)',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 8,
              padding: '5px 10px',
              letterSpacing: '0.01em',
            }}
          >
            <span>
              <span style={{ color: '#00ff88', fontWeight: 600 }}>{wordCount}</span>{' '}
              <span>words</span>
            </span>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
            <span>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{charCount}</span>{' '}
              <span>chars</span>
            </span>
          </div>

          {/* Auto-save indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 10,
              color: saved ? '#00ff88' : 'rgba(255,255,255,0.3)',
              transition: 'color 0.4s ease',
            }}
          >
            <div
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: saved ? '#00ff88' : 'rgba(255,255,255,0.25)',
                transition: 'background 0.4s ease',
                boxShadow: saved ? '0 0 6px #00ff88' : 'none',
              }}
            />
            {saved ? 'Saved' : 'Saving…'}
          </div>

          {/* Download */}
          <button
            onClick={downloadNote}
            title="Download note"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,255,136,0.12)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,255,136,0.3)';
              (e.currentTarget as HTMLButtonElement).style.color = '#00ff88';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)';
              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.6)';
            }}
          >
            <DownloadIcon />
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            title="Close"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,80,80,0.15)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,80,80,0.35)';
              (e.currentTarget as HTMLButtonElement).style.color = '#ff6b6b';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)';
              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)';
            }}
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '8px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.015)',
        }}
      >
        {(
          [
            { key: 'bold', label: 'Bold', icon: <BoldIcon /> },
            { key: 'italic', label: 'Italic', icon: <ItalicIcon /> },
            { key: 'bullet', label: 'Bullet list', icon: <ListIcon /> },
            { key: 'checkbox', label: 'Checkbox', icon: <CheckIcon /> },
          ] as const
        ).map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => formatText(key)}
            title={label}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              height: 30,
              padding: '0 10px',
              borderRadius: 7,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.55)',
              fontSize: 11,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,255,136,0.1)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,255,136,0.25)';
              (e.currentTarget as HTMLButtonElement).style.color = '#00ff88';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)';
              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.55)';
            }}
          >
            {icon}
            <span>{label}</span>
          </button>
        ))}

        {/* Separator */}
        <div style={{ flex: 1 }} />

        {/* Character limit hint */}
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.04em' }}>
          Markdown supported
        </span>
      </div>

      {/* ── Tabs ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '8px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        {notes.map((note, idx) => {
          const isActive = idx === currentTab;
          return (
            <button
              key={note.id}
              onClick={() => switchTab(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 12px',
                borderRadius: 7,
                border: isActive
                  ? '1px solid rgba(0,255,136,0.3)'
                  : '1px solid rgba(255,255,255,0.07)',
                background: isActive
                  ? 'rgba(0,255,136,0.08)'
                  : 'rgba(255,255,255,0.03)',
                color: isActive ? '#00ff88' : 'rgba(255,255,255,0.55)',
                fontSize: 12,
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit',
                flexShrink: 0,
                letterSpacing: '-0.01em',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    'rgba(255,255,255,0.06)';
                  (e.currentTarget as HTMLButtonElement).style.color =
                    'rgba(255,255,255,0.8)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    'rgba(255,255,255,0.03)';
                  (e.currentTarget as HTMLButtonElement).style.color =
                    'rgba(255,255,255,0.55)';
                }
              }}
            >
              {/* Active dot */}
              {isActive && (
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: '#00ff88',
                    boxShadow: '0 0 6px #00ff88',
                    flexShrink: 0,
                  }}
                />
              )}
              <span>{note.title}</span>
              {notes.length > 1 && (
                <span
                  role="button"
                  onClick={(e) => deleteTab(idx, e)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    color: 'rgba(255,255,255,0.3)',
                    cursor: 'pointer',
                    transition: 'color 0.15s ease',
                    marginLeft: 2,
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLSpanElement).style.color = '#ff6b6b')
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLSpanElement).style.color =
                      'rgba(255,255,255,0.3)')
                  }
                >
                  <CloseIcon />
                </span>
              )}
            </button>
          );
        })}

        {/* Add tab */}
        <button
          onClick={addNewTab}
          title="New note"
          style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              'rgba(0,255,136,0.1)';
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              'rgba(0,255,136,0.3)';
            (e.currentTarget as HTMLButtonElement).style.color = '#00ff88';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              'rgba(255,255,255,0.04)';
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              'rgba(255,255,255,0.08)';
            (e.currentTarget as HTMLButtonElement).style.color =
              'rgba(255,255,255,0.4)';
          }}
        >
          <PlusIcon />
        </button>
      </div>

      {/* ── Editor area ── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '20px',
          gap: 0,
          overflow: 'hidden',
        }}
      >
        <textarea
          ref={textareaRef}
          id="noteEditor"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing…"
          style={{
            flex: 1,
            width: '100%',
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 12,
            padding: '20px 22px',
            color: 'rgba(255,255,255,0.88)',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: 14,
            lineHeight: 1.75,
            resize: 'none',
            outline: 'none',
            caretColor: '#00ff88',
            transition: 'border-color 0.2s ease, background 0.2s ease',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.1) transparent',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'rgba(0,255,136,0.2)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.035)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.025)';
          }}
        />

        {/* Footer: line count */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            paddingTop: 8,
            fontSize: 10,
            color: 'rgba(255,255,255,0.2)',
            letterSpacing: '0.04em',
          }}
        >
          {content.split('\n').length} line{content.split('\n').length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
