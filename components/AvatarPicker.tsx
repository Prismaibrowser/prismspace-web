'use client';

import { useState, useRef } from 'react';

interface AvatarPickerProps {
  currentAvatar: string;
  onAvatarChange: (avatar: string) => void;
}

const EMOJI_AVATARS = [
  '😀', '😎', '🤓', '😜', '🤩', '😇', '🥳', '🤗',
  '🚀', '⭐', '🔥', '💎', '🎨', '🎭', '🎮', '🎯',
  '🦄', '🦊', '🐱', '🐶', '🐼', '🐧', '🦁', '🐯',
  '👾', '🤖', '👽', '🌈', '⚡', '💫', '✨', '🌟',
];

export function AvatarPicker({ currentAvatar, onAvatarChange }: AvatarPickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [tab, setTab] = useState<'emoji' | 'upload'>('emoji');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('File is too large! Please upload an image smaller than 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onAvatarChange(result);
        setShowPicker(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const isEmoji = currentAvatar.length <= 4;
  const isImage = currentAvatar.startsWith('data:image/');

  return (
    <div className="relative">
      {/* Avatar Display */}
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white/20 hover:border-pink-500/50 transition-all group"
      >
        {isEmoji ? (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            {currentAvatar}
          </div>
        ) : isImage ? (
          <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            👤
          </div>
        )}
        
        {/* Edit Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-xs font-medium">Edit</span>
        </div>
      </button>

      {/* Picker Modal */}
      {showPicker && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowPicker(false)}
          />
          
          {/* Picker Content */}
          <div className="absolute left-0 top-28 z-50 w-80 bg-[#1a1f3a] border border-[#283341] rounded-lg shadow-2xl p-4">
            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setTab('emoji')}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                  tab === 'emoji'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                    : 'bg-[#0f141b] text-slate-400 hover:text-slate-200 border border-[#283341]'
                }`}
              >
                😀 Emoji
              </button>
              <button
                onClick={() => setTab('upload')}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                  tab === 'upload'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                    : 'bg-[#0f141b] text-slate-400 hover:text-slate-200 border border-[#283341]'
                }`}
              >
                📷 Upload
              </button>
            </div>

            {/* Emoji Grid */}
            {tab === 'emoji' && (
              <div className="grid grid-cols-8 gap-2 max-h-64 overflow-y-auto">
                {EMOJI_AVATARS.map((emoji, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      onAvatarChange(emoji);
                      setShowPicker(false);
                    }}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-2xl transition-all hover:bg-purple-500/20 ${
                      currentAvatar === emoji ? 'bg-purple-500/30 ring-2 ring-purple-500' : 'bg-[#0f141b]'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Upload Tab */}
            {tab === 'upload' && (
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-3 bg-purple-500/90 hover:bg-purple-500 text-white font-medium rounded transition-colors flex items-center justify-center gap-2"
                >
                  <span>📁</span>
                  Choose Image
                </button>
                <p className="text-xs text-slate-400 text-center">
                  Max 5MB • PNG, JPG, GIF
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
