import { useMemo } from "react";
import { Plus, type LucideIcon } from "lucide-react";

export interface BottomNavItem {
  icon: LucideIcon;
  label: string;
  path: string;
  isCenter?: boolean;
}

export interface BottomNavLayout<T extends BottomNavItem> {
  leftItems: T[];
  rightItems: T[];
  centerItem: T | undefined;
  CenterIcon: LucideIcon;
  /** Diameter of the floating FAB in px. */
  fabSize: number;
  /** Width of the notch column reserved in the grid (matches mask radius * 2). */
  notchWidth: number;
  /** Height of the bar itself in px (excludes safe-area inset). */
  barHeight: number;
  /** How much the FAB protrudes above the bar in px. */
  fabProtrusion: number;
  /** Inline styles for the outer fixed container — applies safe-area inset. */
  containerStyle: React.CSSProperties;
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

    const balanced: T[] = [...sideItems];
    while (balanced.length < 4) {
      balanced.push({ icon: Plus, label: "", path: "#" } as unknown as T);
    }
    if (balanced.length > 4) balanced.length = 4;

    const leftItems = balanced.slice(0, 2);
    const rightItems = balanced.slice(2, 4);
    const CenterIcon = (centerItem?.icon ?? Plus) as LucideIcon;

    // FAB protrudes ~45% above the bar.
    const fabProtrusion = Math.round(fabSize * 0.45);

    const containerStyle: React.CSSProperties = {
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
      paddingLeft: "env(safe-area-inset-left, 0px)",
      paddingRight: "env(safe-area-inset-right, 0px)",
    };

    const gridStyle: React.CSSProperties = {
      gridTemplateColumns: `1fr ${notchWidth}px 1fr`,
    };

    const fabStyle: React.CSSProperties = {
      left: "50%",
      transform: "translateX(-50%)",
      top: `-${fabProtrusion}px`,
      width: `${fabSize}px`,
      height: `${fabSize}px`,
    };

    return {
      leftItems,
      rightItems,
      centerItem,
      CenterIcon,
      fabSize,
      notchWidth,
      barHeight,
      fabProtrusion,
      containerStyle,
      gridStyle,
      fabStyle,
    };
  }, [items, fabSize, barHeight, notchWidth]);
}
