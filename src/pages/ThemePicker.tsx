import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Palette } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const ThemePicker = () => {
  const navigate = useNavigate();
  const { themes, themeId, setThemeId } = useTheme();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-card flex items-center justify-center border border-border/40">
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </motion.button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" /> Themes
          </h1>
          <p className="text-xs text-muted-foreground">Pick a palette — applied instantly across the app</p>
        </div>
      </div>

      <div className="px-5 grid grid-cols-2 gap-3">
        {themes.map((t, i) => {
          const active = t.id === themeId;
          return (
            <motion.button
              key={t.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setThemeId(t.id)}
              className={`relative p-4 rounded-2xl border text-left overflow-hidden transition-all ${
                active ? "border-primary shadow-lg" : "border-border/40 bg-card"
              }`}
              style={{
                background: `linear-gradient(135deg, hsl(${t.swatch.bg}) 0%, hsl(${t.swatch.surface}) 100%)`,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{t.emoji}</span>
                {active && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: `hsl(${t.swatch.accent})` }}>
                    <Check className="w-3.5 h-3.5" style={{ color: `hsl(${t.swatch.bg})` }} />
                  </motion.div>
                )}
              </div>
              <p className="text-sm font-bold" style={{ color: `hsl(${t.vars["--foreground"]})` }}>{t.name}</p>
              <p className="text-[10px] mt-0.5" style={{ color: `hsl(${t.vars["--muted-foreground"]})` }}>{t.description}</p>
              <div className="flex gap-1.5 mt-3">
                <span className="w-5 h-5 rounded-full border border-white/20" style={{ background: `hsl(${t.swatch.bg})` }} />
                <span className="w-5 h-5 rounded-full border border-white/20" style={{ background: `hsl(${t.swatch.surface})` }} />
                <span className="w-5 h-5 rounded-full border border-white/20" style={{ background: `hsl(${t.swatch.accent})` }} />
              </div>
            </motion.button>
          );
        })}
      </div>

      <p className="text-[11px] text-muted-foreground text-center mt-8 px-8">
        Your theme preference is saved locally and applied across all pages.
      </p>
    </div>
  );
};

export default ThemePicker;