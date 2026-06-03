import { useMemo } from "react";
import { Plus, type LucideIcon } from "lucide-react";

export interface BottomNavItem {
  icon: LucideIcon;
  label: string;
  path: string;
  isCenter?: boolean;
}

export interface BottomNavLayout<T extends BottomNavItem> {
  leftSlots: Array<T | null>;
  rightSlots: Array<T | null>;
  centerItem: T | undefined;
  CenterIcon: LucideIcon;
  /** Diameter of the floating FAB in px. */
  fabSize: number;
  /** Width of the notch column reserved in the grid (matches mask radius * 2). */
  notchWidth: number;
  /** Radius of the curved notch cutout in px. */
  notchRadius: number;
  /** Height of the bar itself in px (excludes safe-area inset). */
  barHeight: number;
  /** How much the FAB protrudes above the bar in px. */
  fabProtrusion: number;
  /** Inline styles for the outer fixed container — applies safe-area inset. */
  containerStyle: React.CSSProperties;
  /** Shared nav CSS custom properties for the curved bar + FAB geometry. */
  navStyle: React.CSSProperties;
  /** Inline styles for the bar grid — symmetric columns + notch spacer. */
  gridStyle: React.CSSProperties;
  /** Inline styles for the absolutely-positioned FAB. */
  fabStyle: React.CSSProperties;
}

/**
 * Single source of truth for BottomNav geometry.
 * - Enforces a symmetric 2 + [center] + 2 layout for every role.
 * - Computes safe-area aware offsets so the FAB stays visually centered
 *   above the curved notch on devices with iOS/Android insets.
 */
export function useBottomNavLayout<T extends BottomNavItem>(
  items: T[],
  options?: { fabSize?: number; barHeight?: number; notchWidth?: number }
): BottomNavLayout<T> {
  const fabSize = options?.fabSize ?? 72;
  const barHeight = options?.barHeight ?? 78;
  const notchWidth = options?.notchWidth ?? 84;

  return useMemo(() => {
    const centerItem = items.find((i) => i.isCenter);
    const sideItems = items.filter((i) => !i.isCenter);

    const leftSlots: Array<T | null> = [sideItems[0] ?? null, sideItems[1] ?? null];
    const rightSlots: Array<T | null> = [sideItems[2] ?? null, sideItems[3] ?? null];
    const CenterIcon = (centerItem?.icon ?? Plus) as LucideIcon;
    const notchRadius = Math.round(notchWidth / 2);

    // FAB protrudes ~45% above the bar.
    const fabProtrusion = Math.round(fabSize * 0.45);
    const symmetricalInset = "max(env(safe-area-inset-left, 0px), env(safe-area-inset-right, 0px))";

    const containerStyle: React.CSSProperties = {
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
      paddingLeft: symmetricalInset,
      paddingRight: symmetricalInset,
    };

    const navStyle = {
      ["--bottom-nav-bar-height" as string]: `${barHeight}px`,
      ["--bottom-nav-notch-width" as string]: `${notchWidth}px`,
      ["--bottom-nav-notch-radius" as string]: `${notchRadius}px`,
      ["--bottom-nav-fab-size" as string]: `${fabSize}px`,
      ["--bottom-nav-fab-protrusion" as string]: `${fabProtrusion}px`,
    } as React.CSSProperties;

    const gridStyle: React.CSSProperties = {
      gridTemplateColumns: `minmax(0, 1fr) ${notchWidth}px minmax(0, 1fr)`,
    };

    const fabStyle: React.CSSProperties = {
      left: "50%",
      transform: "translateX(-50%)",
      top: `calc(var(--bottom-nav-fab-protrusion) * -1)`,
      width: "var(--bottom-nav-fab-size)",
      height: "var(--bottom-nav-fab-size)",
    };

    return {
      leftSlots,
      rightSlots,
      centerItem,
      CenterIcon,
      fabSize,
      notchWidth,
      notchRadius,
      barHeight,
      fabProtrusion,
      containerStyle,
      navStyle,
      gridStyle,
      fabStyle,
    };
  }, [items, fabSize, barHeight, notchWidth]);
}
