'use client';

import { useState, useRef } from 'react';

interface GitReferenceProps {
  onClose?: () => void;
}

type TabType = 'cheat-sheet' | 'builder' | 'scenarios';

const gitCommands = [
  {
    category: 'History',
    slug: 'history',
    glyph: '◎',
    hue: '142',        // emerald
    items: [
      { cmd: 'git log',   desc: 'View commit history',        variants: ['git log --oneline --graph --all'], safe: true },
      { cmd: 'git show',  desc: 'Show commit details',        variants: ['git show <commit-hash>'],          safe: true },
      { cmd: 'git blame', desc: 'View who changed each line', variants: ['git blame <file>'],                safe: true },
      { cmd: 'git diff',  desc: 'Show changes between commits',variants: ['git diff HEAD~1', 'git diff <b1>..<b2>'], safe: true },
    ],
  },
  {
    category: 'Branches',
    slug: 'branches',
    glyph: '⑂',
    hue: '262',        // violet
    items: [
      { cmd: 'git branch',   desc: 'List, create, or delete branches', variants: ['git branch <name>', 'git branch -d <name>'], safe: true },
      { cmd: 'git checkout', desc: 'Switch branches',                  variants: ['git checkout -b <new-branch>'],              safe: true },
      { cmd: 'git merge',    desc: 'Merge branches',                   variants: ['git merge <branch>'],                        safe: false },
      { cmd: 'git rebase',   desc: 'Reapply commits on top of another',variants: ['git rebase -i HEAD~3'],                      safe: false },
    ],
  },
  {
    category: 'Staging',
    slug: 'staging',
    glyph: '▣',
    hue: '198',        // cyan
    items: [
      { cmd: 'git status', desc: 'Check working tree status',  variants: ['git status -s'],                          safe: true },
      { cmd: 'git add',    desc: 'Stage changes',              variants: ['git add .', 'git add -p'],                safe: true },
      { cmd: 'git commit', desc: 'Record changes',             variants: ['git commit -m "msg"', 'git commit --amend'], safe: true },
      { cmd: 'git reset',  desc: 'Unstage or undo commits',   variants: ['git reset HEAD~1', 'git reset --hard'],   safe: false },
    ],
  },
  {
    category: 'Remotes',
    slug: 'remotes',
    hue: '38',         // amber
    glyph: '⇅',
    items: [
      { cmd: 'git clone', desc: 'Clone a repository',            variants: ['git clone <url>'],              safe: true  },
      { cmd: 'git fetch', desc: 'Download remote changes',       variants: ['git fetch origin'],             safe: true  },
      { cmd: 'git pull',  desc: 'Fetch and merge remote changes',variants: ['git pull --rebase'],            safe: false },
      { cmd: 'git push',  desc: 'Upload local commits',          variants: ['git push -u origin <branch>'], safe: false },
    ],
  },
  {
    category: 'Stash',
    slug: 'stash',
    glyph: '⊕',
    hue: '322',        // pink
    items: [
      { cmd: 'git stash',   desc: 'Temporarily save changes',  variants: ['git stash pop', 'git stash list'],            safe: true  },
      { cmd: 'git clean',   desc: 'Remove untracked files',    variants: ['git clean -fd'],                              safe: false },
      { cmd: 'git restore', desc: 'Discard changes',           variants: ['git restore <file>', 'git restore --staged'], safe: false },
      { cmd: 'git rm',      desc: 'Remove files from git',     variants: ['git rm --cached <file>'],                     safe: false },
    ],
  },
  {
    category: 'Advanced',
    slug: 'advanced',
    glyph: '⚡',
    hue: '0',          // red
    items: [
      { cmd: 'git cherry-pick', desc: 'Apply specific commits',   variants: ['git cherry-pick <commit>'],               safe: false },
      { cmd: 'git reflog',      desc: 'Show reference logs',      variants: ['git reflog'],                             safe: true  },
      { cmd: 'git tag',         desc: 'Create version tags',      variants: ['git tag v1.0.0', 'git push --tags'],      safe: true  },
      { cmd: 'git bisect',      desc: 'Binary search for bugs',   variants: ['git bisect start', 'git bisect good/bad'],safe: true  },
    ],
  },
] as const;

const scenarios = [
  {
    title: 'Undo last commit (keep changes)',
    steps: ['git reset HEAD~1', 'git status'],
    danger: false,
    note: 'Your files are unchanged — only the commit is rolled back.',
  },
  {
    title: 'Fix a mistake on the wrong branch',
    steps: ['git stash', 'git checkout correct-branch', 'git stash pop'],
    danger: false,
    note: 'Stash saves staged + unstaged changes; pop restores them.',
  },
  {
    title: 'Clean up feature branch before PR',
    steps: ['git rebase -i HEAD~N', '# squash / reword in editor', 'git push --force-with-lease'],
    danger: true,
    note: 'Interactive rebase rewrites history — only use on your own branches.',
  },
  {
    title: 'Recover a deleted branch',
    steps: ['git reflog', 'git checkout -b recovered-branch <sha>'],
    danger: false,
    note: 'Reflog keeps a 90-day history of every HEAD position.',
  },
  {
    title: 'Cherry-pick a commit to main',
    steps: ['git log feature-branch --oneline', 'git checkout main', 'git cherry-pick <commit-sha>'],
    danger: true,
    note: 'Creates a new commit with the same changes; can cause conflicts.',
  },
  {
    title: 'Sync fork with upstream',
    steps: [
      'git remote add upstream <original-repo>',
      'git fetch upstream',
      'git checkout main',
      'git merge upstream/main',
    ],
    danger: false,
    note: 'Run this periodically to keep your fork up to date.',
  },
];

// ── Builder options ─────────────────────────────────────────────────────────

const builderOptions = {
  base: [
    { label: 'log',         value: 'git log',         help: 'Show commit history' },
    { label: 'commit',      value: 'git commit',      help: 'Record staged changes' },
    { label: 'push',        value: 'git push',        help: 'Upload to remote' },
    { label: 'pull',        value: 'git pull',        help: 'Fetch + merge' },
    { label: 'diff',        value: 'git diff',        help: 'Show changes' },
    { label: 'stash',       value: 'git stash',       help: 'Save work in progress' },
    { label: 'cherry-pick', value: 'git cherry-pick', help: 'Apply a commit' },
    { label: 'rebase',      value: 'git rebase',      help: 'Rewrite history' },
  ],
  flags: {
    'git log':          ['--oneline', '--graph', '--all', '--stat', '-p', '--follow'],
    'git commit':       ['-m "message"', '--amend', '--no-verify', '-a'],
    'git push':         ['-u origin main', '--force-with-lease', '--tags', '--dry-run'],
    'git pull':         ['--rebase', '--no-ff', '--autostash'],
    'git diff':         ['HEAD~1', '--cached', '--stat', '--name-only'],
    'git stash':        ['pop', 'list', 'drop', 'show -p'],
    'git cherry-pick':  ['--no-commit', '--edit', '--abort', '--continue'],
    'git rebase':       ['-i HEAD~3', '--onto main', '--abort', '--continue'],
  } as Record<string, string[]>,
};

export function GitReference({ onClose }: GitReferenceProps) {
  const [activeTab, setActiveTab]     = useState<TabType>('cheat-sheet');
  const [copied, setCopied]           = useState<string | null>(null);
  const [expanded, setExpanded]       = useState<string | null>(null);
  const [search, setSearch]           = useState('');
  const [activeSection, setActive]    = useState<string | null>(null);

  // Builder
  const [builderBase, setBuilderBase]     = useState('git log');
  const [builderFlags, setBuilderFlags]   = useState<string[]>([]);
  const [builderExtra, setBuilderExtra]   = useState('');
  const builtCmd = [builderBase, ...builderFlags, builderExtra].filter(Boolean).join(' ');

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleExpand = (key: string) => setExpanded(p => p === key ? null : key);
  const toggleFlag   = (flag: string) =>
    setBuilderFlags(p => p.includes(flag) ? p.filter(f => f !== flag) : [...p, flag]);

  // Filter cheat-sheet items
  const filtered = gitCommands.map(sec => ({
    ...sec,
    items: sec.items.filter(
      it => !search || it.cmd.includes(search.toLowerCase()) || it.desc.toLowerCase().includes(search.toLowerCase()),
    ),
  })).filter(s => s.items.length > 0);

  const TABS: { id: TabType; label: string; icon: string }[] = [
    { id: 'cheat-sheet', label: 'Cheat Sheet', icon: '≡' },
    { id: 'builder',     label: 'Builder',     icon: '◈' },
    { id: 'scenarios',   label: 'Scenarios',   icon: '▷' },
  ];

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0,
      background: '#0d0d0f', color: '#e2e8f0',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      fontSize: 13,
    }}>

      {/* ── Top bar ── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: 52, flexShrink: 0,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.02)',
        gap: 16,
      }}>


        {/* tabs */}
        <nav style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 3 }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 14px', borderRadius: 7, border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 500, transition: 'all 0.15s',
                background: activeTab === t.id ? '#fff' : 'transparent',
                color: activeTab === t.id ? '#0d0d0f' : '#64748b',
                fontFamily: 'inherit',
              }}
            >
              <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* search — only on cheat sheet */}
          {activeTab === 'cheat-sheet' && (
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#475569', fontSize: 11 }}>⌕</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search commands…"
                style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8, color: '#e2e8f0', fontSize: 12, padding: '5px 10px 5px 26px',
                  outline: 'none', width: 180, fontFamily: 'inherit',
                }}
              />
            </div>
          )}
          {onClose && (
            <button
              onClick={onClose}
              style={{
                width: 28, height: 28, borderRadius: 7, border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.04)', color: '#64748b', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
              }}
            >✕</button>
          )}
        </div>
      </header>

      {/* ── Body ── */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>

        {/* ═══════════ CHEAT SHEET ═══════════ */}
        {activeTab === 'cheat-sheet' && (
          <div style={{ display: 'flex', height: '100%', minHeight: 0 }}>

            {/* Sidebar – category nav */}
            <aside style={{
              width: 160, flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(255,255,255,0.01)', padding: '12px 8px', overflowY: 'auto',
            }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#334155', padding: '0 4px', marginBottom: 8 }}>
                Categories
              </div>
              {gitCommands.map(sec => {
                const active = activeSection === sec.slug;
                return (
                  <button
                    key={sec.slug}
                    onClick={() => setActive(s => s === sec.slug ? null : sec.slug)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      width: '100%', padding: '6px 8px', marginBottom: 2,
                      borderRadius: 7, border: 'none', cursor: 'pointer', textAlign: 'left',
                      background: active ? `hsl(${sec.hue} 80% 60% / 0.12)` : 'transparent',
                      color: active ? `hsl(${sec.hue} 80% 75%)` : '#64748b',
                      fontFamily: 'inherit', fontSize: 12, fontWeight: active ? 600 : 400,
                      transition: 'all 0.12s',
                    }}
                  >
                    <span style={{ fontFamily: 'monospace', fontSize: 14, lineHeight: 1, color: `hsl(${sec.hue} 80% 65%)` }}>{sec.glyph}</span>
                    {sec.category}
                  </button>
                );
              })}

              <div style={{ marginTop: 16, padding: '8px', borderRadius: 8, background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.15)' }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, color: '#f97316', marginBottom: 6, letterSpacing: '0.05em' }}>⚠ DANGER</div>
                <div style={{ fontSize: 10.5, color: '#94a3b8', lineHeight: 1.5 }}>Commands marked <span style={{ color: '#f87171' }}>!</span> rewrite history</div>
              </div>
            </aside>

            {/* Command grid */}
            <main style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
              {(filtered.length === 0) ? (
                <div style={{ textAlign: 'center', padding: 60, color: '#334155' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>◌</div>
                  <p>No commands match &ldquo;{search}&rdquo;</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                  {filtered
                    .filter(s => !activeSection || s.slug === activeSection)
                    .map(sec => (
                    <div
                      key={sec.slug}
                      style={{
                        borderRadius: 12, overflow: 'hidden',
                        border: `1px solid hsl(${sec.hue} 60% 50% / 0.15)`,
                        background: `hsl(${sec.hue} 30% 8% / 0.8)`,
                      }}
                    >
                      {/* Section header */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 14px',
                        borderBottom: `1px solid hsl(${sec.hue} 60% 50% / 0.12)`,
                        background: `hsl(${sec.hue} 40% 12% / 0.6)`,
                      }}>
                        <span style={{ fontFamily: 'monospace', fontSize: 18, color: `hsl(${sec.hue} 75% 65%)`, lineHeight: 1 }}>{sec.glyph}</span>
                        <span style={{ fontWeight: 700, fontSize: 13, color: `hsl(${sec.hue} 70% 75%)`, letterSpacing: '-0.01em' }}>{sec.category}</span>
                        <span style={{ marginLeft: 'auto', fontSize: 10, color: `hsl(${sec.hue} 60% 50%)`, fontFamily: 'monospace', background: `hsl(${sec.hue} 60% 50% / 0.12)`, padding: '2px 6px', borderRadius: 4 }}>
                          {sec.items.length} cmds
                        </span>
                      </div>

                      {/* Command rows */}
                      <div style={{ padding: '6px 0' }}>
                        {sec.items.map((item, idx) => {
                          const key = `${sec.slug}-${idx}`;
                          const isExp = expanded === key;
                          const isCopied = copied === item.cmd;
                          return (
                            <div key={key}>
                              <div
                                style={{
                                  display: 'flex', alignItems: 'center',
                                  padding: '8px 14px', cursor: 'pointer',
                                  transition: 'background 0.12s',
                                  background: isExp ? `hsl(${sec.hue} 40% 10% / 0.5)` : 'transparent',
                                }}
                                onClick={() => toggleExpand(key)}
                                onMouseEnter={e => { if (!isExp) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
                                onMouseLeave={e => { if (!isExp) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                              >
                                {/* expand indicator */}
                                <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#334155', marginRight: 8, flexShrink: 0, transition: 'transform 0.15s', display: 'inline-block', transform: isExp ? 'rotate(90deg)' : 'none' }}>▶</span>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <code style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: 12.5, color: '#f1f5f9', fontWeight: 600 }}>{item.cmd}</code>
                                    {!item.safe && (
                                      <span style={{ fontSize: 9.5, padding: '1px 5px', borderRadius: 4, background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', fontWeight: 700 }}>!</span>
                                    )}
                                  </div>
                                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{item.desc}</div>
                                </div>

                                <button
                                  onClick={e => { e.stopPropagation(); copy(item.cmd); }}
                                  style={{
                                    marginLeft: 8, padding: '3px 8px', borderRadius: 6, cursor: 'pointer',
                                    fontSize: 10.5, fontFamily: 'monospace', transition: 'all 0.15s', flexShrink: 0,
                                    background: isCopied ? `hsl(${sec.hue} 60% 30% / 0.4)` : 'rgba(255,255,255,0.04)',
                                    color: isCopied ? `hsl(${sec.hue} 75% 65%)` : '#475569',
                                    border: `1px solid ${isCopied ? `hsl(${sec.hue} 60% 40% / 0.4)` : 'rgba(255,255,255,0.06)'}`,
                                  }}
                                >
                                  {isCopied ? '✓' : 'copy'}
                                </button>
                              </div>

                              {/* Variants */}
                              {isExp && item.variants.length > 0 && (
                                <div style={{ borderTop: `1px solid hsl(${sec.hue} 40% 15%)`, padding: '6px 14px 10px', background: `hsl(${sec.hue} 20% 6%)` }}>
                                  <div style={{ fontSize: 9.5, color: '#334155', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6, fontWeight: 700 }}>Variants</div>
                                  {item.variants.map((v, vi) => (
                                    <div
                                      key={vi}
                                      style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '5px 8px', borderRadius: 6, marginBottom: 3,
                                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                                      }}
                                    >
                                      <code style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: 11, color: '#94a3b8' }}>{v}</code>
                                      <button
                                        onClick={() => copy(v)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10.5, color: copied === v ? '#4ade80' : '#334155', fontFamily: 'monospace', padding: '0 4px' }}
                                      >{copied === v ? '✓' : 'copy'}</button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pro tips strip */}
              <div style={{ marginTop: 24, borderRadius: 10, border: '1px solid rgba(249,115,22,0.15)', background: 'rgba(249,115,22,0.05)', padding: '14px 18px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#f97316', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Pro tips</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '6px 24px' }}>
                  {[
                    'Run git status often to understand your current state',
                    'Review changes with git diff before every commit',
                    'Write commit messages in imperative present tense',
                    'Use feature branches — never commit directly to main',
                    'Commands marked ! can rewrite history — proceed with care',
                  ].map((tip, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: '#94a3b8', alignItems: 'flex-start' }}>
                      <span style={{ color: '#f97316', flexShrink: 0 }}>▸</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </main>
          </div>
        )}

        {/* ═══════════ BUILDER ═══════════ */}
        {activeTab === 'builder' && (
          <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 20px' }}>
            {/* terminal preview */}
            <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', marginBottom: 20 }}>
              <div style={{ background: '#1a1a1e', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 7 }}>
                {['#ef4444','#f59e0b','#22c55e'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.7 }} />)}
                <span style={{ fontSize: 11, color: '#334155', marginLeft: 6 }}>Terminal</span>
              </div>
              <div style={{ background: '#0a0a0c', padding: '16px 18px', fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: 14, minHeight: 56, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#22c55e', userSelect: 'none' }}>$</span>
                <span style={{ color: '#f1f5f9', wordBreak: 'break-all' }}>{builtCmd}</span>
                <span style={{ display: 'inline-block', width: 2, height: 18, background: '#f97316', animation: 'blink 1.2s step-end infinite', flexShrink: 0 }} />
              </div>
              <style>{`@keyframes blink { 50%{opacity:0} }`}</style>
            </div>

            {/* Base command */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#475569', marginBottom: 10 }}>Base command</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {builderOptions.base.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setBuilderBase(opt.value); setBuilderFlags([]); }}
                    title={opt.help}
                    style={{
                      padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: 12, transition: 'all 0.12s',
                      background: builderBase === opt.value ? '#f97316' : 'rgba(255,255,255,0.05)',
                      color:      builderBase === opt.value ? '#0d0d0f'  : '#94a3b8',
                      fontWeight: builderBase === opt.value ? 700 : 400,
                    }}
                  >{opt.label}</button>
                ))}
              </div>
            </div>

            {/* Flags */}
            {builderOptions.flags[builderBase] && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#475569', marginBottom: 10 }}>Flags & arguments</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {builderOptions.flags[builderBase].map(flag => {
                    const on = builderFlags.includes(flag);
                    return (
                      <button
                        key={flag}
                        onClick={() => toggleFlag(flag)}
                        style={{
                          padding: '5px 12px', borderRadius: 8, cursor: 'pointer',
                          fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: 11.5, transition: 'all 0.12s',
                          background: on ? 'rgba(249,115,22,0.18)' : 'rgba(255,255,255,0.04)',
                          color:      on ? '#fb923c' : '#64748b',
                          border:     on ? '1px solid rgba(249,115,22,0.4)' : '1px solid rgba(255,255,255,0.07)',
                          fontWeight: on ? 600 : 400,
                        }}
                      >{flag}</button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Extra args */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#475569', marginBottom: 10 }}>Extra (type anything)</div>
              <input
                value={builderExtra}
                onChange={e => setBuilderExtra(e.target.value)}
                placeholder="e.g.  origin main  or  HEAD~2"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8, color: '#e2e8f0', fontSize: 12.5, padding: '9px 14px',
                  outline: 'none', fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                }}
              />
            </div>

            {/* Copy button */}
            <button
              onClick={() => copy(builtCmd)}
              style={{
                width: '100%', padding: '11px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: copied === builtCmd ? '#22c55e' : '#f97316',
                color: '#0d0d0f', fontWeight: 700, fontSize: 13, transition: 'all 0.15s',
                fontFamily: 'inherit', letterSpacing: '-0.01em',
              }}
            >
              {copied === builtCmd ? '✓ Copied to clipboard' : '⎘ Copy command'}
            </button>
          </div>
        )}

        {/* ═══════════ SCENARIOS ═══════════ */}
        {activeTab === 'scenarios' && (
          <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 20px' }}>
            <p style={{ fontSize: 12, color: '#475569', marginBottom: 20 }}>
              Common real-world git workflows — click any step to copy it.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {scenarios.map((sc, si) => (
                <div
                  key={si}
                  style={{
                    borderRadius: 12, overflow: 'hidden',
                    border: `1px solid ${sc.danger ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.07)'}`,
                    background: sc.danger ? 'rgba(239,68,68,0.04)' : 'rgba(255,255,255,0.02)',
                  }}
                >
                  {/* title bar */}
                  <div style={{
                    padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10,
                    borderBottom: `1px solid ${sc.danger ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.05)'}`,
                    background: sc.danger ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.03)',
                  }}>
                    <span style={{ fontSize: 14, lineHeight: 1 }}>{sc.danger ? '⚠️' : '✦'}</span>
                    <span style={{ fontWeight: 700, fontSize: 13, color: sc.danger ? '#fca5a5' : '#f1f5f9' }}>{sc.title}</span>
                    {sc.danger && <span style={{ marginLeft: 'auto', fontSize: 10, padding: '2px 8px', borderRadius: 5, background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', fontWeight: 700 }}>DANGER</span>}
                  </div>

                  {/* steps */}
                  <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {sc.steps.map((step, i) => {
                      const isComment = step.startsWith('#');
                      return (
                        <div
                          key={i}
                          onClick={() => !isComment && copy(step)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '7px 10px', borderRadius: 7,
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                            cursor: isComment ? 'default' : 'pointer', transition: 'background 0.1s',
                          }}
                          onMouseEnter={e => { if (!isComment) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
                        >
                          <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#334155', flexShrink: 0, userSelect: 'none' }}>{String(i + 1).padStart(2, '0')}</span>
                          <code style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: 12, color: isComment ? '#475569' : '#94a3b8', fontStyle: isComment ? 'italic' : 'normal', flex: 1 }}>{step}</code>
                          {!isComment && (
                            <span style={{ fontSize: 10, color: copied === step ? '#4ade80' : '#334155', fontFamily: 'monospace', flexShrink: 0 }}>
                              {copied === step ? '✓' : 'copy'}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* note */}
                  <div style={{ padding: '0 16px 12px', fontSize: 11.5, color: '#475569', fontStyle: 'italic' }}>
                    ↳ {sc.note}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
