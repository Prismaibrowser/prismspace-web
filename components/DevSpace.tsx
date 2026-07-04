'use client';

import CardFlip from './kokonutui/card-flip';

interface Tool {
  icon: string;
  title: string;
  desc: string;
  action?: string;
  href?: string;
  uses?: string[];
}

const tools: Tool[] = [
  { 
    icon: '📋', 
    title: 'JSON Toolkit', 
    desc: 'Format, validate, diff, & transform JSON', 
    action: 'json-toolkit',
    uses: [
      'Format and beautify JSON data',
      'Validate JSON syntax',
      'Compare two JSON objects',
      'Transform JSON structure'
    ]
  },
  { 
    icon: '🔐', 
    title: 'Crypto Utils', 
    desc: 'Hash, encode/decode, JWT, UUID, passwords', 
    action: 'crypto-utils',
    uses: [
      'Generate secure hashes (MD5, SHA)',
      'Encode/decode Base64, URL',
      'Create and verify JWTs',
      'Generate UUIDs and passwords'
    ]
  },
  { 
    icon: '⚙️', 
    title: 'Regex Workbench', 
    desc: 'Test patterns, match highlighting, library', 
    action: 'regex-workbench',
    uses: [
      'Test regex patterns live',
      'Highlight matches visually',
      'Access common regex library',
      'Debug complex expressions'
    ]
  },
  { 
    icon: '📝', 
    title: 'Markdown Editor', 
    desc: 'Live preview, toolbar, auto-save', 
    action: 'markdown-editor',
    uses: [
      'Write with live preview',
      'Use formatting toolbar',
      'Auto-save your work',
      'Export to HTML or PDF'
    ]
  },
  { 
    icon: '🐙', 
    title: 'Git Reference', 
    desc: 'Cheat sheet, builder, scenarios', 
    action: 'git-reference',
    uses: [
      'Quick command reference',
      'Build complex git commands',
      'Learn common scenarios',
      'Master git workflows'
    ]
  },
  { 
    icon: '🕐', 
    title: 'Time & Date', 
    desc: 'Timestamp converter, world clock, cron', 
    action: 'time-date',
    uses: [
      'Convert Unix timestamps',
      'View multiple timezones',
      'Build cron expressions',
      'Calculate date differences'
    ]
  },
  { 
    icon: '🎨', 
    title: 'Color Gen', 
    desc: 'Interactive color palette generator', 
    action: 'color-gen',
    uses: [
      'Generate color palettes',
      'Pick colors interactively',
      'Export in multiple formats',
      'Create harmonious schemes'
    ]
  },
  { 
    icon: '🤖', 
    title: 'Prompt Synthesizer', 
    desc: 'AI-powered prompt enhancement tool', 
    action: 'prompt-synthesizer',
    uses: [
      'Enhance AI prompts',
      'Get better AI responses',
      'Learn prompt engineering',
      'Save and reuse templates'
    ]
  },
  { 
    icon: '✅', 
    title: 'Checklist Manager', 
    desc: 'Named lists, templates, drag-and-drop, print mode', 
    href: '/dev-space/checklist-manager.html',
    uses: [
      'Create multiple checklists',
      'Use pre-built templates',
      'Drag to reorder items',
      'Print for offline use'
    ]
  },
  { 
    icon: '⏱️', 
    title: 'Focus Timer', 
    desc: 'Pomodoro timer, stats, task label, minimal mode', 
    href: '/dev-space/focus-settings.html',
    uses: [
      'Track focus sessions',
      'View daily statistics',
      'Label your tasks',
      'Use minimal fullscreen mode'
    ]
  },
  { 
    icon: '🔖', 
    title: 'Bookmark Manager', 
    desc: 'Save, tag, search, import, export, and track visits', 
    href: '/dev-space/bookmark-manager.html',
    uses: [
      'Organize with tags',
      'Search across all fields',
      'Track visit counts',
      'Import/export bookmarks'
    ]
  },
  { 
    icon: '📈', 
    title: 'Habit Tracker', 
    desc: 'Streaks, heatmaps, weekly charts, and habit history', 
    href: '/dev-space/habit-tracker.html',
    uses: [
      'Track daily habits',
      'View streak heatmaps',
      'Analyze weekly progress',
      'Build consistent routines'
    ]
  },
  { 
    icon: '🎲', 
    title: 'Random Picker', 
    desc: 'Names, numbers, dice, coin flips, yes/no, history', 
    href: '/dev-space/random-picker.html',
    uses: [
      'Pick random names',
      'Generate random numbers',
      'Roll dice and flip coins',
      'Make yes/no decisions'
    ]
  },
  { 
    icon: '⌨️', 
    title: 'Shortcut Reference', 
    desc: 'Searchable cheat sheets with pinned shortcuts', 
    href: '/dev-space/shortcut-reference.html',
    uses: [
      'Search keyboard shortcuts',
      'Pin frequently used ones',
      'Learn shortcuts by app',
      'Boost productivity'
    ]
  },
  { 
    icon: '📊', 
    title: 'System Info', 
    desc: 'Browser & system information', 
    action: 'system-stats',
    uses: [
      'View browser details',
      'Check system specs',
      'Monitor memory usage',
      'Debug compatibility issues'
    ]
  },
  { 
    icon: '⟁', 
    title: 'PrismBrowser Web', 
    desc: 'Quick access to Prism website', 
    href: 'https://github.com/Prismaibrowser/prism/blob/main/README.md',
    uses: [
      'Access Prism documentation',
      'View project on GitHub',
      'Learn about features',
      'Contribute to the project'
    ]
  },
  { 
    icon: '✍️', 
    title: 'Writing Assistant', 
    desc: 'AI writing improvement, translate, summarize & more', 
    action: 'writing-assistant',
    uses: [
      'Improve your writing',
      'Translate between languages',
      'Summarize long texts',
      'Fix grammar and style'
    ]
  },
  { 
    icon: '🌍', 
    title: 'Language Learning', 
    desc: 'AI tutor for 8+ languages with progress tracker', 
    action: 'language-learning',
    uses: [
      'Practice conversations',
      'Get grammar corrections',
      'Build vocabulary',
      'Track your progress'
    ]
  },
  { 
    icon: '🔍', 
    title: 'Code Explainer', 
    desc: 'Explain code for learners & junior devs', 
    action: 'code-explainer',
    uses: [
      'Understand code snippets',
      'Learn programming concepts',
      'Get line-by-line explanations',
      'Quiz yourself on code'
    ]
  },
  { 
    icon: '⇄', 
    title: 'Code Translator', 
    desc: 'Convert code between 12+ programming languages', 
    action: 'code-translator',
    uses: [
      'Convert between languages',
      'Learn language differences',
      'Port legacy code',
      'Understand idioms'
    ]
  },
  { 
    icon: '🧠', 
    title: 'Decision Analyzer', 
    desc: 'AI deep analysis with thinking mode for decisions', 
    action: 'decision-analyzer',
    uses: [
      'Analyze tough decisions',
      'Compare multiple options',
      'Get unbiased recommendations',
      'Export analysis reports'
    ]
  },
];

interface DevSpaceProps {
  onToolAction?: (action: string) => void;
}

export function DevSpace({ onToolAction }: DevSpaceProps) {
  const handleCardClick = (tool: Tool) => {
    if (tool.href) {
      window.open(tool.href, '_blank');
    } else if (tool.action && onToolAction) {
      onToolAction(tool.action);
    }
  };

  return (
    <div className="min-h-screen py-[60px] px-[40px] flex flex-col items-center justify-start relative z-[2]"
         style={{
           background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.6) 50%, rgba(0, 0, 0, 0.4) 100%)',
           marginTop: '-100vh',
           transform: 'translateY(100vh)'
         }}>
      <div className="mb-[30px] text-center animate-fadeInUp flex-shrink-0">
        <h2 className="font-sans text-[2.5rem] font-semibold text-white m-0 tracking-tight text-shadow-sm">
          Dev Space
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-[1400px] w-full mx-auto 
                      animate-fadeInUp flex-1 content-start">
        {tools.map((tool, index) => (
          <div 
            key={index} 
            onClick={() => handleCardClick(tool)} 
            className="cursor-pointer w-full flex justify-center"
          >
            <CardFlip
              icon={tool.icon}
              title={tool.title}
              subtitle={tool.desc}
              description={tool.desc}
              features={tool.uses || [
                'Feature 1',
                'Feature 2',
                'Feature 3',
                'Feature 4'
              ]}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
