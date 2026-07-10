'use client';

import { useState } from 'react';

interface GitReferenceProps {
  onClose?: () => void;
}

type TabType = 'cheat-sheet' | 'builder' | 'scenarios';

export function GitReference({ onClose }: GitReferenceProps) {
  const [activeTab, setActiveTab] = useState<TabType>('cheat-sheet');
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [selectedCommand, setSelectedCommand] = useState<string | null>(null);

  const handleCopy = (command: string) => {
    navigator.clipboard.writeText(command);
    setCopiedCommand(command);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const gitCommands = [
    {
      category: 'Viewing History',
      icon: '📜',
      color: 'from-emerald-500/20 to-teal-500/20',
      borderColor: 'border-emerald-500/30',
      accentColor: 'text-emerald-400',
      items: [
        { 
          cmd: 'git log', 
          desc: 'View commit history',
          variants: ['git log --oneline --graph --all'],
          safe: true
        },
        { 
          cmd: 'git show', 
          desc: 'Show commit details',
          variants: ['git show <commit-hash>'],
          safe: true
        },
        { 
          cmd: 'git blame', 
          desc: 'View who changed each line',
          variants: ['git blame <file>'],
          safe: true
        },
        { 
          cmd: 'git diff', 
          desc: 'Show changes between commits',
          variants: ['git diff HEAD~1', 'git diff <branch1>..<branch2>'],
          safe: true
        },
      ],
    },
    {
      category: 'Branching & Merging',
      icon: '🌿',
      color: 'from-violet-500/20 to-purple-500/20',
      borderColor: 'border-violet-500/30',
      accentColor: 'text-violet-400',
      items: [
        { 
          cmd: 'git branch', 
          desc: 'List, create, or delete branches',
          variants: ['git branch <name>', 'git branch -d <name>'],
          safe: true
        },
        { 
          cmd: 'git checkout', 
          desc: 'Switch branches',
          variants: ['git checkout -b <new-branch>'],
          safe: true
        },
        { 
          cmd: 'git merge', 
          desc: 'Merge branches',
          variants: ['git merge <branch>'],
          safe: false
        },
        { 
          cmd: 'git rebase', 
          desc: 'Reapply commits on top of another',
          variants: ['git rebase -i HEAD~3'],
          safe: false
        },
      ],
    },
    {
      category: 'Staging & Commits',
      icon: '💾',
      color: 'from-cyan-500/20 to-blue-500/20',
      borderColor: 'border-cyan-500/30',
      accentColor: 'text-cyan-400',
      items: [
        { 
          cmd: 'git status', 
          desc: 'Check working tree status',
          variants: ['git status -s'],
          safe: true
        },
        { 
          cmd: 'git add', 
          desc: 'Stage changes',
          variants: ['git add .', 'git add -p'],
          safe: true
        },
        { 
          cmd: 'git commit', 
          desc: 'Record changes',
          variants: ['git commit -m "message"', 'git commit --amend'],
          safe: true
        },
        { 
          cmd: 'git reset', 
          desc: 'Unstage or undo commits',
          variants: ['git reset HEAD~1', 'git reset --hard'],
          safe: false
        },
      ],
    },
    {
      category: 'Remote Operations',
      icon: '🌐',
      color: 'from-amber-500/20 to-orange-500/20',
      borderColor: 'border-amber-500/30',
      accentColor: 'text-amber-400',
      items: [
        { 
          cmd: 'git clone', 
          desc: 'Clone a repository',
          variants: ['git clone <url>'],
          safe: true
        },
        { 
          cmd: 'git fetch', 
          desc: 'Download remote changes',
          variants: ['git fetch origin'],
          safe: true
        },
        { 
          cmd: 'git pull', 
          desc: 'Fetch and merge remote changes',
          variants: ['git pull --rebase'],
          safe: false
        },
        { 
          cmd: 'git push', 
          desc: 'Upload local commits',
          variants: ['git push -u origin <branch>'],
          safe: false
        },
      ],
    },
    {
      category: 'Stashing & Cleaning',
      icon: '🧹',
      color: 'from-pink-500/20 to-rose-500/20',
      borderColor: 'border-pink-500/30',
      accentColor: 'text-pink-400',
      items: [
        { 
          cmd: 'git stash', 
          desc: 'Temporarily save changes',
          variants: ['git stash pop', 'git stash list'],
          safe: true
        },
        { 
          cmd: 'git clean', 
          desc: 'Remove untracked files',
          variants: ['git clean -fd'],
          safe: false
        },
        { 
          cmd: 'git restore', 
          desc: 'Discard changes',
          variants: ['git restore <file>', 'git restore --staged <file>'],
          safe: false
        },
        { 
          cmd: 'git rm', 
          desc: 'Remove files from git',
          variants: ['git rm --cached <file>'],
          safe: false
        },
      ],
    },
    {
      category: 'Advanced',
      icon: '⚡',
      color: 'from-red-500/20 to-orange-600/20',
      borderColor: 'border-red-500/30',
      accentColor: 'text-red-400',
      items: [
        { 
          cmd: 'git cherry-pick', 
          desc: 'Apply specific commits',
          variants: ['git cherry-pick <commit>'],
          safe: false
        },
        { 
          cmd: 'git reflog', 
          desc: 'Show reference logs',
          variants: ['git reflog'],
          safe: true
        },
        { 
          cmd: 'git tag', 
          desc: 'Create version tags',
          variants: ['git tag v1.0.0', 'git push --tags'],
          safe: true
        },
        { 
          cmd: 'git bisect', 
          desc: 'Binary search for bugs',
          variants: ['git bisect start', 'git bisect good/bad'],
          safe: true
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-emerald-200 to-teal-300 bg-clip-text text-transparent">
                  Git Command Reference
                </h1>
                <p className="text-sm text-slate-400">Master version control with confidence</p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all duration-200 hover:scale-105"
              >
                Close
              </button>
            )}
          </div>

          {/* Tabs */}
          <nav className="flex gap-2 mt-6" role="tablist">
            {[
              { id: 'cheat-sheet' as TabType, label: 'Cheat Sheet', icon: '📋' },
              { id: 'builder' as TabType, label: 'Builder', icon: '🔨' },
              { id: 'scenarios' as TabType, label: 'Scenarios', icon: '💡' },
            ].map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2
                  ${activeTab === tab.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                  }
                `}
              >
                <span>{tab.icon}</span>
                {tab.label}
                {activeTab === tab.id && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {activeTab === 'cheat-sheet' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {gitCommands.map((section) => (
              <section
                key={section.category}
                className="group relative"
              >
                {/* Card with gradient border effect */}
                <div className={`
                  relative h-full rounded-2xl p-px bg-gradient-to-br ${section.color}
                  transition-all duration-300 hover:shadow-2xl
                `}
                style={{
                  boxShadow: `0 0 40px ${section.color.includes('emerald') ? 'rgba(16, 185, 129, 0.1)' : 
                              section.color.includes('violet') ? 'rgba(139, 92, 246, 0.1)' :
                              section.color.includes('cyan') ? 'rgba(6, 182, 212, 0.1)' :
                              section.color.includes('amber') ? 'rgba(245, 158, 11, 0.1)' :
                              section.color.includes('pink') ? 'rgba(236, 72, 153, 0.1)' :
                              'rgba(239, 68, 68, 0.1)'}`
                }}>
                  <div className="h-full rounded-2xl bg-slate-900/90 backdrop-blur-sm p-6">
                    {/* Category Header */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`
                        text-3xl w-12 h-12 rounded-xl bg-gradient-to-br ${section.color} 
                        flex items-center justify-center border ${section.borderColor}
                      `}>
                        {section.icon}
                      </div>
                      <h2 className={`text-xl font-bold ${section.accentColor}`}>
                        {section.category}
                      </h2>
                    </div>

                    {/* Commands */}
                    <div className="space-y-3">
                      {section.items.map((item, index) => (
                        <div
                          key={index}
                          className="group/item relative"
                        >
                          {/* Main Command */}
                          <div 
                            className={`
                              flex items-center justify-between p-3 rounded-lg
                              bg-slate-800/50 border border-white/5
                              hover:bg-slate-800/80 hover:border-white/10
                              transition-all duration-200 cursor-pointer
                              ${selectedCommand === item.cmd ? 'ring-2 ring-emerald-500/50' : ''}
                            `}
                            onClick={() => setSelectedCommand(selectedCommand === item.cmd ? null : item.cmd)}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <code className="text-sm font-mono text-white font-semibold">
                                  {item.cmd}
                                </code>
                                {!item.safe && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/20 text-red-300 border border-red-500/30">
                                    !
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 mt-1">
                                {item.desc}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(item.cmd);
                              }}
                              className={`
                                ml-3 px-3 py-1.5 rounded-md text-xs font-medium
                                transition-all duration-200 flex-shrink-0
                                ${copiedCommand === item.cmd
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/10'
                                }
                              `}
                            >
                              {copiedCommand === item.cmd ? '✓' : '→'}
                            </button>
                          </div>

                          {/* Variants */}
                          {item.variants && item.variants.length > 0 && (
                            <div className={`
                              mt-2 pl-4 space-y-1.5 overflow-hidden transition-all duration-300
                              ${selectedCommand === item.cmd ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                            `}>
                              {item.variants.map((variant, vIdx) => (
                                <div
                                  key={vIdx}
                                  className="flex items-center justify-between p-2 rounded-md bg-slate-800/30 border border-white/5 hover:border-white/10 transition-colors"
                                >
                                  <code className="text-xs font-mono text-slate-300">
                                    {variant}
                                  </code>
                                  <button
                                    onClick={() => handleCopy(variant)}
                                    className="ml-2 text-xs text-slate-500 hover:text-emerald-400 transition-colors"
                                  >
                                    {copiedCommand === variant ? '✓' : '→'}
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Decorative corner accent */}
                <div className={`
                  absolute -top-1 -right-1 w-16 h-16 rounded-full 
                  bg-gradient-to-br ${section.color} blur-xl opacity-0 
                  group-hover:opacity-100 transition-opacity duration-500 pointer-events-none
                `} />
              </section>
            ))}
          </div>
        )}

        {activeTab === 'builder' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 mb-4">
                  <span className="text-4xl">🔨</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Command Builder</h2>
                <p className="text-slate-400">Interactive git command constructor coming soon</p>
              </div>
              <div className="aspect-video rounded-xl bg-slate-800/50 border-2 border-dashed border-slate-700 flex items-center justify-center">
                <p className="text-slate-500">Under Construction</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scenarios' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 mb-4">
                  <span className="text-4xl">💡</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Common Scenarios</h2>
                <p className="text-slate-400">Real-world git workflows and solutions</p>
              </div>
              <div className="aspect-video rounded-xl bg-slate-800/50 border-2 border-dashed border-slate-700 flex items-center justify-center">
                <p className="text-slate-500">Coming Soon</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer Pro Tips */}
      <footer className="max-w-[1600px] mx-auto px-6 pb-8">
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">💡</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-yellow-400 mb-4">Pro Tips</h3>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-0.5">▸</span>
                  <span>Use <code className="px-2 py-0.5 bg-slate-800 rounded text-emerald-300 text-sm font-mono">git status</code> frequently to understand your current state</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-0.5">▸</span>
                  <span>Always review changes with <code className="px-2 py-0.5 bg-slate-800 rounded text-emerald-300 text-sm font-mono">git diff</code> before committing</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-0.5">▸</span>
                  <span>Write clear, descriptive commit messages in present tense</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-0.5">▸</span>
                  <span>Create feature branches instead of committing directly to main</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-0.5">▸</span>
                  <span>Commands marked with <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/20 text-red-300 border border-red-500/30">!</span> can modify history - use with caution</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
