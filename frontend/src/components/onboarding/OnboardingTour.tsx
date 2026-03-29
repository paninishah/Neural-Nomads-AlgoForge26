import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import Spotlight from "./Spotlight";
import GuidedTooltip from "./GuidedTooltip";
import SunlightParticles from "./SunlightParticles";
import { authApi } from "@/api/client";
import { X } from "lucide-react";

interface OnboardingTourProps {
  onComplete: () => void;
}

const OnboardingTour = ({ onComplete }: OnboardingTourProps) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(-1); // -1 for cinematic welcome
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Define steps and their corresponding selectors
  const steps = [
    { id: "tour-mandi",   title: t("onboarding.mandiTitle"),   desc: t("onboarding.mandiDesc") },
    { id: "tour-fraud",   title: t("onboarding.fraudTitle"),   desc: t("onboarding.fraudDesc") },
    { id: "tour-loan",    title: t("onboarding.loanTitle"),    desc: t("onboarding.loanDesc") },
    { id: "tour-weather", title: t("onboarding.weatherTitle"), desc: t("onboarding.weatherDesc") },
    { id: "tour-ai",      title: t("onboarding.aiTitle"),      desc: t("onboarding.aiDesc") },
  ];

  const totalSteps = steps.length;

  const updateTargetRect = useCallback(() => {
    if (step < 0 || step >= totalSteps) {
      setTargetRect(null);
      return;
    }
    const el = document.getElementById(steps[step].id);
    if (el) {
      setTargetRect(el.getBoundingClientRect());
    } else {
      setTargetRect(null);
    }
  }, [step, steps]);

  useEffect(() => {
    updateTargetRect();
    window.addEventListener("resize", updateTargetRect);
    window.addEventListener("scroll", updateTargetRect);
    return () => {
      window.removeEventListener("resize", updateTargetRect);
      window.removeEventListener("scroll", updateTargetRect);
    };
  }, [updateTargetRect]);

  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utance = new SpeechSynthesisUtterance(text);
      utance.rate = 0.9;
      window.speechSynthesis.speak(utance);
    }
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      finishTour();
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const finishTour = async () => {
    try {
      await authApi.completeOnboarding();
    } catch (e) {
      console.error("Failed to mark onboarding as complete", e);
    }
    onComplete();
  };

  const handleSkip = () => {
    finishTour();
  };

  // TTS Narrator
  useEffect(() => {
    if (step >= 0 && step < totalSteps) {
      speak(`${steps[step].title}. ${steps[step].desc}`);
    }
  }, [step]);

  return (
    <div className="fixed inset-0 z-[1000] pointer-events-none">
       <SunlightParticles />
       <AnimatePresence>
         {step < totalSteps && (
            <Spotlight targetRect={targetRect} isOpen={step >= 0} />
         )}
       </AnimatePresence>

       <AnimatePresence mode="wait">
         {/* Welcome Intro */}
         {step === -1 && (
           <motion.div 
             key="welcome"
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 1.1 }}
             className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/40 backdrop-blur-md pointer-events-auto"
           >
             <div className="bg-white p-12 max-w-lg text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-[#408447]" />
                
                {/* Top-right close button */}
                <button 
                  onClick={handleSkip}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-all"
                >
                  <X className="w-5 h-5" />
                </button>

                <h2 className="text-4xl font-mukta font-bold text-[#1a1a1a] mb-4">
                  {t("onboarding.welcomeTitle")}
                </h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  {t("onboarding.welcomeSub")}
                </p>
                <button 
                  onClick={() => setStep(0)}
                  className="px-12 py-4 bg-[#408447] text-white font-bold text-xl uppercase tracking-widest hover:bg-[#13311c] transition-all transform active:scale-95 shadow-xl shadow-[#408447]/30"
                >
                  {t("common.start")}
                </button>

                <div className="mt-6">
                  <button 
                    onClick={handleSkip}
                    className="text-sm font-bold text-gray-400 hover:text-[#408447] uppercase tracking-widest transition-colors"
                  >
                    {t("common.maybeLater")}
                  </button>
                </div>
             </div>
           </motion.div>
         )}

         {/* Guided Steps */}
         {step >= 0 && step < totalSteps && (
           <GuidedTooltip
             key={`step-${step}`}
             step={step}
             totalSteps={totalSteps}
             title={steps[step].title}
             description={steps[step].desc}
             targetRect={targetRect}
             onNext={handleNext}
             onBack={handleBack}
             onSkip={handleSkip}
             onSpeak={() => speak(`${steps[step].title}. ${steps[step].desc}`)}
           />
         )}

         {/* Completion UI */}
         {step === totalSteps && (
           <motion.div 
             key="celebrate"
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/60 backdrop-blur-xl pointer-events-auto"
           >
              <div className="text-center p-12 bg-white shadow-2xl border-t-8 border-[#408447]">
                 <div className="text-6xl mb-6 animate-bounce">🌾</div>
                 <h2 className="text-4xl font-mukta font-bold text-[#1a1a1a] mb-4">
                    {t("onboarding.readyTitle")}
                 </h2>
                 <p className="text-xl text-gray-600 mb-10">
                    {t("onboarding.readyDesc")}
                 </p>
                 <button 
                    onClick={finishTour}
                    className="px-12 py-4 bg-[#408447] text-white font-bold text-xl uppercase tracking-widest hover:bg-[#13311c] transition-all active:scale-95 shadow-xl shadow-[#408447]/30"
                 >
                    {t("onboarding.startFarming")}
                 </button>
              </div>
           </motion.div>
         )}
       </AnimatePresence>

       {/* Interactive Overlay - captures clicks during the tour */}
       {step >= 0 && step < totalSteps && (
         <div className="fixed inset-0 z-[999] pointer-events-auto bg-transparent" />
       )}
    </div>
  );
};

export default OnboardingTour;
