import logo from "@/assets/stitchova-logo.png";

interface LogoProps {
  size?: number;
  className?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
}

/**
 * Stitchova brand logo. Use icon-only by default; pass `showWordmark`
 * for splash/auth/marketing surfaces.
 */
const Logo = ({ size = 40, className = "", showWordmark = false, wordmarkClassName = "" }: LogoProps) => {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <img
        src={logo}
        alt="Stitchova"
        width={size}
        height={size}
        className="rounded-2xl object-contain shrink-0"
        style={{ width: size, height: size }}
        draggable={false}
      />
      {showWordmark && (
        <span className={`font-bold tracking-wide text-foreground ${wordmarkClassName}`}>
          Stitchova
        </span>
      )}
    </div>
  );
};

export default Logo;