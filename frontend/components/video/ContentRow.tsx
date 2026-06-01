"use client";

import { useRef, useState } from "react";
import type { Anime } from "@/lib/types";
import { VideoCard } from "./VideoCard";

export function ContentRow({ title, anime }: { title: string; anime: Anime[] }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const scroll = (dir: "left" | "right") => {
    const el = rowRef.current;
    if (!el) return;
    const cardW = el.children[0]?.clientWidth ?? 180;
    const gap = 16;
    const amount = (cardW + gap) * Math.min(4, anime.length);
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  const onScroll = () => {
    const el = rowRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 20);
    setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 20);
  };

  if (!anime.length) return null;

  const btn =
    "absolute top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/70 p-2 text-white transition-opacity hover:bg-black";

  return (
    <section className="group/section relative py-6">
      <h2 className="mb-4 px-4 text-lg font-bold text-white sm:px-6 lg:px-8">{title}</h2>
      <div className="relative">
        <button
          onClick={() => scroll("left")}
          className={`${btn} -left-1 ${showLeft ? "opacity-100" : "opacity-0"} sm:opacity-0 sm:group-hover/section:opacity-100`}
          aria-label="Scroll left"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button
          onClick={() => scroll("right")}
          className={`${btn} -right-1 ${showRight ? "opacity-100" : "opacity-0"} sm:opacity-0 sm:group-hover/section:opacity-100`}
          aria-label="Scroll right"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
        <div
          ref={rowRef}
          onScroll={onScroll}
          className="scrollbar-hide flex gap-3 overflow-x-auto px-4 pb-2 sm:gap-4 sm:px-6 lg:px-8"
        >
          {anime.map((a, i) => (
            <VideoCard key={`${a.id}:${a.slug}:${i}`} anime={a} priority={i < 3} />
          ))}
        </div>
      </div>
    </section>
  );
}
