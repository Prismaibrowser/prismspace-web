'use client';

import { useEffect, useState } from 'react';

const quotes = [
  { quote: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { quote: "Your most unhappy customers are your greatest source of learning.", author: "Bill Gates" },
  { quote: "The people who are crazy enough to think they can change the world are the ones who do.", author: "Steve Jobs" },
  { quote: "If something is important enough, even if the odds are against you, you should still do it.", author: "Elon Musk" },
  { quote: "Move fast and break things. Unless you are breaking stuff, you are not moving fast enough.", author: "Mark Zuckerberg" },
  { quote: "The best way to predict the future is to invent it.", author: "Alan Kay" },
  { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { quote: "Stay hungry, stay foolish.", author: "Steve Jobs" },
];

export function TopQuote() {
  const [quote, setQuote] = useState(quotes[0]);
  const [showDynamic, setShowDynamic] = useState(true);

  useEffect(() => {
    // Check if dynamic greetings should be shown
    const savedDynamicGreetings = localStorage.getItem('dynamicGreetings') !== 'false';
    setShowDynamic(savedDynamicGreetings);

    if (savedDynamicGreetings) {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      setQuote(quotes[randomIndex]);
    }
  }, []);

  if (!showDynamic) {
    return null;
  }

  return (
    <div className="fixed top-[40px] right-[40px] max-w-[400px] text-right z-[100] animate-fadeInDown">
      <p className="font-sans text-base font-normal italic text-white/80 leading-relaxed">
        &quot;{quote.quote}&quot; - {quote.author}
      </p>
    </div>
  );
}
