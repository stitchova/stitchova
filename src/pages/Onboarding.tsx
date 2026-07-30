import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import heroImage from "@/assets/onboarding-hero.jpg";
import slide2Image from "@/assets/onboarding-slide2.jpg";
import slide3Image from "@/assets/onboarding-slide3.jpg";
import Logo from "@/components/Logo";
import { useRole } from "@/contexts/RoleContext";
import { useLock } from "@/contexts/LockContext";

const slides = [
  {
    image: heroImage,
    title: "Your Fashion Business,",
    highlight: "Simplified",
    alt: "Fashion designer at work",
  },
  {
    image: slide2Image,
    title: "Manage Clients &",
    highlight: "Orders Seamlessly",
    alt: "Designer measuring fabric on mannequin",
  },
  {
    image: slide3Image,
    title: "Track Payments &",
    highlight: "Grow Revenue",
    alt: "Hands sewing luxurious fabric",
  },
];

const AUTO_ADVANCE_MS = 4000;

const Onboarding = () => {
  const navigate = useNavigate();
  const { role } = useRole();
  const { hasPasscode } = useLock();
  const [current, setCurrent] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, dragFree: false });

  useEffect(() => {
    if (localStorage.getItem("fashionos-authenticated") !== "1") {
      navigate("/auth", { replace: true });
    }
  }, [navigate]);

  const home = role === "designer" ? "/" : role === "client" ? "/client-home" : "/worker-dashboard";

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
      <div ref={emblaRef} className="absolute inset-0 overflow-hidden">
        <div className="flex h-full">
          {slides.map((slide, i) => (
            <div key={i} className="min-w-0 shrink-0 grow-0 basis-full h-full relative">
              <img
                src={slide.image}
                alt={slide.alt}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-end pb-10 px-6">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-5"
        >
          <Logo size={72} />
        </motion.div>

        {/* Headline — animates on slide change */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-extrabold text-foreground leading-tight">
              {slides[current].title}{" "}
              <span className="text-gradient-gold">{slides[current].highlight}</span>
            </h1>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? "w-6 bg-foreground" : "w-2 bg-muted-foreground/40"
              }`}
            />
          ))}
        </div>

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            if (isLast) {
              localStorage.setItem("fashionos-onboarded", "1");
              if (hasPasscode) {
                navigate(home, { replace: true });
              } else {
                navigate("/set-passcode", { state: { next: home }, replace: true });
              }
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
