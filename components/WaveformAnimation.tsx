"use client";

interface WaveformAnimationProps {
  isActive: boolean;
  /** Number of bars to render */
  bars?: number;
  className?: string;
}

const DELAYS = ["0ms", "80ms", "160ms", "240ms", "160ms", "80ms", "0ms"];

export function WaveformAnimation({ isActive, bars = 7, className = "" }: WaveformAnimationProps) {
  if (!isActive) return null;

  return (
    <div
      className={`flex items-center gap-[3px] ${className}`}
      aria-label="Recording in progress"
      role="status"
    >
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className="block w-[3px] rounded-full bg-indigo-400"
          style={{
            height: "18px",
            animation: "waveformBar 0.7s ease-in-out infinite alternate",
            animationDelay: DELAYS[i % DELAYS.length],
            transformOrigin: "center",
          }}
        />
      ))}
    </div>
  );
}
