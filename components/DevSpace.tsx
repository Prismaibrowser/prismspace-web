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
    icon: '🧾',
    title: 'Web Scraper',
    desc: 'Paste a link and export clean JSON or CSV',
    action: 'web-scraper',
    uses: [
      'Scrape a single page',
      'Crawl linked doc pages',
      'Preview cleaned content',
      'Download JSON or CSV'
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
