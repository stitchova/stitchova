import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Palette,
  Search,
  X,
  Home,
  MessageCircle,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { useTheme, ThemeDefinition } from "@/contexts/ThemeContext";

type PreviewScreen = "home" | "messages" | "orders" | "analytics";

const screens: { id: PreviewScreen; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "messages", label: "Chat", icon: MessageCircle },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "analytics", label: "Stats", icon: TrendingUp },
];

/** Renders a tiny mock UI using the given theme's CSS variables, scoped via inline style. */
const PreviewFrame = ({
  theme,
  screen,
}: {
  theme: ThemeDefinition;
  screen: PreviewScreen;
}) => {
  const styleVars = Object.fromEntries(
    Object.entries(theme.vars).map(([k, v]) => [k, v]),
  ) as React.CSSProperties;

  return (
    <div
      style={{
        ...styleVars,
        background: `hsl(${theme.vars["--background"]})`,
        color: `hsl(${theme.vars["--foreground"]})`,
      }}
      className="rounded-2xl overflow-hidden border border-border/40 h-[360px] p-3 flex flex-col"
    >
      {/* Status bar */}
      <div className="flex items-center justify-between mb-2 text-[9px] opacity-60">
        <span>9:41</span>
        <span>Stitchova</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className="flex-1 flex flex-col gap-2 overflow-hidden"
        >
          {screen === "home" && (
            <>
              <p className="text-[10px] opacity-60">Welcome back,</p>
              <p className="text-base font-bold">Adaeze ✨</p>
              <div
                className="rounded-xl p-3 mt-1"
                style={{
                  background: `linear-gradient(135deg, hsl(${theme.vars["--primary"]}), hsl(${theme.vars["--accent"]}))`,
                  color: `hsl(${theme.vars["--primary-foreground"]})`,
                }}
              >
                <p className="text-[9px] opacity-80">Active orders</p>
                <p className="text-lg font-bold">12</p>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="rounded-lg p-2 h-14"
                    style={{ background: `hsl(${theme.vars["--card"]})` }}
                  >
                    <div
                      className="w-5 h-5 rounded-md mb-1"
                      style={{ background: `hsl(${theme.vars["--primary"]} / 0.25)` }}
                    />
                    <div
                      className="h-1.5 w-2/3 rounded-full"
                      style={{ background: `hsl(${theme.vars["--muted"]})` }}
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {screen === "messages" && (
            <>
              <p className="text-xs font-bold mb-1">Messages</p>
              {[
                { me: false, t: "Hi! Is the gown ready?" },
                { me: true, t: "Yes, final fitting tomorrow 🎉" },
                { me: false, t: "Perfect — see you then!" },
              ].map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.me ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className="rounded-2xl px-2.5 py-1.5 text-[10px] max-w-[75%]"
                    style={
                      m.me
                        ? {
                            background: `hsl(${theme.vars["--primary"]})`,
                            color: `hsl(${theme.vars["--primary-foreground"]})`,
                          }
                        : {
                            background: `hsl(${theme.vars["--card"]})`,
                            color: `hsl(${theme.vars["--foreground"]})`,
                          }
                    }
                  >
                    {m.t}
                  </div>
                </div>
              ))}
              <div
                className="mt-auto rounded-full px-3 py-2 text-[10px]"
                style={{
                  background: `hsl(${theme.vars["--card"]})`,
                  color: `hsl(${theme.vars["--muted-foreground"]})`,
                }}
              >
                Type a message…
              </div>
            </>
          )}

          {screen === "orders" && (
            <>
              <p className="text-xs font-bold mb-1">Orders</p>
              {[
                { n: "Wedding Gown", s: "Sewing", v: "--status-sewing" },
                { n: "Agbada Set", s: "Cutting", v: "--status-cutting" },
                { n: "Kaftan", s: "Done", v: "--status-completed" },
              ].map((o) => (
                <div
                  key={o.n}
                  className="rounded-xl p-2 flex items-center justify-between"
                  style={{ background: `hsl(${theme.vars["--card"]})` }}
                >
                  <div>
                    <p className="text-[10px] font-semibold">{o.n}</p>
                    <p
                      className="text-[8px]"
                      style={{ color: `hsl(${theme.vars["--muted-foreground"]})` }}
                    >
                      Due Fri
                    </p>
                  </div>
                  <span
                    className="text-[8px] px-2 py-0.5 rounded-full font-semibold"
                    style={{
                      background: `hsl(${theme.vars[o.v as keyof typeof theme.vars]} / 0.2)`,
                      color: `hsl(${theme.vars[o.v as keyof typeof theme.vars]})`,
                    }}
                  >
                    {o.s}
                  </span>
                </div>
              ))}
            </>
          )}

          {screen === "analytics" && (
            <>
              <p className="text-xs font-bold mb-1">This week</p>
              <div
                className="rounded-xl p-3"
                style={{ background: `hsl(${theme.vars["--card"]})` }}
              >
                <p
                  className="text-[9px]"
                  style={{ color: `hsl(${theme.vars["--muted-foreground"]})` }}
                >
                  Revenue
                </p>
                <p
                  className="text-base font-bold"
                  style={{ color: `hsl(${theme.vars["--primary"]})` }}
                >
                  ₦480k
                </p>
                <div className="flex items-end gap-1 h-12 mt-2">
                  {[40, 65, 30, 80, 55, 90, 70].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-md"
                      style={{
                        height: `${h}%`,
                        background: `hsl(${theme.vars["--primary"]} / ${0.4 + (h / 100) * 0.6})`,
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { l: "Orders", v: "23" },
                  { l: "Clients", v: "18" },
                ].map((s) => (
                  <div
                    key={s.l}
                    className="rounded-xl p-2"
                    style={{ background: `hsl(${theme.vars["--card"]})` }}
                  >
                    <p
                      className="text-[9px]"
                      style={{ color: `hsl(${theme.vars["--muted-foreground"]})` }}
                    >
                      {s.l}
                    </p>
                    <p className="text-sm font-bold">{s.v}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const ThemePicker = () => {
  const navigate = useNavigate();
  const { themes, themeId, setThemeId } = useTheme();
  const [query, setQuery] = useState("");
  const [previewId, setPreviewId] = useState(themeId);
  const [screen, setScreen] = useState<PreviewScreen>("home");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return themes;
    return themes.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q),
    );
  }, [query, themes]);

  const previewTheme = themes.find((t) => t.id === previewId) || themes[0];
  const isApplied = previewId === themeId;

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
          <p className="text-xs text-muted-foreground">Preview, then apply across the app</p>
        </div>
      </div>

      {/* Live preview panel */}
      <div className="px-5 mb-4">
        <div className="frost-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Live preview</p>
              <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <span>{previewTheme.emoji}</span> {previewTheme.name}
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setThemeId(previewTheme.id)}
              disabled={isApplied}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                isApplied
                  ? "bg-muted text-muted-foreground"
                  : "bg-primary text-primary-foreground glow-primary"
              }`}
            >
              {isApplied ? "Applied" : "Apply theme"}
            </motion.button>
          </div>

          {/* Screen tabs */}
          <div className="flex gap-1 mb-3 p-1 rounded-full bg-muted/50">
            {screens.map((s) => {
              const Icon = s.icon;
              const active = s.id === screen;
              return (
                <button
                  key={s.id}
                  onClick={() => setScreen(s.id)}
                  className={`relative flex-1 flex items-center justify-center gap-1 py-1.5 rounded-full text-[10px] font-medium transition-colors ${
                    active ? "text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="screen-pill"
                      className="absolute inset-0 bg-primary rounded-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
                    />
                  )}
                  <Icon className="w-3 h-3 relative z-10" />
                  <span className="relative z-10">{s.label}</span>
                </button>
              );
            })}
          </div>

          <PreviewFrame theme={previewTheme} screen={screen} />
        </div>
      </div>

      {/* Search */}
      <div className="px-5 mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search themes…"
            className="glass-input w-full pl-9 pr-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/40"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted flex items-center justify-center"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      <div className="px-5 grid grid-cols-2 gap-3">
        {filtered.length === 0 && (
          <p className="col-span-2 text-center text-sm text-muted-foreground py-8">
            No themes match "{query}"
          </p>
        )}
        {filtered.map((t, i) => {
          const active = t.id === themeId;
          const isPreview = t.id === previewId;
          return (
            <motion.button
              key={t.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setPreviewId(t.id)}
              className={`relative p-4 rounded-2xl border text-left overflow-hidden transition-all ${
                isPreview
                  ? "border-primary shadow-lg ring-2 ring-primary/30"
                  : active
                    ? "border-primary/60"
                    : "border-border/40"
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
        Tap a swatch to preview, then "Apply theme" to use it everywhere.
      </p>
    </div>
  );
};

export default ThemePicker;