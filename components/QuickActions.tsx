'use client';

import { MatrixDisplay } from '@/components/MatrixDisplay';

interface QuickActionsProps {
  onSettingsClick?: () => void;
  onNotepadClick?: () => void;
  showMatrix?: boolean;
}

export function QuickActions({
  onSettingsClick,
  onNotepadClick,
  showMatrix = true,
}: QuickActionsProps) {
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const btnClass =
    'bg-black/70 border border-white/20 rounded-xl p-3 text-white ' +
    'cursor-pointer transition-all duration-300 text-[1.3rem] ' +
    'flex items-center justify-center w-12 h-12 ' +
    'hover:bg-white/15 hover:scale-110 hover:border-white/30';

  return (
    <>
      {/* ── Bottom-left: Notepad | MatrixDisplay | Music ── */}
      <div className="fixed bottom-[30px] left-[30px] flex gap-3 items-center z-[100]">
        <button onClick={onNotepadClick} className={btnClass} title="Notepad">
          📝
        </button>

        {showMatrix && <MatrixDisplay />}
      </div>

      {/* ── Bottom-right: Settings | Fullscreen ── */}
      <div className="fixed bottom-[30px] right-[30px] flex gap-3 items-center z-[100]">
        <button onClick={onSettingsClick} className={btnClass} title="Settings">
          ⚙️
        </button>

        <button onClick={toggleFullscreen} className={btnClass} title="Toggle Fullscreen">
          ⛶
        </button>
      </div>
    </>
  );
}
