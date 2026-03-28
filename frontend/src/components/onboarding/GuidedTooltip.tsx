import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, X, Volume2, StepForward } from "lucide-react";
import { useTranslation } from "react-i18next";

interface GuidedTooltipProps {
  step: number;
  totalSteps: number;
  title: string;
  description: string;
  targetRect: DOMRect | null;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onSpeak: () => void;
}

const GuidedTooltip = ({ 
  step, totalSteps, title, description, targetRect, 
  onNext, onBack, onSkip, onSpeak 
}: GuidedTooltipProps) => {
  const { t } = useTranslation();

  // Position the tooltip near the targetRect
  const style: React.CSSProperties = {
    position: "fixed",
    zIndex: 1001,
    width: "300px",
    left: targetRect ? targetRect.left + targetRect.width / 2 - 150 : "50%",
    top: targetRect ? targetRect.top + targetRect.height + 20 : "50%",
    transform: targetRect ? "none" : "translate(-50%, -50%)",
  };

  // Ensure tooltip doesn't go off-screen
  if (targetRect) {
    if (style.left && typeof style.left === 'number' && style.left < 20) style.left = 20;
    if (style.left && typeof style.left === 'number' && style.left + 300 > window.innerWidth - 20) style.left = window.innerWidth - 320;
    if (style.top && typeof style.top === 'number' && style.top + 200 > window.innerHeight - 20) style.top = targetRect.top - 220;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      style={style}
      className="bg-white/90 backdrop-blur-xl border border-[#e5e3d7] p-6 shadow-2xl rounded-none relative overflow-hidden pointer-events-auto"
    >
      {/* Decorative pulse glow */}
      <div className="absolute -top-4 -right-4 w-12 h-12 bg-[#408447]/10 blur-xl animate-pulse" />
      
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#408447]">
           {t("common.step", "Step")} {step + 1} / {totalSteps}
        </span>
        <div className="flex gap-2">
          <button onClick={onSpeak} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
            <Volume2 className="w-4 h-4" />
          </button>
          <button onClick={onSkip} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <h3 className="font-mukta font-bold text-xl text-[#1a1a1a] mb-2 leading-tight">
        {title}
      </h3>
      <p className="font-hind text-sm text-[#555] leading-relaxed mb-6">
        {description}
      </p>

      <div className="flex items-center justify-between">
        <button 
          onClick={onSkip}
          className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600"
        >
          {t("common.skip")}
        </button>

        <div className="flex gap-2">
          {step > 0 && (
            <button 
              onClick={onBack}
              className="p-3 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all active:scale-90"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <button 
            onClick={onNext}
            className="flex items-center gap-2 px-6 py-3 bg-[#408447] text-white font-bold text-sm uppercase tracking-widest hover:bg-[#13311c] transition-all active:scale-95 shadow-lg shadow-[#408447]/20"
          >
            {step === totalSteps - 1 ? t("common.finish") : (
              <>
                {t("common.next")} <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default GuidedTooltip;
