"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface RangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  formatValue?: (v: number) => string;
  className?: string;
}

export function RangeSlider({
  min,
  max,
  value: [minVal, maxVal],
  onChange,
  step = 1,
  formatValue = (v) => String(Math.round(v)),
  className = "",
}: RangeSliderProps) {
  const [localMin, setLocalMin] = useState(minVal);
  const [localMax, setLocalMax] = useState(maxVal);
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<"min" | "max" | null>(null);

  useEffect(() => {
    setLocalMin(minVal);
    setLocalMax(maxVal);
  }, [minVal, maxVal]);

  const percentMin = ((localMin - min) / (max - min)) * 100;
  const percentMax = ((localMax - min) / (max - min)) * 100;

  const valueFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return min;
      const rect = track.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const raw = min + x * (max - min);
      const stepped = Math.round(raw / step) * step;
      return Math.max(min, Math.min(max, stepped));
    },
    [min, max, step]
  );

  const handlePointerDown = useCallback(
    (thumb: "min" | "max") => (e: React.PointerEvent) => {
      e.preventDefault();
      draggingRef.current = thumb;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      const v = valueFromClientX(e.clientX);
      if (thumb === "min") {
        const newMin = Math.min(v, localMax - step);
        setLocalMin(newMin);
        onChange([newMin, localMax]);
      } else {
        const newMax = Math.max(v, localMin + step);
        setLocalMax(newMax);
        onChange([localMin, newMax]);
      }
    },
    [localMin, localMax, step, valueFromClientX, onChange]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (draggingRef.current === null) return;
      const v = valueFromClientX(e.clientX);
      if (draggingRef.current === "min") {
        const newMin = Math.min(v, localMax - step);
        setLocalMin(newMin);
        onChange([newMin, localMax]);
      } else {
        const newMax = Math.max(v, localMin + step);
        setLocalMax(newMax);
        onChange([localMin, newMax]);
      }
    },
    [localMin, localMax, step, valueFromClientX, onChange]
  );

  const handlePointerUp = useCallback(() => {
    draggingRef.current = null;
  }, []);

  return (
    <div className={`space-y-3 ${className}`}>
      <div ref={trackRef} className="relative pt-2 pb-1 select-none touch-none">
        {/* Track background */}
        <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-zinc-100" />
        {/* Selected range fill - light purple glass */}
        <div
          className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-violet-300/60 via-purple-300/50 to-fuchsia-300/60 backdrop-blur-sm border border-white/40"
          style={{
            left: `${percentMin}%`,
            right: `${100 - percentMax}%`,
          }}
        />
        {/* Min thumb */}
        <div
          role="slider"
          aria-valuemin={min}
          aria-valuemax={localMax}
          aria-valuenow={localMin}
          tabIndex={0}
          onPointerDown={handlePointerDown("min")}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="range-thumb absolute top-1/2 z-10 h-4 w-4 -translate-y-1/2 cursor-grab rounded-full border border-white/60 bg-white/90 shadow-sm backdrop-blur-sm active:cursor-grabbing hover:shadow transition-shadow"
          style={{ left: `calc(${percentMin}% - 8px)` }}
        />
        {/* Max thumb */}
        <div
          role="slider"
          aria-valuemin={localMin}
          aria-valuemax={max}
          aria-valuenow={localMax}
          tabIndex={0}
          onPointerDown={handlePointerDown("max")}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="range-thumb absolute top-1/2 z-10 h-4 w-4 -translate-y-1/2 cursor-grab rounded-full border border-white/60 bg-white/90 shadow-sm backdrop-blur-sm active:cursor-grabbing hover:shadow transition-shadow"
          style={{ left: `calc(${percentMax}% - 8px)` }}
        />
      </div>
      <div className="flex justify-between text-xs text-zinc-500">
        <span>{formatValue(localMin)}</span>
        <span>{formatValue(localMax)}</span>
      </div>
    </div>
  );
}
