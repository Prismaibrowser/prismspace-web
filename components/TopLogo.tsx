'use client';

import Image from 'next/image';

export function TopLogo() {
  return (
    <div className="fixed top-[30px] left-[40px] flex items-center gap-[15px] z-[100] animate-fadeInDown">
      <Image
        src="/images/prism-logo.svg"
        alt="Prism Logo"
        width={40}
        height={40}
        className="transition-transform duration-300 hover:scale-110 hover:rotate-[5deg]"
      />
      <div className="flex flex-col leading-none">
        <span className="font-sans text-[28px] font-semibold text-white tracking-tight">
          PRISM
        </span>
        <span className="font-sans text-[12px] font-normal text-white/70 tracking-wider uppercase">
          AI BROWSER
        </span>
      </div>
    </div>
  );
}
