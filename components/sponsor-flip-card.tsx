"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Sponsor } from "@/types/sponsor";

interface SponsorFlipCardProps {
  sponsor: Sponsor;
}

export default function SponsorFlipCard({ sponsor }: SponsorFlipCardProps) {
  const [isFlipping, setIsFlipping] = useState(false);
  const [displayedSponsor, setDisplayedSponsor] = useState(sponsor);
  const prevSponsorRef = useRef(sponsor.id);

  useEffect(() => {
    if (sponsor.id !== prevSponsorRef.current) {
      setIsFlipping(true);

      // Halfway through flip, change the sponsor
      const halfwayTimeout = setTimeout(() => {
        setDisplayedSponsor(sponsor);
      }, 300);

      // End flip animation
      const endTimeout = setTimeout(() => {
        setIsFlipping(false);
        prevSponsorRef.current = sponsor.id;
      }, 600);

      return () => {
        clearTimeout(halfwayTimeout);
        clearTimeout(endTimeout);
      };
    }
  }, [sponsor]);

  return (
    <div className="perspective-1000">
      <a
        href={displayedSponsor.targetUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`
          block bg-white/70 backdrop-blur-sm border border-slate-200/60
          rounded-xl p-3 hover:bg-white hover:shadow-lg
          hover:-translate-y-0.5 transition-all duration-300 text-center
          ${isFlipping ? "animate-flip" : ""}
        `}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="w-12 h-12 mx-auto relative">
          <Image
            src={displayedSponsor.logoUrl}
            alt={`${displayedSponsor.name} logo`}
            fill
            className="object-contain"
          />
        </div>
        <div className="mt-2">
          <h3 className="font-bold text-slate-800 text-xs">
            {displayedSponsor.name}
          </h3>
          {displayedSponsor.description && (
            <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
              {displayedSponsor.description}
            </p>
          )}
        </div>
        <span className="text-[10px] text-slate-400 uppercase tracking-wide block mt-1.5">
          Sponsor
        </span>
      </a>
    </div>
  );
}
