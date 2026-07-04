'use client';

import { useState, useEffect } from 'react';
import { NotepadPanel } from './tools/NotepadPanel';
import { JsonToolkit } from './tools/JsonToolkit';
import { ColorGenerator } from './tools/ColorGenerator';

type PanelType = 'notepad' | 'json-toolkit' | 'crypto-utils' | 'regex-workbench' | 
  'markdown-editor' | 'git-reference' | 'time-date' | 'color-gen' | 'prompt-synthesizer' |
  'writing-assistant' | 'language-learning' | 'code-explainer' | 'code-translator' | 'decision-analyzer';

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
  'json-toolkit': {
    type: 'json-toolkit',
    title: 'JSON Toolkit',
    position: 'left',
    width: '550px',
    component: JsonToolkit,
  },
  'crypto-utils': {
    type: 'crypto-utils',
    title: 'Crypto Utils',
    position: 'left',
    width: '550px',
    iframeSrc: '/dev-space/crypto-utils.html',
  },
  'regex-workbench': {
    type: 'regex-workbench',
    title: 'Regex Workbench',
    position: 'right',
    width: '600px',
    iframeSrc: '/dev-space/regex-workbench.html',
  },
  'markdown-editor': {
    type: 'markdown-editor',
    title: 'Markdown Editor',
    position: 'right',
    width: '700px',
    iframeSrc: '/dev-space/markdown-editor.html',
  },
  'git-reference': {
    type: 'git-reference',
    title: 'Git Reference',
    position: 'right',
    width: '650px',
    iframeSrc: '/dev-space/git-reference.html',
  },
  'time-date': {
    type: 'time-date',
    title: 'Time & Date',
    position: 'right',
    width: '550px',
    iframeSrc: '/dev-space/time-date.html',
  },
  'color-gen': {
    type: 'color-gen',
    title: 'Color Generator',
    position: 'right',
    width: '600px',
    component: ColorGenerator,
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
  'language-learning': {
    type: 'language-learning',
    title: 'Language Learning',
    position: 'right',
    width: '90%',
    iframeSrc: '/dev-space/language-learning.html',
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
