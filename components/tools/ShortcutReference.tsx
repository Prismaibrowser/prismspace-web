'use client';

interface ShortcutReferenceProps {
  onClose?: () => void;
}

export function ShortcutReference({ onClose }: ShortcutReferenceProps) {
  const shortcuts = [
    {
      category: 'VS Code',
      items: [
        { keys: 'Ctrl + P', desc: 'Quick file open' },
        { keys: 'Ctrl + Shift + P', desc: 'Command palette' },
        { keys: 'Ctrl + `', desc: 'Toggle terminal' },
        { keys: 'Ctrl + B', desc: 'Toggle sidebar' },
        { keys: 'Ctrl + /', desc: 'Toggle comment' },
        { keys: 'Alt + ↑/↓', desc: 'Move line up/down' },
        { keys: 'Ctrl + D', desc: 'Select next occurrence' },
        { keys: 'Ctrl + Shift + K', desc: 'Delete line' },
        { keys: 'Ctrl + Shift + L', desc: 'Select all occurrences' },
        { keys: 'F2', desc: 'Rename symbol' },
      ],
    },
    {
      category: 'Windows',
      items: [
        { keys: 'Win + D', desc: 'Show desktop' },
        { keys: 'Win + E', desc: 'Open File Explorer' },
        { keys: 'Win + L', desc: 'Lock computer' },
        { keys: 'Win + Tab', desc: 'Task view' },
        { keys: 'Win + V', desc: 'Clipboard history' },
        { keys: 'Alt + Tab', desc: 'Switch windows' },
        { keys: 'Ctrl + Shift + Esc', desc: 'Task Manager' },
        { keys: 'Win + Shift + S', desc: 'Screenshot tool' },
      ],
    },
    {
      category: 'Chrome',
      items: [
        { keys: 'Ctrl + T', desc: 'New tab' },
        { keys: 'Ctrl + W', desc: 'Close tab' },
        { keys: 'Ctrl + Shift + T', desc: 'Reopen closed tab' },
        { keys: 'Ctrl + Tab', desc: 'Next tab' },
        { keys: 'Ctrl + Shift + Tab', desc: 'Previous tab' },
        { keys: 'Ctrl + L', desc: 'Focus address bar' },
        { keys: 'Ctrl + Shift + N', desc: 'New incognito window' },
        { keys: 'F12', desc: 'Open DevTools' },
      ],
    },
    {
      category: 'Text Editing',
      items: [
        { keys: 'Ctrl + A', desc: 'Select all' },
        { keys: 'Ctrl + C', desc: 'Copy' },
        { keys: 'Ctrl + V', desc: 'Paste' },
        { keys: 'Ctrl + X', desc: 'Cut' },
        { keys: 'Ctrl + Z', desc: 'Undo' },
        { keys: 'Ctrl + Y', desc: 'Redo' },
        { keys: 'Ctrl + F', desc: 'Find' },
        { keys: 'Ctrl + H', desc: 'Replace' },
        { keys: 'Ctrl + ←/→', desc: 'Jump words' },
        { keys: 'Shift + ←/→', desc: 'Select characters' },
      ],
    },
    {
      category: 'Terminal',
      items: [
        { keys: 'Ctrl + C', desc: 'Cancel command' },
        { keys: 'Ctrl + L', desc: 'Clear screen' },
        { keys: 'Tab', desc: 'Autocomplete' },
        { keys: '↑/↓', desc: 'Command history' },
        { keys: 'Ctrl + R', desc: 'Search history' },
        { keys: 'Ctrl + A', desc: 'Start of line' },
        { keys: 'Ctrl + E', desc: 'End of line' },
        { keys: 'Ctrl + U', desc: 'Clear line' },
      ],
    },
    {
      category: 'GitHub Desktop',
      items: [
        { keys: 'Ctrl + 1', desc: 'Changes tab' },
        { keys: 'Ctrl + 2', desc: 'History tab' },
        { keys: 'Ctrl + Enter', desc: 'Commit changes' },
        { keys: 'Ctrl + P', desc: 'Push commits' },
        { keys: 'Ctrl + Shift + P', desc: 'Pull changes' },
        { keys: 'Ctrl + T', desc: 'Switch repository' },
        { keys: 'Ctrl + Shift + N', desc: 'New branch' },
        { keys: 'Ctrl + Shift + B', desc: 'Switch branch' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-radial from-[#17293c] via-[#0a0d12] to-[#0a0d12] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Keyboard Shortcuts</h1>
          <p className="text-sm text-slate-400 mt-2">
            Quick reference for common keyboard shortcuts across tools
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {shortcuts.map((section) => (
            <section
              key={section.category}
              className="bg-[rgba(18,24,32,0.94)] border border-[#283341] rounded-[18px] p-[18px]"
            >
              <h2 className="text-lg font-bold mb-4 text-purple-400">
                {section.category}
              </h2>
              
              <div className="space-y-2">
                {section.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 bg-[#0f141b] border border-[#283341] rounded-lg"
                  >
                    <span className="text-xs text-slate-400">{item.desc}</span>
                    <kbd className="px-2 py-1 bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] rounded text-xs font-mono text-slate-300">
                      {item.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-6 bg-[rgba(18,24,32,0.94)] border border-[#283341] rounded-[18px] p-[18px]">
          <h2 className="text-xl font-bold mb-3 text-amber-400">
            💡 Pro Tips
          </h2>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>• Most apps have Ctrl + ? or F1 for help/shortcuts</li>
            <li>• Ctrl usually works like Cmd on Mac for cross-platform apps</li>
            <li>• Learn 5-10 shortcuts you use most, then gradually add more</li>
            <li>• Muscle memory takes 2-3 weeks of consistent use</li>
            <li>• Customize shortcuts in most apps via Settings/Preferences</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
