"use client";

/**
 * @author: @dorianbaffier
 * @description: Card Flip
 * @version: 1.0.0
 * @date: 2025-06-26
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { ArrowRight, Repeat2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface CardFlipProps {
  title?: string;
  subtitle?: string;
  description?: string;
  features?: string[];
  icon?: string;
}

export default function CardFlip({
  title = "Design Systems",
  subtitle = "Explore the fundamentals",
  description = "Dive deep into the world of modern UI/UX design.",
  features = ["UI/UX", "Modern Design", "Tailwind CSS", "Kokonut UI"],
  icon,
}: CardFlipProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="group relative h-[320px] w-full [perspective:2000px]"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div
        className={cn(
          "relative h-full w-full",
          "[transform-style:preserve-3d]",
          "transition-all duration-700",
          isFlipped
            ? "[transform:rotateY(180deg)]"
            : "[transform:rotateY(0deg)]"
        )}
      >
        {/* Front of card */}
        <div
          className={cn(
            "absolute inset-0 h-full w-full",
            "[backface-visibility:hidden] [transform:rotateY(0deg)]",
            "overflow-hidden rounded-2xl",
            "bg-black/40 backdrop-blur-md",
            "border border-white/20",
            "shadow-lg",
            "transition-all duration-700",
            "group-hover:shadow-xl group-hover:bg-black/50 group-hover:border-white/30",
            isFlipped ? "opacity-0" : "opacity-100"
          )}
        >
          <div className="relative h-full overflow-hidden bg-gradient-to-b from-black/20 to-black/40">
            <div className="absolute inset-0 flex items-start justify-center pt-20">
              {icon ? (
                <div className="text-7xl drop-shadow-lg">{icon}</div>
              ) : (
                <div className="relative flex h-[100px] w-[200px] items-center justify-center">
                  {[...Array(10)].map((_, i) => (
                    <div
                      className={cn(
                        "absolute h-[50px] w-[50px]",
                        "rounded-[140px]",
                        "animate-[scale_3s_linear_infinite]",
                        "opacity-0",
                        "shadow-[0_0_50px_rgba(255,165,0,0.5)]",
                        "group-hover:animate-[scale_2s_linear_infinite]"
                      )}
                      key={i}
                      style={{
                        animationDelay: `${i * 0.3}s`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="absolute right-0 bottom-0 left-0 p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1.5">
                <h3 className="font-semibold text-lg text-white leading-snug tracking-tighter transition-all duration-500 ease-out-expo group-hover:translate-y-[-4px]">
                  {title}
                </h3>
                <p className="line-clamp-2 text-sm text-white/80 tracking-tight transition-all delay-[50ms] duration-500 ease-out-expo group-hover:translate-y-[-4px]">
                  {subtitle}
                </p>
              </div>
              <div className="group/icon relative">
                <div
                  className={cn(
                    "absolute inset-[-8px] rounded-lg transition-opacity duration-300",
                    "bg-gradient-to-br from-orange-500/20 via-orange-500/10 to-transparent"
                  )}
                />
                <Repeat2 className="relative z-10 h-4 w-4 text-orange-500 transition-transform duration-300 group-hover/icon:-rotate-12 group-hover/icon:scale-110" />
              </div>
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div
          className={cn(
            "absolute inset-0 h-full w-full",
            "[backface-visibility:hidden] [transform:rotateY(180deg)]",
            "rounded-2xl p-6",
            "bg-black/40 backdrop-blur-md",
            "border border-white/20",
            "shadow-lg",
            "flex flex-col",
            "transition-all duration-700",
            "group-hover:shadow-xl group-hover:bg-black/50",
            isFlipped ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg text-white leading-snug tracking-tight transition-all duration-500 ease-out-expo group-hover:translate-y-[-2px]">
                {title}
              </h3>
              <p className="line-clamp-2 text-sm text-white/70 tracking-tight transition-all duration-500 ease-out-expo group-hover:translate-y-[-2px]">
                {description}
              </p>
            </div>

            <div className="space-y-2">
              {features.map((feature, index) => (
                <div
                  className="flex items-center gap-2 text-sm text-white/90 transition-all duration-500"
                  key={feature}
                  style={{
                    transform: isFlipped
                      ? "translateX(0)"
                      : "translateX(-10px)",
                    opacity: isFlipped ? 1 : 0,
                    transitionDelay: `${index * 100 + 200}ms`,
                  }}
                >
                  <ArrowRight className="h-3 w-3 text-orange-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
                @keyframes scale {
                    0% {
                        transform: scale(2);
                        opacity: 0;
                        box-shadow: 0px 0px 50px rgba(255, 165, 0, 0.5);
                    }
                    50% {
                        transform: translate(0px, -5px) scale(1);
                        opacity: 1;
                        box-shadow: 0px 8px 20px rgba(255, 165, 0, 0.5);
                    }
                    100% {
                        transform: translate(0px, 5px) scale(0.1);
                        opacity: 0;
                        box-shadow: 0px 10px 20px rgba(255, 165, 0, 0);
                    }
                }
            `}</style>
    </div>
  );
}
