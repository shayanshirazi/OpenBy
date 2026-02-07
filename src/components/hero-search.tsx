"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronDown, Search, Laptop, Monitor, Smartphone, Headphones, Sparkles, Tablet } from "lucide-react";
import { Input } from "@/components/ui/input";

const FLOATING_ICONS = [
  { Icon: Laptop, x: "12%", y: "22%", size: 26 },
  { Icon: Monitor, x: "88%", y: "22%", size: 26 },
  { Icon: Smartphone, x: "8%", y: "78%", size: 22 },
  { Icon: Headphones, x: "90%", y: "72%", size: 22 },
  { Icon: Tablet, x: "25%", y: "75%", size: 22 },
  { Icon: Sparkles, x: "75%", y: "15%", size: 20 },
];

export function HeroSearch() {
  const sectionRef = useRef<HTMLElement>(null);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const [isHovering, setIsHovering] = useState(false);
  const rafRef = useRef<number>();
  const targetRef = useRef({ x: 0.5, y: 0.5 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      targetRef.current = { x, y };
      setIsHovering(true);
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    targetRef.current = { x: 0.5, y: 0.5 };
    setIsHovering(false);
  }, []);

  useEffect(() => {
    const animate = () => {
      setMouse((prev) => ({
        x: prev.x + (targetRef.current.x - prev.x) * 0.12,
        y: prev.y + (targetRef.current.y - prev.y) * 0.12,
      }));
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, []);

  const cursorX = (mouse.x - 0.5) * 36;
  const cursorY = (mouse.y - 0.5) * 36;

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6"
    >
      {/* Base mesh gradient background */}
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,#eff6ff_0%,#e0e7ff_25%,#e0f2fe_50%,#f0f9ff_75%,#eef2ff_100%)]" />

      {/* Cursor-reactive gradient orbs - no blur for perf */}
      <div
        className="absolute -z-10 h-[450px] w-[450px] rounded-full opacity-50 transition-transform duration-150"
        style={{
          left: "10%",
          top: "15%",
          background:
            "radial-gradient(circle, rgba(59,130,246,0.45) 0%, rgba(99,102,241,0.2) 50%, transparent 70%)",
          transform: `translate(${cursorX * 0.4}px, ${cursorY * 0.4}px)`,
        }}
      />
      <div
        className="absolute -z-10 h-[350px] w-[350px] rounded-full opacity-40 transition-transform duration-150"
        style={{
          right: "5%",
          bottom: "22%",
          background:
            "radial-gradient(circle, rgba(168,85,247,0.4) 0%, rgba(59,130,246,0.15) 50%, transparent 70%)",
          transform: `translate(${-cursorX * 0.3}px, ${-cursorY * 0.3}px)`,
        }}
      />
      <div
        className="absolute -z-10 h-[280px] w-[280px] rounded-full opacity-35 transition-transform duration-150"
        style={{
          left: "50%",
          bottom: "12%",
          background:
            "radial-gradient(circle, rgba(34,211,238,0.4) 0%, rgba(59,130,246,0.15) 50%, transparent 70%)",
          transform: `translate(calc(-50% + ${cursorX * 0.2}px), ${cursorY * 0.2}px)`,
        }}
      />

      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.5]"
        style={{
          backgroundImage: `radial-gradient(circle at center, rgba(100,116,139,0.2) 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Cursor spotlight glow */}
      <div
        className="pointer-events-none absolute -z-10 h-[420px] w-[420px] rounded-full blur-2xl transition-opacity duration-300"
        style={{
          left: `${mouse.x * 100}%`,
          top: `${mouse.y * 100}%`,
          transform: "translate(-50%, -50%)",
          opacity: isHovering ? 0.9 : 0,
          background:
            "radial-gradient(circle, rgba(59,130,246,0.35) 0%, rgba(99,102,241,0.18) 40%, transparent 70%)",
        }}
      />

      {/* Static icons - fixed positions, no mouse movement */}
      {FLOATING_ICONS.map(({ Icon, x, y, size }, i) => (
        <div
          key={i}
          className="absolute -z-10 rounded-2xl bg-white/80 p-3 shadow-lg transition-transform duration-200 hover:scale-105 hover:shadow-xl"
          style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}
        >
          <Icon
            className="text-zinc-600/80 transition-colors hover:text-blue-600"
            style={{ width: size, height: size }}
          />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-10 pb-16">
        <div className="flex flex-col items-center gap-3 text-center pb-8">
          <h1 className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-600 bg-clip-text pt-1 pb-2.5 text-5xl font-bold tracking-tight text-transparent drop-shadow-sm sm:text-7xl">
            OpenBy
          </h1>
          <p className="-mt-1 text-lg text-zinc-600 sm:text-xl">
            AI-Powered Price Tracking
          </p>
        </div>

        <form
          action="/search"
          method="get"
          className="group relative w-full max-w-xl"
        >
          <div className="absolute inset-y-0 left-0 z-10 flex items-center pl-5 pointer-events-none">
            <Search className="h-6 w-6 text-zinc-500 transition-all duration-300 group-focus-within:scale-110 group-focus-within:text-blue-600" />
          </div>
          <Input
            name="q"
            type="search"
            placeholder="Search laptops, monitors, phones & more..."
            className="h-16 rounded-2xl border-2 border-zinc-200/90 bg-white/90 py-4 pl-14 pr-5 text-base shadow-xl shadow-zinc-300/30 backdrop-blur-sm transition-all duration-300 placeholder:text-zinc-400 hover:border-zinc-300 hover:shadow-2xl hover:shadow-blue-500/5 focus-visible:border-blue-400 focus-visible:ring-4 focus-visible:ring-blue-500/15 focus-visible:shadow-2xl focus-visible:shadow-blue-500/10"
            autoComplete="off"
          />
        </form>
      </div>

      <a
        href="#categories"
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/70 p-2.5 text-zinc-500 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white hover:text-zinc-800 hover:shadow-xl"
        aria-label="Scroll down"
      >
        <ChevronDown className="h-6 w-6 animate-scroll-down" />
      </a>
    </section>
  );
}
