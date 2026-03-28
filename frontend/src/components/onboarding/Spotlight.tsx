import React from "react";
import { motion } from "framer-motion";

interface SpotlightProps {
  targetRect: DOMRect | null;
  isOpen: boolean;
}

const Spotlight = ({ targetRect, isOpen }: SpotlightProps) => {
  if (!isOpen) return null;

  // Mask dimensions: viewport size
  const width = window.innerWidth;
  const height = window.innerHeight;

  // Spotlight coordinates and size based on targetRect
  const x = targetRect ? targetRect.left - 8 : 0;
  const y = targetRect ? targetRect.top - 8 : 0;
  const w = targetRect ? targetRect.width + 16 : 0;
  const h = targetRect ? targetRect.height + 16 : 0;
  const r = 12; // Rounded corner for the spotlight

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[998] pointer-events-none"
    >
      <svg width="100%" height="100%" className="absolute inset-0">
        <defs>
          <mask id="spotlight-mask">
            {/* White covers the entire screen (masking it) */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black 'cuts' into the mask (creating the spotlight) */}
            <motion.rect
              animate={{
                x,
                y,
                width: w,
                height: h,
                rx: r,
                ry: r,
              }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              fill="black"
            />
          </mask>
        </defs>
        {/* The backdrop: semi-transparent black with the mask applied */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.7)"
          mask="url(#spotlight-mask)"
        />
      </svg>
    </motion.div>
  );
};

export default Spotlight;
