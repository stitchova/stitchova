import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, Search, ChevronRight, Star, MapPin, ShoppingBag, CalendarDays,
  Compass, Clock, Sparkles, ArrowUpRight,
} from "lucide-react";

import designerAvatar1 from "@/assets/designer-avatar-1.jpg";
import designerAvatar2 from "@/assets/designer-avatar-2.jpg";
import designerAvatar3 from "@/assets/designer-avatar-3.jpg";
import portfolio1 from "@/assets/designer-portfolio-1.jpg";
import portfolio2 from "@/assets/designer-portfolio-2.jpg";
import portfolio3 from "@/assets/designer-portfolio-3.jpg";
import portfolio4 from "@/assets/designer-portfolio-4.jpg";

/**
 * Tablet/desktop landing page for the Client role. Previously this page had
 * zero desktop treatment — the rich mobile version (carousel, progress
 * rings, horizontal-scroll galleries) just stretched into a single narrow
 * column on a wide screen, which is what read as "messy". This reuses the
 * exact same data and imagery as the mobile page, but replaces horizontal
 * scroll-snap galleries (a mobile pattern) with real grids, and gives the
 * hero banner room to breathe at desktop scale.
 */

const ease = [0.16, 1, 0.3, 1];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease } },
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const heroSlides = [
  { img: portfolio1, tag: "New Season", title: "Spring Collection", subtitle: "is Here" },
  { img: portfolio3, tag: "Trending", title: "Modern Agbada", subtitle: "Reimagined" },
  { img: portfolio4, tag: "Editor's Pick", title: "Evening Glam", subtitle: "For Every Occasion" },
  { img: portfolio2, tag: "Bespoke", title: "Corporate Chic", subtitle: "Tailored For You" },
];

const quickActions = [
  { icon: Compass, label: "Discover Designers", path: "/discover", gradient: "from-primary/20 to-primary/5" },
  { icon: CalendarDays, label: "Appointments", path: "/appointments", gradient: "from-accent/20 to-accent/5" },
  { icon: ShoppingBag, label: "My Orders", path: "/client-orders", gradient: "from-primary/20 to-primary/5" },
];

const activeOrders = [
  { type: "Wedding Gown", designer: "Nana Ama Couture", designerId: "nana-ama", avatar: designerAvatar1, status: "Sewing", progress: 65, date: "Mar 28", statusColor: "bg-status-sewing" },
  { type: "3-Piece Suit", designer: "Kwame Styles", designerId: "kwame-styles", avatar: designerAvatar2, status: "Cutting", progress: 30, date: "Apr 5", statusColor: "bg-status-cutting" },
];

const trendingStyles = [
  { img: portfolio1, title: "Kente Bridal", likes: 342 },
  { img: portfolio3, title: "Modern Agbada", likes: 218 },
  { img: portfolio4, title: "Evening Glam", likes: 189 },
  { img: portfolio2, title: "Corporate Chic", likes: 156 },
];

const recommended = [
  { name: "Nana Ama Couture", avatar: designerAvatar1, specialty: "Bridal & Evening Wear", rating: 4.9, location: "Accra", preview: portfolio1, id: "nana-ama", price: "GHS 2,500" },
  { name: "Kwame Styles", avatar: designerAvatar2, specialty: "Traditional & Agbada", rating: 4.7, location: "Kumasi", preview: portfolio2, id: "kwame-styles", price: "GHS 1,800" },
  { name: "Efya Designs", avatar: designerAvatar3, specialty: "Contemporary African", rating: 4.8, location: "Tema", preview: portfolio4, id: "efya-designs", price: "GHS 1,200" },
];

const ClientHomeWorkspace = () => {
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % heroSlides.length), 4500);
    return () => clearInterval(id);
  }, []);
  const current = heroSlides[slide];

  return (
    <div className="hidden lg:block px-8 pt-6 pb-16">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate("/profile")}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center ring-2 ring-primary/20 flex-shrink-0">
          <span className="text-sm font-bold text-foreground">AK</span>
        </motion.button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{getGreeting()}, <span className="shimmer-text">Akua</span> ✨</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Find your perfect designer</p>
        </div>
        <motion.button whileTap={{ scale: 0.98 }} onClick={() => navigate("/discover")}
          className="ml-8 flex-1 max-w-md flex items-center gap-3 solid-input px-4 py-3">
          <Search className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Search designers, styles…</span>
        </motion.button>
        <motion.button whileTap={{ scale: 0.92 }} onClick={() => navigate("/client-orders")}
          className="ml-auto w-11 h-11 rounded-full solid-panel flex items-center justify-center relative">
          <Bell className="w-5 h-5 text-foreground" />
          <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-primary pulse-glow" />
        </motion.button>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
        {/* Hero carousel — full width, cinematic on desktop */}
        <motion.div variants={fadeUp}>
          <motion.div whileHover={{ scale: 1.005 }} onClick={() => navigate("/discover")}
            className="relative h-80 rounded-3xl overflow-hidden cursor-pointer">
            <AnimatePresence mode="sync">
              <motion.img key={`img-${slide}`} src={current.img} alt={current.title}
                initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 1.4, ease }} className="absolute inset-0 w-full h-full object-cover" />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/50 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center px-12 max-w-lg">
              <AnimatePresence mode="wait">
                <motion.div key={`txt-${slide}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.6, ease }}>
                  <p className="text-xs uppercase tracking-widest text-primary font-semibold">{current.tag}</p>
                  <h2 className="text-4xl font-bold text-foreground mt-2 leading-tight">{current.title}<br />{current.subtitle}</h2>
                </motion.div>
              </AnimatePresence>
              <motion.div whileHover={{ x: 6 }}
                className="mt-6 flex items-center gap-2 text-sm font-semibold text-primary w-fit">
                <Sparkles className="w-4 h-4" /> Explore Now <ChevronRight className="w-4 h-4" />
              </motion.div>
            </div>
            <div className="absolute bottom-6 right-8 flex items-center gap-2">
              {heroSlides.map((_, i) => (
                <button key={i} onClick={(e) => { e.stopPropagation(); setSlide(i); }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === slide ? "w-8 bg-primary" : "w-2 bg-foreground/30"}`}
                  aria-label={`Slide ${i + 1}`} />
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Quick actions */}
        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4">
          {quickActions.map((a) => (
            <motion.button key={a.label} whileTap={{ scale: 0.97 }} whileHover={{ y: -3 }}
              onClick={() => navigate(a.path)}
              className="solid-panel p-6 flex items-center gap-4 text-left group">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${a.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                <a.icon className="w-5.5 h-5.5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{a.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                  Open <ArrowUpRight className="w-3 h-3" />
                </p>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Active orders + appointment, side by side */}
        <motion.div variants={fadeUp} className="grid grid-cols-[1.6fr_1fr] gap-5 items-start">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Active Orders</h2>
              <button onClick={() => navigate("/client-orders")} className="text-xs text-primary font-medium flex items-center gap-1">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {activeOrders.map((o, i) => (
                <motion.div key={o.type} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.5, ease }}
                  whileHover={{ y: -3 }} onClick={() => navigate(`/designer/${o.designerId}`)}
                  className="solid-panel p-5 cursor-pointer flex items-center gap-4">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 56 56">
                      <circle cx="28" cy="28" r="24" fill="none" stroke="hsl(var(--secondary))" strokeWidth="4" />
                      <motion.circle cx="28" cy="28" r="24" fill="none" stroke="hsl(var(--primary))" strokeWidth="4"
                        strokeLinecap="round" strokeDasharray={150.8}
                        initial={{ strokeDashoffset: 150.8 }}
                        animate={{ strokeDashoffset: 150.8 - (150.8 * o.progress / 100) }}
                        transition={{ duration: 1.2, ease, delay: 0.4 + i * 0.15 }} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img src={o.avatar} alt={o.designer} className="w-10 h-10 rounded-full object-cover" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground truncate">{o.type}</p>
                      <span className={`text-[9px] font-bold px-2 py-1 rounded-full ${o.statusColor} text-primary-foreground flex-shrink-0`}>
                        {o.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{o.designer}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span className="text-[10px]">Due {o.date}</span>
                      </div>
                      <span className="text-xs font-bold text-primary">{o.progress}%</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-4">Upcoming</h2>
            <motion.div whileHover={{ y: -3 }} onClick={() => navigate("/appointments")}
              className="solid-panel p-5 cursor-pointer border-l-4 border-l-primary">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <CalendarDays className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">Fitting with Nana Ama Couture</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Tomorrow, 2:00 PM · East Legon, Accra</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Trending styles — real grid, not a horizontal scroller */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Trending Styles</h2>
            <button onClick={() => navigate("/style-library")} className="text-xs text-primary font-medium flex items-center gap-1">
              See All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {trendingStyles.map((s, i) => (
              <motion.div key={s.title} initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.5, ease }}
                whileHover={{ y: -4 }} onClick={() => navigate("/style-library")}
                className="cursor-pointer group">
                <div className="relative h-64 rounded-2xl overflow-hidden">
                  <img src={s.img} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-sm font-semibold text-foreground">{s.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">❤️ {s.likes}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recommended designers — real grid */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Recommended for You</h2>
            <button onClick={() => navigate("/discover")} className="text-xs text-primary font-medium flex items-center gap-1">
              See All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-5">
            {recommended.map((d, i) => (
              <motion.div key={d.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.5, ease }}
                whileHover={{ y: -5 }} onClick={() => navigate(`/designer/${d.id}`)}
                className="solid-panel overflow-hidden cursor-pointer group">
                <div className="relative h-52">
                  <img src={d.preview} alt={d.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                  <div className="absolute top-4 right-4">
                    <span className="text-[10px] font-bold px-2.5 py-1.5 rounded-full solid-panel text-primary">From {d.price}</span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2.5">
                      <img src={d.avatar} alt={d.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/30" />
                      <div>
                        <p className="text-sm font-bold text-foreground">{d.name}</p>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-primary fill-primary" />
                          <span className="text-[11px] font-medium text-foreground">{d.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{d.specialty}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[11px] text-muted-foreground">{d.location}</span>
                    </div>
                  </div>
                  <motion.button whileTap={{ scale: 0.94 }}
                    onClick={(e) => { e.stopPropagation(); navigate(`/designer/${d.id}`); }}
                    className="text-xs font-bold text-primary-foreground bg-primary px-4 py-2 rounded-full">
                    Book Now
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ClientHomeWorkspace;
