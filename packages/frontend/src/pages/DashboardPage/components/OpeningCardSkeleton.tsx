import React from "react";
import { cn } from "../../../utils/cn";

const Shimmer: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("rounded bg-white/20 animate-pulse", className)} />
);

export const OpeningCardSkeleton: React.FC = () => (
  <div
    className="rounded-xl border border-border-default shadow-surface overflow-hidden"
    aria-label="Loading opening card"
    role="status"
    aria-busy="true"
  >
    <div className="relative w-full aspect-square">
      <div className="absolute inset-0 grid grid-cols-8 grid-rows-8">
        {Array.from({ length: 64 }).map((_, i) => {
          const isLight = (Math.floor(i / 8) + (i % 8)) % 2 === 0;
          return (
            <div
              key={i}
              className={isLight ? "bg-[#f0d9b5]/40" : "bg-[#b58863]/40"}
            />
          );
        })}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      <div className="absolute top-2 left-2 flex gap-1">
        <Shimmer className="h-4 w-11 rounded-full" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2.5 flex flex-col gap-1.5">
        <Shimmer className="h-3.5 w-3/4" />
        <Shimmer className="h-2.5 w-1/2" />
        <Shimmer className="h-2 w-full rounded-full mt-0.5" />
        <div className="flex gap-1.5 mt-1">
          <Shimmer className="h-6 flex-1 rounded-md" />
          <Shimmer className="h-6 w-8 rounded-md" />
        </div>
      </div>
    </div>
  </div>
);
