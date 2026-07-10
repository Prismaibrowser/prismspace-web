'use client';

import { useState, useEffect } from 'react';
import { NotepadPanel } from './tools/NotepadPanel';
import { ColorGenerator } from './tools/ColorGenerator';
import { WebScraperTool } from './tools/WebScraperTool';
import { PomodoroTimer } from './tools/PomodoroTimer';
import { AgentSwarm } from './AgentSwarm';

type PanelType = 'notepad' | 
  'git-reference' | 'color-gen' | 'qr-generator' | 'prompt-synthesizer' |
  'writing-assistant' | 'code-explainer' | 'code-translator' | 'decision-analyzer' |
  'web-scraper' | 'pomodoro-timer' | 'agent-swarm';

interface PanelConfig {
  type: PanelType;
  title: string;
  position: 'left' | 'right' | 'full';
  width?: string;
  component?: React.ComponentType<{ onClose: () => void }>;
  iframeSrc?: string;
}

const panelConfigs: Record<PanelType, PanelConfig> = {
  'notepad': {
    type: 'notepad',
    title: 'Notepad',
    position: 'left',
    width: '500px',
    component: NotepadPanel,
  },

  'git-reference': {
    type: 'git-reference',
    title: 'Git Reference',
    position: 'right',
    width: '650px',
    iframeSrc: '/dev-space/git-reference',
  },

  'color-gen': {
    type: 'color-gen',
    title: 'Color Generator',
    position: 'right',
    width: '600px',
    component: ColorGenerator,
  },
  'qr-generator': {
    type: 'qr-generator',
    title: 'QR Code Generator',
    position: 'right',
    width: '85%',
    iframeSrc: '/dev-space/qr-generator',
  },
  'web-scraper': {
    type: 'web-scraper',
    title: 'Web Scraper',
    position: 'right',
    width: '82%',
    component: WebScraperTool,
  },
  'pomodoro-timer': {
    type: 'pomodoro-timer',
    title: 'Pomodoro Timer',
    position: 'right',
    width: '82%',
    component: PomodoroTimer,
  },
  'prompt-synthesizer': {
    type: 'prompt-synthesizer',
    title: 'Prompt Synthesizer',
    position: 'right',
    width: '80%',
    iframeSrc: '/dev-space/prompt-synthesizer.html',
  },
  'writing-assistant': {
    type: 'writing-assistant',
    title: 'Writing Assistant',
    position: 'right',
    width: '90%',
    iframeSrc: '/dev-space/writing-assistant.html',
  },

  'code-explainer': {
    type: 'code-explainer',
    title: 'Code Explainer',
    position: 'right',
    width: '90%',
    iframeSrc: '/dev-space/code-explainer.html',
  },
  'code-translator': {
    type: 'code-translator',
    title: 'Code Translator',
    position: 'right',
    width: '90%',
    iframeSrc: '/dev-space/code-translator.html',
  },
  'decision-analyzer': {
    type: 'decision-analyzer',
    title: 'Decision Analyzer',
    position: 'right',
    width: '90%',
    iframeSrc: '/dev-space/decision-analyzer.html',
  },
  'agent-swarm': {
    type: 'agent-swarm',
    title: 'Agent Swarm',
    position: 'full',
    width: '92%',
    component: AgentSwarm,
  },
};

interface PanelManagerProps {
  activePanel: PanelType | null;
  onClose: () => void;
}

export function PanelManager({ activePanel, onClose }: PanelManagerProps) {
  if (!activePanel) return null;

  const config = panelConfigs[activePanel];
  const Component = config.component;

  const positionClasses = {
    left: 'left-0',
    right: 'right-0',
    full: 'inset-0',
  };

  const animationClasses = {
    left: activePanel ? 'translate-x-0' : '-translate-x-full',
    right: activePanel ? 'translate-x-0' : 'translate-x-full',
    full: activePanel ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 h-screen bg-[#0a0a0a] border-white/15 z-[1001] 
                    shadow-[4px_0_30px_rgba(0,0,0,0.8)] transition-all duration-300
                    ${positionClasses[config.position]}
                    ${animationClasses[config.position]}
                    ${config.position === 'left' ? 'border-r' : ''}
                    ${config.position === 'right' ? 'border-l' : ''}
                    ${config.position === 'full' ? 'border' : ''}`}
        style={{ 
          width: config.position === 'full' ? '100%' : config.width,
          maxWidth: config.position === 'full' ? '90vw' : undefined,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {Component ? (
          <Component onClose={onClose} />
        ) : config.iframeSrc ? (
          <iframe
            src={config.iframeSrc}
            className="w-full h-full border-0 block"
            title={config.title}
          />
        ) : (
          <div className="p-8 text-white">
            <h2 className="text-2xl font-semibold mb-4">{config.title}</h2>
            <p className="text-white/60">Loading...</p>
          </div>
        )}
      </div>
    </>
  );
}

// Hook to manage panel state
export function usePanelManager() {
  const [activePanel, setActivePanel] = useState<PanelType | null>(null);

  const openPanel = (panel: PanelType) => {
    setActivePanel(panel);
  };

  const closePanel = () => {
    setActivePanel(null);
  };

  return { activePanel, openPanel, closePanel };
}
