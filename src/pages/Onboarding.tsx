import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/onboarding-hero.jpg";

const Onboarding = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Hero Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Fashion designer at work"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-end pb-12 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-lg font-semibold text-primary tracking-wider mb-3">
            FashionOS
          </h1>
          <h2 className="text-3xl font-bold text-foreground leading-tight mb-3">
            Your Fashion Business,{" "}
            <span className="text-gradient-gold">Simplified</span>
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Manage clients, orders, measurements & payments — all in one place.
          </p>
        </motion.div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mb-8">
          <div className="w-6 h-1.5 rounded-full bg-primary" />
          <div className="w-1.5 h-1.5 rounded-full bg-muted" />
          <div className="w-1.5 h-1.5 rounded-full bg-muted" />
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/")}
          className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-base"
        >
          Get Started
        </motion.button>
      </div>
    </div>
  );
};

export default Onboarding;
