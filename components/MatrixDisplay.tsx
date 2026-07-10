'use client';

import { useEffect, useState } from 'react';

// MatrixDisplay rendered as an inline element (no fixed positioning).
// QuickActions is responsible for placing it in the bottom bar.
export function MatrixDisplay() {
  const [pattern, setPattern] = useState<number[][]>([]);

  useEffect(() => {
    const generatePattern = () => {
      const rows = 5;
      const cols = 5;
      const newPattern: number[][] = [];
      for (let i = 0; i < rows; i++) {
        const row: number[] = [];
        for (let j = 0; j < cols; j++) {
          row.push(Math.random() > 0.5 ? 1 : 0);
        }
        newPattern.push(row);
      }
      setPattern(newPattern);
    };

    generatePattern();
    const interval = setInterval(generatePattern, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      onClick={() => console.log('Matrix display clicked')}
      className="bg-black/30 backdrop-blur-md border border-[#00ff88]/30 rounded-xl p-1.5
                 cursor-pointer transition-all duration-300 flex items-center justify-center
                 w-12 h-12 shadow-[0_4px_15px_rgba(0,0,0,0.2)]
                 hover:bg-[#00ff88]/15 hover:scale-105
                 hover:border-[#00ff88]/50 hover:shadow-[0_0_20px_rgba(0,255,136,0.3)]"
      title="Matrix Display"
    >
      <div className="text-[#00ff88] flex flex-col gap-0.5">
        {pattern.map((row, i) => (
          <div key={i} className="flex gap-0.5">
            {row.map((cell, j) => (
              <div
                key={j}
                className={`w-1 h-1 rounded-sm transition-opacity duration-200 ${cell ? 'opacity-100 shadow-[0_0_3px_currentColor]' : 'opacity-20'
                  }`}
                style={{ backgroundColor: '#00ff88' }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
