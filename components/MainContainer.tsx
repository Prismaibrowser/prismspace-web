'use client';

import { useEffect, useState } from 'react';
import { Clock } from './Clock';

interface DailyQuotes {
  primary: string;
  secondary: string;
}

const fallbackQuotes: Record<string, DailyQuotes> = {
  sunday: { primary: "Rest and recharge, PRISM", secondary: "User, Serene Sunday!" },
  monday: { primary: "Start your week strong, PRISM", secondary: "User, Happy Monday!" },
  tuesday: { primary: "Build momentum today, PRISM", secondary: "User, Terrific Tuesday!" },
  wednesday: { primary: "You're halfway there, PRISM", secondary: "User, Wonderful Wednesday!" },
  thursday: { primary: "Push through with power, PRISM", secondary: "User, Thriving Thursday!" },
  friday: { primary: "Celebrate your success, PRISM", secondary: "User, Happy Friday!" },
  saturday: { primary: "Enjoy your achievements, PRISM", secondary: "User, Spectacular Saturday!" }
};

export function MainContainer() {
  const [quotes, setQuotes] = useState<DailyQuotes>(fallbackQuotes.friday);
  const [showGreetings, setShowGreetings] = useState(true);

  useEffect(() => {
    // Check if greetings should be shown
    const savedShowGreetings = localStorage.getItem('showGreetings') !== 'false';
    setShowGreetings(savedShowGreetings);
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date().getDay();
    const currentDay = days[today];
    
    fetch('/quotes.json')
      .then(res => res.json())
      .then(data => {
        setQuotes(data[currentDay] || fallbackQuotes[currentDay]);
      })
      .catch(() => {
        setQuotes(fallbackQuotes[currentDay]);
      });
  }, []);

  return (
    <div className="h-screen flex flex-col items-center justify-center text-center sticky top-0 z-[1]"
         style={{
           backdropFilter: 'blur(2px)',
           background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.3) 50%, rgba(0, 0, 0, 0.1) 100%)'
         }}>
      <div className="flex flex-col items-center gap-[30px] animate-fadeInUp">
        {showGreetings && (
          <div className="text-center mb-5">
            <h1 className="font-sans text-[2.2rem] font-medium text-white mb-2.5 tracking-tight leading-tight">
              {quotes.primary}
            </h1>
            <h2 className="font-sans text-[2.2rem] font-medium text-white tracking-tight leading-tight">
              {quotes.secondary}
            </h2>
          </div>
        )}

        <Clock />
      </div>

      <div className="absolute bottom-[40px] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 animate-bounce">
        <div className="font-sans text-sm font-normal text-white/70 tracking-wider uppercase">
          Scroll for Dev Space
        </div>
        <div className="text-2xl text-white/70">↓</div>
      </div>
    </div>
  );
}
