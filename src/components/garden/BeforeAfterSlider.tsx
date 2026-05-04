import { useCallback, useEffect, useRef, useState } from "react";
import { GripVertical } from "lucide-react";

interface Props {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel: string;
  afterLabel: string;
  alt: string;
}

const BeforeAfterSlider = ({ beforeSrc, afterSrc, beforeLabel, afterLabel, alt }: Props) => {
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, p)));
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent | TouchEvent) => {
      const x = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      updateFromClientX(x);
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [dragging, updateFromClientX]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - 5));
    if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + 5));
  };

  return (
    <div
      ref={ref}
      className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl select-none ring-1 ring-border shadow-soft bg-muted"
      onMouseDown={(e) => {
        setDragging(true);
        updateFromClientX(e.clientX);
      }}
      onTouchStart={(e) => {
        setDragging(true);
        updateFromClientX(e.touches[0].clientX);
      }}
    >
      {/* After (base, full) */}
      <img
        src={afterSrc}
        alt={`${alt} — ${afterLabel}`}
        loading="lazy"
        width={1024}
        height={768}
        className="absolute inset-0 h-full w-full object-cover pointer-events-none"
        draggable={false}
      />
      {/* Before (clipped on top) */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        <img
          src={beforeSrc}
          alt={`${alt} — ${beforeLabel}`}
          loading="lazy"
          width={1024}
          height={768}
          className="h-full w-full object-cover"
          draggable={false}
        />
      </div>

      {/* Labels */}
      <span className="absolute top-3 left-3 bg-background/85 backdrop-blur text-foreground text-xs font-semibold px-2.5 py-1 rounded-full ring-1 ring-border pointer-events-none">
        {beforeLabel}
      </span>
      <span className="absolute top-3 right-3 bg-primary/90 text-primary-foreground text-xs font-semibold px-2.5 py-1 rounded-full pointer-events-none">
        {afterLabel}
      </span>

      {/* Divider + handle */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-primary-foreground shadow-[0_0_0_1px_hsl(var(--primary)/0.5)] pointer-events-none"
        style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
      />
      <button
        type="button"
        role="slider"
        aria-label="Before/After comparison"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        tabIndex={0}
        onKeyDown={onKey}
        onMouseDown={(e) => {
          e.stopPropagation();
          setDragging(true);
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
          setDragging(true);
        }}
        className="absolute top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-primary text-primary-foreground shadow-glow ring-2 ring-primary-foreground flex items-center justify-center cursor-ew-resize hover:scale-105 transition-transform"
        style={{ left: `${pos}%`, transform: "translate(-50%, -50%)" }}
      >
        <GripVertical className="h-5 w-5" />
      </button>
    </div>
  );
};

export default BeforeAfterSlider;