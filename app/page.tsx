'use client';

import { useState, useEffect } from 'react';
import { MainContainer } from '@/components/MainContainer';
import { DevSpace } from '@/components/DevSpace';
import { TopLogo } from '@/components/TopLogo';
import { TopQuote } from '@/components/TopQuote';
import { QuickActions } from '@/components/QuickActions';
import { SystemInfo } from '@/components/SystemInfo';
import { SettingsModal } from '@/components/SettingsModal';
import { PanelManager, usePanelManager } from '@/components/PanelManager';
import { FloatingMusicPlayer } from '@/components/FloatingMusicPlayer';

export default function Home() {
  const [showSettings, setShowSettings] = useState(false);
  const [showMatrix, setShowMatrix] = useState(true);
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const { activePanel, openPanel, closePanel } = usePanelManager();

  useEffect(() => {
    // Check if matrix display should be shown
    const savedMatrixDisplay = localStorage.getItem('matrixDisplay') !== 'false';
    setShowMatrix(savedMatrixDisplay);
  }, []);

  const handleToolAction = (action: string) => {
    // Handle system stats specially
    if (action === 'system-stats') {
      const ramInfo = document.getElementById('ram-usage')?.textContent || 'N/A';
      const screenInfo = document.getElementById('screen-info')?.textContent || 'N/A';
      const stats = `
Browser: PRISM AI Browser
Platform: ${navigator.platform}
Language: ${navigator.language}
Cookies: ${navigator.cookieEnabled ? 'Enabled' : 'Disabled'}
Online: ${navigator.onLine ? 'Yes' : 'No'}
Screen: ${screenInfo}
RAM Usage: ${ramInfo}
Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}
      `.trim();
      
      navigator.clipboard.writeText(stats).then(() => {
        alert('System information copied to clipboard!');
      });
      return;
    }

    // Open panel for other actions
    openPanel(action as any);
  };

  return (
    <>
      <TopLogo />
      <TopQuote />
      <MainContainer />
      <DevSpace onToolAction={handleToolAction} />
      <SystemInfo />
      <QuickActions
        onSettingsClick={() => setShowSettings(true)}
        onNotepadClick={() => openPanel('notepad')}
        onMusicPlayerClick={() => setShowMusicPlayer(true)}
        showMatrix={showMatrix}
      />
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
      {showMusicPlayer && (
        <FloatingMusicPlayer onClose={() => setShowMusicPlayer(false)} />
      )}
      <PanelManager activePanel={activePanel} onClose={closePanel} />
    </>
  );
}
