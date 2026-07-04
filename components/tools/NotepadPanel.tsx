'use client';

import { useState, useEffect } from 'react';

interface Note {
  id: number;
  title: string;
  content: string;
}

interface NotepadPanelProps {
  onClose: () => void;
}

export function NotepadPanel({ onClose }: NotepadPanelProps) {
  const [notes, setNotes] = useState<Note[]>([{ id: Date.now(), title: 'Your ideas here', content: '' }]);
  const [currentTab, setCurrentTab] = useState(0);
  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    // Load notes from localStorage
    const saved = localStorage.getItem('notepadTabs');
    if (saved) {
      const loadedNotes = JSON.parse(saved);
      setNotes(loadedNotes);
      if (loadedNotes[0]) {
        setContent(loadedNotes[0].content);
      }
    }
  }, []);

  useEffect(() => {
    // Update stats
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setCharCount(content.length);

    // Auto-save
    const timer = setTimeout(() => {
      const updatedNotes = [...notes];
      updatedNotes[currentTab] = { ...updatedNotes[currentTab], content };
      setNotes(updatedNotes);
      localStorage.setItem('notepadTabs', JSON.stringify(updatedNotes));
    }, 1000);

    return () => clearTimeout(timer);
  }, [content, currentTab]);

  const switchTab = (index: number) => {
    // Save current
    const updatedNotes = [...notes];
    updatedNotes[currentTab] = { ...updatedNotes[currentTab], content };
    setNotes(updatedNotes);
    
    // Switch
    setCurrentTab(index);
    setContent(updatedNotes[index].content);
  };

  const addNewTab = () => {
    const newNote: Note = {
      id: Date.now(),
      title: `Note ${notes.length + 1}`,
      content: '',
    };
    setNotes([...notes, newNote]);
    setCurrentTab(notes.length);
    setContent('');
  };

  const deleteTab = (index: number) => {
    if (notes.length === 1) return;
    const updatedNotes = notes.filter((_, i) => i !== index);
    setNotes(updatedNotes);
    localStorage.setItem('notepadTabs', JSON.stringify(updatedNotes));
    
    if (currentTab >= updatedNotes.length) {
      setCurrentTab(updatedNotes.length - 1);
      setContent(updatedNotes[updatedNotes.length - 1].content);
    } else if (currentTab === index) {
      setContent(updatedNotes[currentTab].content);
    }
  };

  const downloadNote = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${notes[currentTab].title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatText = (format: string) => {
    const textarea = document.getElementById('noteEditor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);

    let formatted = '';
    switch (format) {
      case 'bold':
        formatted = `**${selected}**`;
        break;
      case 'italic':
        formatted = `*${selected}*`;
        break;
      case 'bullet':
        formatted = `\n• ${selected}`;
        break;
      case 'checkbox':
        formatted = `\n☐ ${selected}`;
        break;
      default:
        formatted = selected;
    }

    const newContent = content.substring(0, start) + formatted + content.substring(end);
    setContent(newContent);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#0a0a0a] to-black text-white">
      {/* Header */}
      <div className="flex justify-between items-center p-5 border-b border-white/15 bg-white/[0.02]">
        <div className="flex items-center gap-3 text-xl font-semibold">
          <span>📝</span>
          <span>Notepad</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-4 text-xs text-white/50">
            <span>Words: <strong className="text-white">{wordCount}</strong></span>
            <span>|</span>
            <span>Characters: <strong className="text-white">{charCount}</strong></span>
          </div>
          <button
            onClick={downloadNote}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 
                       border border-white/20 hover:bg-white/20 transition-all"
            title="Download"
          >
            ⬇️
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 
                       border border-white/20 hover:bg-red-500/20 hover:border-red-500/40 
                       hover:text-red-500 transition-all text-xl"
            title="Close"
          >
            ×
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex gap-2 p-3 border-b border-white/15 bg-white/[0.03] flex-wrap">
        <button
          onClick={() => formatText('bold')}
          className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 
                     transition-all font-bold"
          title="Bold"
        >
          B
        </button>
        <button
          onClick={() => formatText('italic')}
          className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 
                     transition-all italic"
          title="Italic"
        >
          I
        </button>
        <button
          onClick={() => formatText('bullet')}
          className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 
                     transition-all"
          title="Bullet List"
        >
          ⋮≡
        </button>
        <button
          onClick={() => formatText('checkbox')}
          className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 
                     transition-all"
          title="Checkbox"
        >
          ☐
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-3 border-b border-white/15 bg-white/[0.03] overflow-x-auto">
        {notes.map((note, index) => (
          <div
            key={note.id}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer 
                       whitespace-nowrap transition-all ${
              currentTab === index
                ? 'bg-white/20 border-white/35 text-white'
                : 'bg-white/10 border-white/20 text-white/85 hover:bg-white/15'
            }`}
            onClick={() => switchTab(index)}
          >
            <span>{note.title}</span>
            {notes.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTab(index);
                }}
                className="text-white/60 hover:text-red-500 text-lg transition-colors"
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addNewTab}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 
                     border border-white/20 hover:bg-white/20 transition-all font-bold"
          title="New Note"
        >
          +
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 p-6 overflow-y-auto">
        <textarea
          id="noteEditor"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-full bg-white/[0.03] border border-white/5 rounded-lg p-4 
                     text-white font-mono text-[15px] leading-relaxed resize-none outline-none
                     focus:bg-white/[0.05] focus:border-white/15 transition-all"
          placeholder="Start typing your notes here..."
        />
      </div>
    </div>
  );
}
