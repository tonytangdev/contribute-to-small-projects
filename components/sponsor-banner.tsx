"use client";

import Image from "next/image";
import { Sponsor } from "@/types/sponsor";

interface SponsorBannerProps {
  sponsors: Sponsor[];
  position: "top" | "bottom";
  onOpenModal: () => void;
}

export default function SponsorBanner({
  sponsors,
  position,
  onOpenModal,
}: SponsorBannerProps) {
  // First set: placeholder + sponsors, Second set: placeholder + sponsors (for seamless loop)
  const firstSet = [null, ...sponsors];
  const secondSet = [null, ...sponsors];

  // Dynamic duration: 5s per item
  const duration = (sponsors.length + 1) * 5;

  return (
    <div
      className={`
        xl:hidden overflow-hidden py-3
        ${position === "top" ? "sticky top-0 z-40 bg-white/80 backdrop-blur-sm shadow-sm" : "sticky bottom-0 z-40 bg-white/80 backdrop-blur-sm shadow-sm"}
      `}
      aria-label={`${position} sponsor banner`}
    >
      <div
        className="flex animate-marquee"
        style={{ animationDuration: `${duration}s` }}
      >
        {/* First set */}
        <div className="flex gap-4 px-4 flex-shrink-0">
          {firstSet.map((sponsor, i) =>
            sponsor ? (
              <a
                key={`first-${sponsor.id}-${i}`}
                href={sponsor.targetUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="flex items-center gap-2.5 px-5 py-2.5 flex-shrink-0 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition-colors"
              >
                <div className="w-5 h-5 relative flex-shrink-0">
                  <Image
                    src={sponsor.logoUrl}
                    alt={`${sponsor.name} logo`}
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-sm font-medium text-slate-800 whitespace-nowrap">
                  {sponsor.name}
                </span>
              </a>
            ) : (
              <button
                key={`first-placeholder-${i}`}
                onClick={onOpenModal}
                className="flex items-center gap-2.5 px-5 py-2.5 flex-shrink-0 bg-indigo-100 hover:bg-indigo-200 rounded-xl border border-indigo-300 transition-colors"
              >
                <span className="text-indigo-600 text-lg">+</span>
                <span className="text-sm font-medium text-indigo-700 whitespace-nowrap">
                  Your Ad Here
                </span>
              </button>
            ),
          )}
        </div>
        {/* Second set (duplicate for seamless loop) */}
        <div className="flex gap-4 px-4 flex-shrink-0">
          {secondSet.map((sponsor, i) =>
            sponsor ? (
              <a
                key={`second-${sponsor.id}-${i}`}
                href={sponsor.targetUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="flex items-center gap-2.5 px-5 py-2.5 flex-shrink-0 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition-colors"
              >
                <div className="w-5 h-5 relative flex-shrink-0">
                  <Image
                    src={sponsor.logoUrl}
                    alt={`${sponsor.name} logo`}
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-sm font-medium text-slate-800 whitespace-nowrap">
                  {sponsor.name}
                </span>
              </a>
            ) : (
              <button
                key={`second-placeholder-${i}`}
                onClick={onOpenModal}
                className="flex items-center gap-2.5 px-5 py-2.5 flex-shrink-0 bg-indigo-100 hover:bg-indigo-200 rounded-xl border border-indigo-300 transition-colors"
              >
                <span className="text-indigo-600 text-lg">+</span>
                <span className="text-sm font-medium text-indigo-700 whitespace-nowrap">
                  Your Ad Here
                </span>
              </button>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
