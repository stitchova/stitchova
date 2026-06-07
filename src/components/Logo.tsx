import darkLogo from "@/assets/stitchova-logo-dark.png.asset.json";
import lightLogo from "@/assets/stitchova-logo-light.png.asset.json";
import transparentLogo from "@/assets/stitchova-logo-transparent.png.asset.json";

interface LogoProps {
  size?: number;
  className?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  /**
   * "plaque" = official dark app-icon (default).
   * "light"  = ivory-background variant for light surfaces.
   * "mark"   = transparent PNG, no background plate.
   */
  variant?: "plaque" | "light" | "mark";
  /** Enables shimmer sweep + entrance animation. Auto-disabled on reduced-motion. */
  animated?: boolean;
  /** Rounded corner radius (px). Defaults match the official app-icon shape. */
  rounded?: number;
}

/**
 * Stitchova brand mark — uses the official needle-and-thread "S" monogram
 * in three variants (dark plaque / light plaque / transparent) with a
 * premium shimmer sweep and gentle entrance animation.
 */
const Logo = ({
  size = 40,
  className = "",
  showWordmark = false,
  wordmarkClassName = "",
  variant = "plaque",
  animated = true,
  rounded,
}: LogoProps) => {
  const src =
    variant === "light"
      ? lightLogo.url
      : variant === "mark"
      ? transparentLogo.url
      : darkLogo.url;

  const radius = rounded ?? (variant === "mark" ? 0 : Math.round(size * 0.22));

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div
        className="relative shrink-0 select-none"
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          overflow: "hidden",
          filter:
            variant === "mark"
              ? "drop-shadow(0 2px 8px hsl(var(--primary) / 0.35))"
              : "drop-shadow(0 8px 22px hsl(0 0% 0% / 0.45))",
          animation: animated ? "sv-enter 700ms cubic-bezier(.2,.7,.2,1) both" : undefined,
        }}
        aria-label="Stitchova"
        role="img"
      >
        <img
          src={src}
          alt="Stitchova"
          width={size}
          height={size}
          draggable={false}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            animation: animated ? "sv-float 6s ease-in-out infinite" : undefined,
          }}
        />
        {animated && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(115deg, transparent 30%, hsl(var(--primary) / 0.45) 48%, hsl(var(--accent) / 0.6) 50%, hsl(var(--primary) / 0.45) 52%, transparent 70%)",
              mixBlendMode: "screen",
              transform: "translateX(-110%)",
              animation: "sv-shine 3.6s ease-in-out 600ms infinite",
              borderRadius: radius,
            }}
          />
        )}
        <style>{`
          @keyframes sv-enter {
            0% { opacity: 0; transform: scale(.9); }
            100% { opacity: 1; transform: scale(1); }
          }
          @keyframes sv-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-1.5%); }
          }
          @keyframes sv-shine {
            0% { transform: translateX(-110%); }
            55%, 100% { transform: translateX(110%); }
          }
          @media (prefers-reduced-motion: reduce) {
            [aria-label="Stitchova"] * { animation: none !important; }
          }
        `}</style>
      </div>

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