import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, ChevronRight, Star, MapPin, ShoppingBag, CalendarDays, Compass, Clock, Sparkles } from "lucide-react";

import designerAvatar1 from "@/assets/designer-avatar-1.jpg";
import designerAvatar2 from "@/assets/designer-avatar-2.jpg";
import designerAvatar3 from "@/assets/designer-avatar-3.jpg";
import portfolio1 from "@/assets/designer-portfolio-1.jpg";
import portfolio2 from "@/assets/designer-portfolio-2.jpg";
import portfolio3 from "@/assets/designer-portfolio-3.jpg";
import portfolio4 from "@/assets/designer-portfolio-4.jpg";
import ClientHomeWorkspace from "@/components/client-desktop/ClientHomeWorkspace";

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

const activeOrders = [
  { type: "Wedding Gown", designer: "Nana Ama Couture", designerId: "nana-ama", avatar: designerAvatar1, status: "Sewing", progress: 65, date: "Mar 28", statusColor: "bg-status-sewing" },
  { type: "3-Piece Suit", designer: "Kwame Styles", designerId: "kwame-styles", avatar: designerAvatar2, status: "Cutting", progress: 30, date: "Apr 5", statusColor: "bg-status-cutting" },
];

const recommended = [
  { name: "Nana Ama Couture", avatar: designerAvatar1, specialty: "Bridal & Evening Wear", rating: 4.9, location: "Accra", preview: portfolio1, id: "nana-ama", price: "GHS 2,500" },
  { name: "Kwame Styles", avatar: designerAvatar2, specialty: "Traditional & Agbada", rating: 4.7, location: "Kumasi", preview: portfolio2, id: "kwame-styles", price: "GHS 1,800" },
  { name: "Efya Designs", avatar: designerAvatar3, specialty: "Contemporary African", rating: 4.8, location: "Tema", preview: portfolio4, id: "efya-designs", price: "GHS 1,200" },
];

const trendingStyles = [
  { img: portfolio1, title: "Kente Bridal", likes: 342 },
  { img: portfolio3, title: "Modern Agbada", likes: 218 },
  { img: portfolio4, title: "Evening Glam", likes: 189 },
  { img: portfolio2, title: "Corporate Chic", likes: 156 },
];

const quickActions = [
  { icon: Compass, label: "Discover", path: "/discover", gradient: "from-primary/20 to-primary/5" },
  { icon: CalendarDays, label: "Appointments", path: "/appointments", gradient: "from-accent/20 to-accent/5" },
  { icon: ShoppingBag, label: "My Orders", path: "/client-orders", gradient: "from-primary/20 to-primary/5" },
];

const ClientHome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("fashionos-authenticated") !== "1") {
      navigate("/auth", { replace: true });
    }
  }, [navigate]);

  const heroSlides = [
    { img: portfolio1, tag: "New Season", title: "Spring Collection", subtitle: "is Here" },
    { img: portfolio3, tag: "Trending", title: "Modern Agbada", subtitle: "Reimagined" },
    { img: portfolio4, tag: "Editor's Pick", title: "Evening Glam", subtitle: "For Every Occasion" },
    { img: portfolio2, tag: "Bespoke", title: "Corporate Chic", subtitle: "Tailored For You" },
  ];
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % heroSlides.length), 4000);
    return () => clearInterval(id);
  }, [heroSlides.length]);
  const current = heroSlides[slide];

  return (
    <>
      {/* Tablet/desktop workspace */}
      <ClientHomeWorkspace />

      {/* Mobile view (unchanged) */}
      <div className="min-h-screen bg-background pb-24 lg:hidden">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => navigate("/profile")}
            className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center ring-2 ring-primary/20"
          >
            <span className="text-sm font-bold text-foreground">AK</span>
          </motion.button>
          <div>
            <span className="text-base font-bold text-foreground">{getGreeting()}, <span className="shimmer-text">Akua</span> ✨</span>
            <p className="text-xs text-muted-foreground">Find your perfect designer</p>
          </div>
        </div>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate("/client-orders")} className="w-10 h-10 rounded-full glass-card flex items-center justify-center relative">
          <Bell className="w-5 h-5 text-foreground" />
          <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-primary pulse-glow" />
        </motion.button>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="px-5 space-y-6">
        {/* Hero Banner */}
        <motion.div variants={fadeUp}>
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/discover")}
            className="relative h-40 rounded-2xl overflow-hidden cursor-pointer"
          >
            <AnimatePresence mode="sync">
              <motion.img
                key={`img-${slide}`}
                src={current.img}
                alt={current.title}
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 1.2, ease }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center px-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`txt-${slide}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.5, ease }}
                >
                  <p className="text-[10px] uppercase tracking-widest text-primary font-semibold">{current.tag}</p>
                  <h2 className="text-lg font-bold text-foreground mt-1">{current.title}<br />{current.subtitle}</h2>
                </motion.div>
              </AnimatePresence>
              <motion.div
                className="mt-3 flex items-center gap-2 text-xs font-semibold text-primary"
                whileHover={{ x: 4 }}
              >
                <Sparkles className="w-3.5 h-3.5" /> Explore Now <ChevronRight className="w-3.5 h-3.5" />
              </motion.div>
            </div>
            {/* Slide indicators */}
            <div className="absolute bottom-2.5 right-3 flex items-center gap-1.5">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setSlide(i); }}
                  className={`h-1 rounded-full transition-all duration-300 ${i === slide ? "w-5 bg-primary" : "w-1.5 bg-foreground/30"}`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Search */}
        <motion.div variants={fadeUp}>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/discover")}
            className="w-full flex items-center gap-3 glass-input px-4 py-3.5"
          >
            <Search className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Search designers, styles…</span>
          </motion.button>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={fadeUp}>
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map((a) => (
              <motion.button
                key={a.label}
                whileTap={{ scale: 0.93 }}
                whileHover={{ y: -2 }}
                onClick={() => navigate(a.path)}
                className="glass-card p-4 flex flex-col items-center gap-2.5 relative overflow-hidden group"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${a.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <a.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-[10px] font-semibold text-muted-foreground">{a.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Active Orders */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-foreground">Active Orders</h2>
            <button onClick={() => navigate("/client-orders")} className="text-xs text-primary font-medium flex items-center gap-1">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {activeOrders.map((o, i) => (
              <motion.div
                key={o.type}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.5, ease }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/designer/${o.designerId}`)}
                className="glass-card p-4 cursor-pointer flex items-center gap-4"
              >
                {/* Progress Ring */}
                <div className="relative w-14 h-14 flex-shrink-0">
                  <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r="24" fill="none" stroke="hsl(var(--secondary))" strokeWidth="4" />
                    <motion.circle
                      cx="28" cy="28" r="24" fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={150.8}
                      initial={{ strokeDashoffset: 150.8 }}
                      animate={{ strokeDashoffset: 150.8 - (150.8 * o.progress / 100) }}
                      transition={{ duration: 1.2, ease, delay: 0.5 + i * 0.15 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img src={o.avatar} alt={o.designer} className="w-9 h-9 rounded-full object-cover" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground truncate">{o.type}</p>
                    <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full ${o.statusColor} text-primary-foreground`}>
                      {o.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{o.designer}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span className="text-[10px]">Due: {o.date}</span>
                    </div>
                    <span className="text-xs font-bold text-primary">{o.progress}%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Appointment */}
        <motion.div variants={fadeUp}>
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/appointments")}
            className="glass-card p-4 cursor-pointer border-l-2 border-l-primary"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-foreground">Fitting with Nana Ama Couture</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Tomorrow, 2:00 PM · East Legon, Accra</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </motion.div>
        </motion.div>

        {/* Trending Styles */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-foreground">Trending Styles</h2>
            <button onClick={() => navigate("/style-library")} className="text-xs text-primary font-medium flex items-center gap-1">
              See All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-5 px-5">
            {trendingStyles.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.08, duration: 0.5, ease }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/style-library")}
                className="min-w-[140px] flex-shrink-0 cursor-pointer group"
              >
                <div className="relative h-44 rounded-2xl overflow-hidden">
                  <img src={s.img} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-xs font-semibold text-foreground">{s.title}</p>
                    <p className="text-[9px] text-muted-foreground">❤️ {s.likes}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recommended Designers */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-foreground">Recommended for You</h2>
            <button onClick={() => navigate("/discover")} className="text-xs text-primary font-medium flex items-center gap-1">
              See All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-5 px-5">
            {recommended.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.5, ease }}
                whileTap={{ scale: 0.96 }}
                whileHover={{ y: -4 }}
                onClick={() => navigate(`/designer/${d.id}`)}
                className="glass-card min-w-[220px] overflow-hidden flex-shrink-0 cursor-pointer group"
              >
                <div className="relative h-40">
                  <img src={d.preview} alt={d.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                  <div className="absolute top-3 right-3">
                    <span className="text-[9px] font-bold px-2 py-1 rounded-full glass-card text-primary">From {d.price}</span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center gap-2">
                      <img src={d.avatar} alt={d.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/30" />
                      <div>
                        <p className="text-xs font-bold text-foreground">{d.name}</p>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-primary fill-primary" />
                          <span className="text-[10px] font-medium text-foreground">{d.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground">{d.specialty}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[9px] text-muted-foreground">{d.location}</span>
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); navigate(`/designer/${d.id}`); }}
                    className="text-[10px] font-bold text-primary-foreground bg-primary px-3 py-1.5 rounded-full"
                  >
                    Book Now
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
      </div>
    </>
  );
};

export default ClientHome;
