import { ReactNode } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

/**
 * Wraps each route with a smooth fade + subtle slide transition.
 * Used inside <AnimatePresence mode="wait"> in App.tsx.
 */
const PageTransition = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;