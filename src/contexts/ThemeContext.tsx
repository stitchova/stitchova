import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type ThemeId = "ash" | "ocean" | "forest" | "rose" | "dusk" | "sand" | "midnight";

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  emoji: string;
  description: string;
  // Used as a small swatch preview on the picker
  swatch: { bg: string; surface: string; accent: string };
  // CSS variables (HSL triplets, no hsl())
  vars: Record<string, string>;
}

/**
 * Brand base = ASH (#B2BEB5 ~ hsl(120 7% 73%)) + WHITE.
 * The default "Ash" theme uses warm white surfaces with ash accents.
 * Other themes are full palette swaps applied app-wide via :root CSS vars.
 */
export const themes: ThemeDefinition[] = [
  {
    id: "ash",
    name: "Ash",
    emoji: "🤍",
    description: "Soft ash & white",
    swatch: { bg: "0 0% 100%", surface: "120 6% 94%", accent: "120 7% 55%" },
    vars: {
      "--background": "0 0% 100%",
      "--foreground": "120 8% 12%",
      "--card": "120 6% 96%",
      "--card-foreground": "120 8% 12%",
      "--popover": "0 0% 100%",
      "--popover-foreground": "120 8% 12%",
      "--primary": "120 7% 45%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "120 8% 90%",
      "--secondary-foreground": "120 8% 18%",
      "--muted": "120 6% 92%",
      "--muted-foreground": "120 5% 38%",
      "--accent": "120 10% 60%",
      "--accent-foreground": "0 0% 100%",
      "--destructive": "0 75% 55%",
      "--destructive-foreground": "0 0% 100%",
      "--border": "120 8% 86%",
      "--input": "120 8% 88%",
      "--ring": "120 7% 55%",
      "--card-elevated": "120 6% 98%",
      "--status-cutting": "25 85% 55%",
      "--status-sewing": "210 70% 55%",
      "--status-completed": "142 60% 45%",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    emoji: "🌊",
    description: "Deep sea & sky",
    swatch: { bg: "210 40% 12%", surface: "210 35% 18%", accent: "195 85% 55%" },
    vars: {
      "--background": "210 40% 10%",
      "--foreground": "200 25% 96%",
      "--card": "210 35% 15%",
      "--card-foreground": "200 25% 96%",
      "--popover": "210 40% 12%",
      "--popover-foreground": "200 25% 96%",
      "--primary": "195 85% 55%",
      "--primary-foreground": "210 40% 8%",
      "--secondary": "210 30% 22%",
      "--secondary-foreground": "200 25% 96%",
      "--muted": "210 25% 25%",
      "--muted-foreground": "200 15% 70%",
      "--accent": "195 85% 55%",
      "--accent-foreground": "210 40% 8%",
      "--destructive": "0 75% 60%",
      "--destructive-foreground": "0 0% 100%",
      "--border": "210 25% 25%",
      "--input": "210 25% 22%",
      "--ring": "195 85% 55%",
      "--card-elevated": "210 35% 18%",
      "--status-cutting": "25 85% 60%",
      "--status-sewing": "195 85% 55%",
      "--status-completed": "150 65% 50%",
    },
  },
  {
    id: "forest",
    name: "Forest",
    emoji: "🌲",
    description: "Mossy greens",
    swatch: { bg: "150 25% 10%", surface: "150 20% 16%", accent: "140 55% 50%" },
    vars: {
      "--background": "150 25% 9%",
      "--foreground": "100 15% 95%",
      "--card": "150 20% 13%",
      "--card-foreground": "100 15% 95%",
      "--popover": "150 25% 10%",
      "--popover-foreground": "100 15% 95%",
      "--primary": "140 55% 50%",
      "--primary-foreground": "150 30% 8%",
      "--secondary": "150 18% 20%",
      "--secondary-foreground": "100 15% 95%",
      "--muted": "150 15% 22%",
      "--muted-foreground": "100 10% 70%",
      "--accent": "140 55% 50%",
      "--accent-foreground": "150 30% 8%",
      "--destructive": "0 75% 60%",
      "--destructive-foreground": "0 0% 100%",
      "--border": "150 15% 22%",
      "--input": "150 15% 20%",
      "--ring": "140 55% 50%",
      "--card-elevated": "150 20% 16%",
      "--status-cutting": "30 80% 55%",
      "--status-sewing": "200 70% 55%",
      "--status-completed": "140 60% 50%",
    },
  },
  {
    id: "rose",
    name: "Rose",
    emoji: "🌹",
    description: "Warm petal pinks",
    swatch: { bg: "350 30% 96%", surface: "350 35% 92%", accent: "340 70% 55%" },
    vars: {
      "--background": "350 35% 97%",
      "--foreground": "340 25% 18%",
      "--card": "350 35% 94%",
      "--card-foreground": "340 25% 18%",
      "--popover": "350 35% 97%",
      "--popover-foreground": "340 25% 18%",
      "--primary": "340 70% 55%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "350 30% 90%",
      "--secondary-foreground": "340 25% 22%",
      "--muted": "350 25% 92%",
      "--muted-foreground": "340 15% 42%",
      "--accent": "340 70% 60%",
      "--accent-foreground": "0 0% 100%",
      "--destructive": "0 75% 55%",
      "--destructive-foreground": "0 0% 100%",
      "--border": "350 25% 86%",
      "--input": "350 25% 88%",
      "--ring": "340 70% 55%",
      "--card-elevated": "350 35% 96%",
      "--status-cutting": "25 85% 55%",
      "--status-sewing": "340 70% 55%",
      "--status-completed": "150 55% 45%",
    },
  },
  {
    id: "dusk",
    name: "Dusk",
    emoji: "🌆",
    description: "Twilight purples",
    vars: {
      "--background": "265 30% 10%",
      "--foreground": "270 20% 95%",
      "--card": "265 25% 15%",
      "--card-foreground": "270 20% 95%",
      "--popover": "265 30% 12%",
      "--popover-foreground": "270 20% 95%",
      "--primary": "280 70% 65%",
      "--primary-foreground": "265 35% 10%",
      "--secondary": "265 22% 22%",
      "--secondary-foreground": "270 20% 95%",
      "--muted": "265 18% 24%",
      "--muted-foreground": "270 12% 70%",
      "--accent": "320 70% 65%",
      "--accent-foreground": "265 35% 10%",
      "--destructive": "0 75% 60%",
      "--destructive-foreground": "0 0% 100%",
      "--border": "265 18% 24%",
      "--input": "265 18% 22%",
      "--ring": "280 70% 65%",
      "--card-elevated": "265 25% 18%",
      "--status-cutting": "25 85% 60%",
      "--status-sewing": "280 70% 65%",
      "--status-completed": "150 60% 50%",
    },
    swatch: { bg: "265 30% 10%", surface: "265 25% 15%", accent: "280 70% 65%" },
  },
  {
    id: "sand",
    name: "Sand",
    emoji: "🏜️",
    description: "Warm desert tones",
    swatch: { bg: "35 40% 95%", surface: "35 35% 90%", accent: "30 75% 50%" },
    vars: {
      "--background": "35 40% 96%",
      "--foreground": "30 25% 18%",
      "--card": "35 35% 92%",
      "--card-foreground": "30 25% 18%",
      "--popover": "35 40% 96%",
      "--popover-foreground": "30 25% 18%",
      "--primary": "30 75% 50%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "35 30% 88%",
      "--secondary-foreground": "30 25% 22%",
      "--muted": "35 25% 90%",
      "--muted-foreground": "30 15% 42%",
      "--accent": "25 80% 55%",
      "--accent-foreground": "0 0% 100%",
      "--destructive": "0 75% 55%",
      "--destructive-foreground": "0 0% 100%",
      "--border": "35 25% 84%",
      "--input": "35 25% 86%",
      "--ring": "30 75% 50%",
      "--card-elevated": "35 35% 94%",
      "--status-cutting": "30 75% 50%",
      "--status-sewing": "210 65% 55%",
      "--status-completed": "150 55% 45%",
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    emoji: "🌙",
    description: "Classic dark + gold",
    swatch: { bg: "240 6% 6%", surface: "240 8% 10%", accent: "45 100% 50%" },
    vars: {
      "--background": "240 6% 6%",
      "--foreground": "0 0% 100%",
      "--card": "240 8% 10%",
      "--card-foreground": "0 0% 100%",
      "--popover": "240 8% 10%",
      "--popover-foreground": "0 0% 100%",
      "--primary": "45 100% 50%",
      "--primary-foreground": "240 6% 6%",
      "--secondary": "240 6% 14%",
      "--secondary-foreground": "0 0% 100%",
      "--muted": "240 5% 18%",
      "--muted-foreground": "240 5% 65%",
      "--accent": "45 100% 50%",
      "--accent-foreground": "240 6% 6%",
      "--destructive": "0 84% 60%",
      "--destructive-foreground": "0 0% 100%",
      "--border": "240 5% 18%",
      "--input": "240 5% 18%",
      "--ring": "45 100% 50%",
      "--card-elevated": "240 7% 12%",
      "--status-cutting": "25 95% 53%",
      "--status-sewing": "45 100% 50%",
      "--status-completed": "142 71% 45%",
    },
  },
];

interface ThemeContextType {
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
  theme: ThemeDefinition;
  themes: ThemeDefinition[];
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const applyTheme = (theme: ThemeDefinition) => {
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  root.dataset.theme = theme.id;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeId, setThemeIdState] = useState<ThemeId>(() => {
    const stored = localStorage.getItem("fashionos-theme") as ThemeId | null;
    return stored && themes.find((t) => t.id === stored) ? stored : "ash";
  });

  useEffect(() => {
    const theme = themes.find((t) => t.id === themeId) || themes[0];
    applyTheme(theme);
  }, [themeId]);

  const setThemeId = (id: ThemeId) => {
    setThemeIdState(id);
    localStorage.setItem("fashionos-theme", id);
  };

  const theme = themes.find((t) => t.id === themeId) || themes[0];

  return (
    <ThemeContext.Provider value={{ themeId, setThemeId, theme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};