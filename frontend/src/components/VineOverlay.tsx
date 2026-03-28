import { motion } from "framer-motion";
import { memo } from "react";

const VineOverlay = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-40">
      
      {/* Top Left Vine */}
      <motion.svg 
        className="absolute -top-10 -left-10 w-64 h-64 text-[#437a3c]"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={{ rotate: [-2, 2, -2], transformOrigin: "top left" }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M0,0 C50,20 80,60 60,120 C50,150 20,180 -20,200" stroke="currentColor" strokeWidth="4" strokeLinecap="square" />
        {/* Leaves */}
        <motion.path d="M30,30 C50,10 70,30 50,50 C30,70 10,50 30,30 Z" fill="currentColor" animate={{ scale: [0.95, 1.05, 0.95] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }} />
        <motion.path d="M70,80 C100,60 110,90 80,110 C50,130 40,100 70,80 Z" fill="currentColor" animate={{ scale: [0.95, 1.05, 0.95] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} />
        <motion.path d="M40,140 C70,130 70,160 40,170 C10,180 10,150 40,140 Z" fill="currentColor" animate={{ scale: [0.95, 1.05, 0.95] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }} />
      </motion.svg>

      {/* Top Right Vine */}
      <motion.svg 
        className="absolute -top-10 -right-10 w-72 h-72 text-[#437a3c]"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={{ rotate: [2, -2, 2], transformOrigin: "top right" }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <path d="M200,0 C150,30 120,60 140,120 C150,150 180,180 220,200" stroke="currentColor" strokeWidth="6" strokeLinecap="square" />
        {/* Leaves */}
        <motion.path d="M170,40 C150,20 130,40 150,60 C170,80 190,60 170,40 Z" fill="currentColor" animate={{ scale: [0.95, 1.05, 0.95] }} transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} />
        <motion.path d="M130,100 C100,80 90,110 120,130 C150,150 160,120 130,100 Z" fill="currentColor" animate={{ scale: [0.95, 1.05, 0.95] }} transition={{ duration: 4.7, repeat: Infinity, ease: "easeInOut", delay: 1.5 }} />
      </motion.svg>

      {/* Bottom Left Branch */}
      <motion.svg 
        className="absolute -bottom-20 -left-10 w-80 h-80 text-[#8b9a46]"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={{ rotate: [-3, 3, -3], transformOrigin: "bottom left" }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        <path d="M0,200 C50,180 80,140 60,80 C50,50 20,20 -20,0" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
        <motion.path d="M40,160 C60,180 80,160 60,140 C40,120 20,140 40,160 Z" fill="currentColor" animate={{ scale: [0.9, 1.1, 0.9] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }} />
        <motion.path d="M70,100 C100,120 110,90 80,70 C50,50 40,80 70,100 Z" fill="currentColor" animate={{ scale: [0.9, 1.1, 0.9] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} />
      </motion.svg>

    </div>
  );
};

export default memo(VineOverlay);
