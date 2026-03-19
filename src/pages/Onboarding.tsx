import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/onboarding-hero.jpg";

const Onboarding = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Full-screen Hero Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Fashion designer at work"
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay — heavier at bottom for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      </div>

      {/* Content pinned to bottom */}
      <div className="relative z-10 flex-1 flex flex-col justify-end pb-10 px-6">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-5"
        >
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <span className="text-primary-foreground font-extrabold text-sm tracking-widest">FOS</span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-extrabold text-foreground leading-tight">
            Your Fashion{"\n"}Business,{" "}
            <span className="text-gradient-gold">Simplified</span>
          </h1>
        </motion.div>

        {/* Page indicator dots */}
        <div className="flex justify-center gap-2 mb-8">
          <div className="w-6 h-2 rounded-full bg-foreground" />
          <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
          <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
        </div>

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/")}
          className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base tracking-wide"
        >
          Get Started
        </motion.button>
      </div>
    </div>
  );
};

export default Onboarding;
