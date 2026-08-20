import { useState } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
}

/**
 * Image with a skeleton placeholder that shows until the image has actually
 * loaded, then a blur-up fade-in (starts blurred + scaled slightly, settles
 * to sharp) instead of a hard pop-in. Used anywhere a grid/hero image loads
 * over the network — Discover cards, Showcase masonry, the lightbox.
 */
const SmartImage = ({ src, alt, className, containerClassName }: Props) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      {!loaded && <Skeleton className="absolute inset-0 rounded-none" />}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={cn(
          "transition-all duration-700 ease-out",
          loaded ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-lg scale-105",
          className
        )}
      />
    </div>
  );
};

export default SmartImage;
