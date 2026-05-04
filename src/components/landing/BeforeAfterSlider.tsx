import { useState, useRef, useCallback } from "react";
import smileBefore from "@/assets/smile-before.jpg";
import smileAfter from "@/assets/smile-after.jpg";

export default function BeforeAfterSlider() {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const rafId = useRef<number | null>(null);

  const updatePosition = useCallback((clientX: number) => {
    if (rafId.current !== null) return;
    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      setPosition((x / rect.width) * 100);
    });
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    updatePosition(e.clientX);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    updatePosition(e.clientX);
  };

  const stopDragging = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[560px] mx-auto aspect-[5/4] rounded-xl overflow-hidden cursor-ew-resize select-none touch-none glow-border-strong"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
      role="slider"
      aria-valuenow={Math.round(position)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Confronto prima e dopo"
    >
      {/* After (full background) */}
      <img src={smileAfter} alt="Dopo la simulazione" className="absolute inset-0 w-full h-full object-cover pointer-events-none" draggable={false} />

      {/* Before (clipped via clip-path — no reflow on drag) */}
      <img
        src={smileBefore}
        alt="Prima della simulazione"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        draggable={false}
      />

      {/* Divider */}
      <div className="absolute top-0 bottom-0 z-10 pointer-events-none" style={{ left: `${position}%`, transform: 'translateX(-50%)' }}>
        <div className="w-0.5 h-full bg-primary/80 shadow-[0_0_12px_hsl(190_100%_55%/0.4)]" />
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-[0_0_20px_hsl(190_100%_55%/0.5)]">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-primary-foreground">
            <path d="M5 9H13M5 9L7 7M5 9L7 11M13 9L11 7M13 9L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Labels */}
      <span className="absolute top-3 left-3 text-xs font-display font-bold tracking-wider uppercase bg-background/70 backdrop-blur-sm px-2 py-1 rounded pointer-events-none">Prima</span>
      <span className="absolute top-3 right-3 text-xs font-display font-bold tracking-wider uppercase bg-primary/20 backdrop-blur-sm px-2 py-1 rounded text-primary pointer-events-none">Dopo</span>
    </div>
  );
}
