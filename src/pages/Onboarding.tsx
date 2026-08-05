import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import heroVideoAsset from "@/assets/onboarding-hero.mp4.asset.json";
import heroPosterAsset from "@/assets/onboarding-hero-poster.jpg.asset.json";
import slide2Image from "@/assets/onboarding-slide2.jpg";
import slide3Image from "@/assets/onboarding-slide3.jpg";
import slide2Video from "@/assets/onboarding-slide2.mp4.asset.json";
import slide3Video from "@/assets/onboarding-slide3.mp4.asset.json";
import Logo from "@/components/Logo";
import { useRole } from "@/contexts/RoleContext";

const slides = [
  {
    video: heroVideoAsset.url,
    poster: heroPosterAsset.url,
    image: heroPosterAsset.url,
    title: "Your Fashion Business,",
    highlight: "Simplified",
    eyebrow: "Welcome",
    subtitle: "Run your atelier from one calm, beautiful place.",
    alt: "Fashion designer at work",
  },
  {
    video: slide2Video.url,
    poster: slide2Image,
    image: slide2Image,
    title: "Manage Clients &",
    highlight: "Orders Seamlessly",
    eyebrow: "Workflow",
    subtitle: "Measurements, orders and production stages — always in sync.",
    alt: "Designer measuring fabric on mannequin",
  },
  {
    video: slide3Video.url,
    poster: slide3Image,
    image: slide3Image,
    title: "Track Payments &",
    highlight: "Grow Revenue",
    eyebrow: "Growth",
    subtitle: "See what you earn, what's owed and what's next at a glance.",
    alt: "Hands sewing luxurious fabric",
  },
] as Array<{
  image: string;
  video?: string;
  poster?: string;
  title: string;
  highlight: string;
  eyebrow: string;
  subtitle: string;
  alt: string;
}>;

const AUTO_ADVANCE_MS = 4000;

const Onboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useRole();
  const [current, setCurrent] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, dragFree: false });

  useEffect(() => {
    if (localStorage.getItem("fashionos-authenticated") !== "1") {
      navigate("/auth", { replace: true });
    }
  }, [navigate]);

  const roleHome = role === "designer" ? "/" : role === "client" ? "/client-home" : "/worker-dashboard";
  const home = (location.state as { next?: string } | null)?.next || roleHome;

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrent(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  // Auto-advance
  useEffect(() => {
    if (!emblaApi) return;
    const timer = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      }
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [emblaApi]);

  const isLast = current === slides.length - 1;

  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      {/* Carousel */}
      <div ref={emblaRef} className="absolute inset-0 overflow-hidden z-0">
        <div className="flex h-full">
          {slides.map((slide, i) => (
            <div key={i} className="min-w-0 shrink-0 grow-0 basis-full h-full relative">
              {slide.video ? (
                <video
                  src={slide.video}
                  poster={slide.poster}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  aria-label={slide.alt}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={slide.image}
                  alt={slide.alt}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />
              <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-transparent to-transparent" />
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col px-6 pb-10 pt-[max(1.5rem,env(safe-area-inset-top))]">
        {/* Logo — pinned to the top so captions own the lower third */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <Logo size={56} />
        </motion.div>

        <div className="flex-1" />

        {/* Caption block — editorial, left-aligned, glass panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative mb-7 max-w-md rounded-3xl border border-border/40 bg-background/30 p-5 backdrop-blur-xl"
          >
            <span className="absolute left-0 top-6 h-8 w-1 rounded-r-full bg-primary" />
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.35 }}
              className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary"
            >
              {slides[current].eyebrow}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14, duration: 0.4 }}
              className="mt-2 text-[2rem] font-extrabold leading-[1.1] tracking-tight text-foreground"
            >
              {slides[current].title}{" "}
              <span className="text-gradient-gold">{slides[current].highlight}</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.4 }}
              className="mt-3 text-sm leading-relaxed text-muted-foreground"
            >
              {slides[current].subtitle}
            </motion.p>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex gap-2 mb-6 px-1">
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? "w-8 bg-primary" : "w-2 bg-muted-foreground/40"
              }`}
            />
          ))}
        </div>

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            if (isLast) {
              localStorage.setItem(`fashionos-onboarded-${role}`, "1");
              navigate(home, { replace: true });
            } else {
              emblaApi?.scrollNext();
            }
          }}
          className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base tracking-wide"
        >
          {isLast ? "Get Started" : "Next"}
        </motion.button>
      </div>
    </div>
  );
};

export default Onboarding;
