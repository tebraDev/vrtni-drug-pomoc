import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

interface BeforeAfterProps {
  before: string;
  after: string;
  /** What the photo shows, e.g. "Mowing an overgrown lawn". */
  subject: string;
  beforeLabel: string;
  afterLabel: string;
  /** Sweep from "before" to the middle once, the first time the slider scrolls into view. */
  intro?: boolean;
  eager?: boolean;
  className?: string;
}

const clamp = (n: number) => Math.min(100, Math.max(0, n));

/**
 * Drag (or use arrow keys) to compare a garden before and after a visit.
 * The "after" photo sits underneath; the "before" photo is clipped from the right.
 */
const BeforeAfter = ({
  before, after, subject, beforeLabel, afterLabel, intro = false, eager = false, className = "",
}: BeforeAfterProps) => {
  const frameRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [pos, setPos] = useState(intro ? 100 : 50);
  const [sweeping, setSweeping] = useState(false);

  // One orchestrated moment: the overgrown "before" gives way to the tended "after".
  useEffect(() => {
    if (!intro) return;
    const el = frameRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setPos(50);
      return;
    }
    let timer: number | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        timer = window.setTimeout(() => {
          setSweeping(true);
          setPos(42);
          timer = window.setTimeout(() => setSweeping(false), 1500);
        }, 500);
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timer) window.clearTimeout(timer);
    };
  }, [intro]);

  const moveTo = (clientX: number) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    setSweeping(false);
    setPos(clamp(((clientX - rect.left) / rect.width) * 100));
  };

  // Touch drags only take over once the finger is clearly moving sideways; a mostly vertical
  // swipe is left to the browser so the page scrolls and the divider stays put.
  const gesture = useRef<{ x: number; y: number; decided: boolean } | null>(null);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    if (e.pointerType === "mouse") {
      gesture.current = { x: e.clientX, y: e.clientY, decided: true };
      e.currentTarget.setPointerCapture(e.pointerId);
      moveTo(e.clientX);
    } else {
      gesture.current = { x: e.clientX, y: e.clientY, decided: false };
    }
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!dragging.current || !g) return;
    if (!g.decided) {
      const dx = Math.abs(e.clientX - g.x);
      const dy = Math.abs(e.clientY - g.y);
      if (dx < 6 && dy < 6) return;
      if (dy >= dx) {
        dragging.current = false;
        return;
      }
      g.decided = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    moveTo(e.clientX);
  };
  const endDrag = () => {
    dragging.current = false;
    gesture.current = null;
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 20 : 5;
    let next: number | null = null;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = pos - step;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = pos + step;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = 100;
    if (next === null) return;
    e.preventDefault();
    setSweeping(false);
    setPos(clamp(next));
  };

  const ease = sweeping ? "1.4s cubic-bezier(0.65, 0, 0.35, 1)" : "0s";

  return (
    <div
      ref={frameRef}
      className={`relative select-none overflow-hidden rounded-lg bg-muted cursor-ew-resize ${className}`}
      style={{ touchAction: "pan-y" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <img
        src={after}
        alt={`${subject}: ${afterLabel}`}
        loading={eager ? "eager" : "lazy"}
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <img
        src={before}
        alt={`${subject}: ${beforeLabel}`}
        loading={eager ? "eager" : "lazy"}
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)`, transition: `clip-path ${ease}` }}
      />

      <span
        className="pointer-events-none absolute left-3 top-3 rounded bg-background/90 px-2.5 py-1 text-sm font-medium text-foreground transition-opacity"
        style={{ opacity: pos < 12 ? 0 : 1 }}
      >
        {beforeLabel}
      </span>
      <span
        className="pointer-events-none absolute right-3 top-3 rounded bg-primary px-2.5 py-1 text-sm font-medium text-primary-foreground transition-opacity"
        style={{ opacity: pos > 88 ? 0 : 1 }}
      >
        {afterLabel}
      </span>

      {/* Divider + handle. The handle is the keyboard-operable slider. */}
      <div
        className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.15)]"
        style={{ left: `${pos}%`, transition: `left ${ease}` }}
      >
        <div
          role="slider"
          tabIndex={0}
          aria-label={`${subject}: ${beforeLabel} / ${afterLabel}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          aria-valuetext={`${Math.round(pos)}% ${beforeLabel}`}
          onKeyDown={onKeyDown}
          className="pointer-events-auto absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#18301F] shadow-[0_2px_10px_rgba(0,0,0,0.3)] focus-visible:outline-offset-4"
        >
          <svg width="22" height="14" viewBox="0 0 22 14" fill="none" aria-hidden="true">
            <path d="M7 1 1 7l6 6M15 1l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default BeforeAfter;
