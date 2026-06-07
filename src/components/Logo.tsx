import { useId } from "react";

interface LogoProps {
  size?: number;
  className?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  /** "plaque" renders the rounded-square dark background; "mark" is transparent. */
  variant?: "plaque" | "mark";
  /** Enables draw-in + shimmer animation. Disabled automatically on reduced-motion. */
  animated?: boolean;
}

/**
 * Stitchova brand mark — a premium needle-and-thread "S" monogram rendered
 * entirely in SVG so it scales crisply, themes via CSS tokens, and animates.
 */
const Logo = ({
  size = 40,
  className = "",
  showWordmark = false,
  wordmarkClassName = "",
  variant = "plaque",
  animated = true,
}: LogoProps) => {
  const uid = useId().replace(/:/g, "");
  const gradId = `sv-grad-${uid}`;
  const shimmerId = `sv-shimmer-${uid}`;
  const plaqueGradId = `sv-plaque-${uid}`;
  const glowId = `sv-glow-${uid}`;

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        role="img"
        aria-label="Stitchova"
        className="shrink-0 select-none"
        style={{
          filter:
            variant === "plaque"
              ? "drop-shadow(0 6px 18px hsl(var(--primary) / 0.35))"
              : "drop-shadow(0 2px 6px hsl(var(--primary) / 0.25))",
        }}
      >
        <defs>
          {/* Brand gold gradient driven by theme tokens */}
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="55%" stopColor="hsl(var(--accent))" />
            <stop offset="100%" stopColor="hsl(var(--primary))" />
          </linearGradient>

          {/* Shimmer overlay that sweeps across the thread */}
          <linearGradient id={shimmerId} x1="-50%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary-foreground))" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(var(--primary-foreground))" stopOpacity="0.85" />
            <stop offset="100%" stopColor="hsl(var(--primary-foreground))" stopOpacity="0" />
            {animated && (
              <>
                <animate
                  attributeName="x1"
                  values="-60%;100%"
                  dur="3s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="x2"
                  values="-10%;150%"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </>
            )}
          </linearGradient>

          {/* Dark plaque gradient */}
          <linearGradient id={plaqueGradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(0 0% 10%)" />
            <stop offset="100%" stopColor="hsl(0 0% 4%)" />
          </linearGradient>

          <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {variant === "plaque" && (
          <>
            <rect
              x="2"
              y="2"
              width="60"
              height="60"
              rx="16"
              ry="16"
              fill={`url(#${plaqueGradId})`}
              stroke="hsl(var(--primary) / 0.25)"
              strokeWidth="0.75"
            />
            {/* Inner highlight */}
            <rect
              x="3"
              y="3"
              width="58"
              height="1.5"
              rx="0.75"
              fill="hsl(var(--primary-foreground) / 0.08)"
            />
          </>
        )}

        {/* Thread — the S curve. pathLength=100 lets us animate consistently. */}
        <g filter={`url(#${glowId})`}>
          <path
            d="M44 20 C 44 14, 36 12, 28 14 C 20 16, 18 22, 24 26 C 30 30, 40 32, 40 38 C 40 46, 30 50, 20 46"
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth="4.25"
            strokeLinecap="round"
            pathLength={100}
            style={
              animated
                ? {
                    strokeDasharray: 100,
                    strokeDashoffset: 100,
                    animation: "sv-draw 1100ms cubic-bezier(.2,.7,.2,1) 80ms forwards",
                  }
                : undefined
            }
          />
          {/* Shimmer pass on top of the thread */}
          <path
            d="M44 20 C 44 14, 36 12, 28 14 C 20 16, 18 22, 24 26 C 30 30, 40 32, 40 38 C 40 46, 30 50, 20 46"
            fill="none"
            stroke={`url(#${shimmerId})`}
            strokeWidth="4.25"
            strokeLinecap="round"
            opacity="0.9"
          />
        </g>

        {/* Needle — slim diagonal with an eye, crosses the upper-right of the S */}
        <g
          style={
            animated
              ? {
                  transformOrigin: "50px 14px",
                  animation: "sv-needle 520ms cubic-bezier(.2,.7,.2,1) 700ms both",
                }
              : undefined
          }
        >
          <line
            x1="50"
            y1="10"
            x2="30"
            y2="30"
            stroke="hsl(var(--primary-foreground))"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.95"
          />
          {/* Needle tip */}
          <circle cx="30" cy="30" r="1.1" fill="hsl(var(--primary-foreground))" />
          {/* Eye of the needle */}
          <circle
            cx="49"
            cy="11"
            r="1.6"
            fill="none"
            stroke="hsl(var(--primary-foreground))"
            strokeWidth="1"
          />
          {/* Highlight */}
          <line
            x1="48"
            y1="13"
            x2="38"
            y2="23"
            stroke="hsl(var(--primary-foreground) / 0.55)"
            strokeWidth="0.5"
            strokeLinecap="round"
          />
        </g>

        <style>{`
          @keyframes sv-draw {
            to { stroke-dashoffset: 0; }
          }
          @keyframes sv-needle {
            from { opacity: 0; transform: translate(6px, -6px) rotate(-8deg); }
            to { opacity: 1; transform: translate(0,0) rotate(0); }
          }
          @media (prefers-reduced-motion: reduce) {
            [data-sv-anim] { animation: none !important; }
          }
        `}</style>
      </svg>

      {showWordmark && (
        <span
          className={`font-bold uppercase tracking-[0.18em] text-foreground ${wordmarkClassName}`}
        >
          Stitch<span className="text-gradient-gold">ova</span>
        </span>
      )}
    </div>
  );
};

export default Logo;