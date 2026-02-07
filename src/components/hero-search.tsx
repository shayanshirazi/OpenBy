"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronDown, Search, Laptop, Monitor, Smartphone, Headphones, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";

const FLOATING_ICONS = [
  { Icon: Laptop, x: "15%", y: "25%", size: 28 },
  { Icon: Monitor, x: "85%", y: "25%", size: 28 },
  { Icon: Smartphone, x: "10%", y: "75%", size: 24 },
  { Icon: Headphones, x: "88%", y: "70%", size: 24 },
  { Icon: Sparkles, x: "50%", y: "15%", size: 20 },
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
        x: prev.x + (targetRef.current.x - prev.x) * 0.14,
        y: prev.y + (targetRef.current.y - prev.y) * 0.14,
      }));
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, []);

  const cursorX = (mouse.x - 0.5) * 40;
  const cursorY = (mouse.y - 0.5) * 40;

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6"
    >
      {/* Base mesh gradient background */}
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,#eff6ff_0%,#e0e7ff_25%,#e0f2fe_50%,#f0f9ff_75%,#eef2ff_100%)]" />

      {/* Animated mesh orbs */}
      <div
        className="absolute -z-10 h-[600px] w-[600px] rounded-full opacity-60 blur-[120px] transition-transform duration-700"
        style={{
          left: "10%",
          top: "15%",
          background:
            "radial-gradient(circle, rgba(59,130,246,0.55) 0%, rgba(99,102,241,0.3) 40%, transparent 70%)",
          transform: `translate(${cursorX * 0.5}px, ${cursorY * 0.5}px)`,
        }}
      />
      <div
        className="absolute -z-10 h-[500px] w-[500px] rounded-full opacity-50 blur-[100px] transition-transform duration-700"
        style={{
          right: "5%",
          bottom: "20%",
          background:
            "radial-gradient(circle, rgba(168,85,247,0.5) 0%, rgba(59,130,246,0.25) 50%, transparent 70%)",
          transform: `translate(${-cursorX * 0.3}px, ${-cursorY * 0.3}px)`,
        }}
      />
      <div
        className="absolute -z-10 h-[400px] w-[400px] rounded-full opacity-45 blur-[80px] transition-transform duration-700"
        style={{
          left: "50%",
          bottom: "10%",
          background:
            "radial-gradient(circle, rgba(34,211,238,0.45) 0%, rgba(59,130,246,0.2) 50%, transparent 70%)",
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

      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Cursor spotlight glow */}
      <div
        className="pointer-events-none absolute -z-10 h-[500px] w-[500px] rounded-full blur-3xl transition-opacity duration-300"
        style={{
          left: `${mouse.x * 100}%`,
          top: `${mouse.y * 100}%`,
          transform: "translate(-50%, -50%)",
          opacity: isHovering ? 1 : 0,
          background:
            "radial-gradient(circle, rgba(59,130,246,0.4) 0%, rgba(99,102,241,0.22) 35%, rgba(168,85,247,0.08) 55%, transparent 70%)",
        }}
      />

      {/* Floating cursor-reactive icons */}
      {FLOATING_ICONS.map(({ Icon, x, y, size }, i) => {
        const intensity = 38 + (i % 4) * 12;
        const dx = (mouse.x - 0.5) * intensity * (i % 2 === 0 ? 1 : -1);
        const dy = (mouse.y - 0.5) * intensity * (i % 2 === 0 ? -1 : 1);
        return (
          <div
            key={i}
            className="absolute -z-10 rounded-2xl bg-white/60 p-3 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-white/80 hover:shadow-xl"
            style={{
              left: x,
              top: y,
              transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`,
            }}
          >
            <Icon
              className="text-zinc-600/80 transition-colors hover:text-blue-600"
              style={{ width: size, height: size }}
            />
          </div>
        );
      })}

      {/* Content */}
      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-600 bg-clip-text pt-1 pb-1 text-5xl font-bold tracking-tight text-transparent drop-shadow-sm sm:text-7xl">
            OpenBy
          </h1>
          <p className="text-lg text-zinc-600 sm:text-xl">
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
        <ChevronDown className="h-6 w-6 animate-bounce" />
      </a>
    </section>
  );
}
