import { useState, useEffect } from "react";
import {
  Upload,
  Mic,
  Activity,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  FileSearch,
  CheckCircle2,
  AlertTriangle,
  SlidersHorizontal,
  FileClock
} from "lucide-react";
import ScreenHeader from "./ScreenHeader";
import VoiceButton from "./VoiceButton";
import type { Lang } from "@/pages/Index";

interface LoanDecoderProps {
  onBack: () => void;
  lang: Lang;
}

type Mode = "selection" | "pre_input" | "pre_result" | "post_input" | "post_result" | "loading";

const content = {
  en: {
    title: "Loan Assistant",
    subtitle: "How can we help you today?",
    preAppCard: "Check Approval Chances",
    preAppDesc: "Forecast before applying",
    postAppCard: "Understand Rejection",
    postAppDesc: "Fix a rejected loan",

    // Pre Input
    incomeLabel: "Income (Annual ₹)",
    landLabel: "Land (Acres)",
    loanLabel: "Loan Amount (₹)",
    checkChances: "Predict Chances",

    // Post Input
    uploadDoc: "Upload Notice / SMS",
    voicePrompt: "Or tap mic: 'Mera loan reject ho gaya...'",
    analyzeRej: "Analyze Rejection",

    // Loading
    processing: "AI is analyzing...",

    // Pre Result
    chanceHeader: "Approval Chance",
    moderate: "Moderate Chance",
    why: "Why?",
    preWhyText: "Credit score is slightly low, Loan amount is moderately high.",
    improve: "How to Improve",
    improve1: "Increase credit score tracking",
    improve2: "Reduce loan amount by ₹20k",
    simTitle: "Simulation: If amount is lower",
    simRes: "Chance goes up to 85%",

    // Post Result
    status: "Loan Rejected",
    rootCause: "Root Cause",
    causeText: "Low Credit Score (Delayed payments history)",
    fixPlan: "Fix Plan",
    fix1: "Clear pending loans",
    fix2: "Improve repayment history",
    reapply: "Reapply Strategy",
    reapplyText: "Wait 2 months and reapply.",
  },
  hi: {
    title: "लोन सहायक",
    subtitle: "आज हम आपकी कैसे मदद कर सकते हैं?",
    preAppCard: "मंजूरी की संभावना जांचें",
    preAppDesc: "आवेदन से पहले अनुमान",
    postAppCard: "अस्वीकृति को समझें",
    postAppDesc: "खारिज लोन को ठीक करें",

    incomeLabel: "आय (वार्षिक ₹)",
    landLabel: "जमीन (एकड़)",
    loanLabel: "लोन राशि (₹)",
    checkChances: "संभावना जांचें",

    uploadDoc: "नोटिस / SMS अपलोड करें",
    voicePrompt: "या माइक दबाएं: 'मेरा लोन रिजेक्ट हो गया...'",
    analyzeRej: "कारण का विश्लेषण करें",

    processing: "AI विश्लेषण कर रहा है...",

    chanceHeader: "मंजूरी की संभावना",
    moderate: "मध्यम संभावना",
    why: "क्यों?",
    preWhyText: "क्रेडिट स्कोर थोड़ा कम है, लोन राशि अधिक है।",
    improve: "कैसे सुधारें",
    improve1: "क्रेडिट स्कोर ट्रैकिंग बढ़ाएं",
    improve2: "लोन राशि ₹20k कम करें",
    simTitle: "सिमुलेशन: यदि राशि कम हो",
    simRes: "संभावना 85% तक बढ़ जाती है",

    status: "लोन अस्वीकृत",
    rootCause: "मूल कारण",
    causeText: "कम क्रेडिट स्कोर (भुगतान में देरी का इतिहास)",
    fixPlan: "सुधार योजना",
    fix1: "लंबित लोन चुकाएं",
    fix2: "भुगतान इतिहास सुधारें",
    reapply: "पुनः आवेदन रणनीति",
    reapplyText: "2 महीने रुकें और फिर आवेदन करें।",
  },
};

const LoanDecoder = ({ onBack, lang }: LoanDecoderProps) => {
  const [mode, setMode] = useState<Mode>("selection");
  const [nextMode, setNextMode] = useState<Mode>("selection");
  
  // Pre-flow inputs
  const [valIncome, setValIncome] = useState(80000);
  const [valLand, setValLand] = useState(2);
  const [valLoan, setValLoan] = useState(150000);

  const t = content[lang] || content.en;

  const handleProcess = (target: Mode) => {
    setMode("loading");
    setNextMode(target);
    setTimeout(() => {
      setMode(target);
    }, 1500);
  };

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* If drilling down into inputs, show a local back button */}
      {mode !== "selection" && mode !== "loading" && (
        <button onClick={() => {
          if (mode === "pre_input" || mode === "post_input") setMode("selection");
          else if (mode === "pre_result") setMode("pre_input");
          else if (mode === "post_result") setMode("post_input");
        }} className="mb-4 text-sm font-bold text-gray-500 hover:text-gray-900 border p-2 bg-white flex items-center gap-2 w-fit">
          ← Back
        </button>
      )}

      <div className="px-5 mt-6">
        {mode === "loading" && (
          <div className="flex flex-col items-center justify-center py-32" style={{ animation: "slide-up-fade 0.3s ease-out forwards" }}>
            <Activity className="w-16 h-16 text-primary animate-pulse mb-6" />
            <p className="font-mukta font-bold text-xl text-foreground">{t.processing}</p>
          </div>
        )}

        {mode === "selection" && (
          <div className="space-y-4" style={{ animation: "slide-up-fade 0.3s ease-out forwards" }}>
            <button
              onClick={() => setMode("pre_input")}
              className="w-full bg-white border-2 border-primary/20 hover:border-primary rounded-none p-6 text-left shadow-sm active:scale-[0.98] transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary/10 rounded-none flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <FileSearch className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-lg font-mukta text-foreground">{t.preAppCard}</h3>
                  <p className="text-sm font-hind text-muted-foreground">{t.preAppDesc}</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-primary" />
            </button>

            <button
              onClick={() => setMode("post_input")}
              className="w-full bg-white border-2 border-orange-200 hover:border-orange-500 rounded-none p-6 text-left shadow-sm active:scale-[0.98] transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-orange-50 rounded-none flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <HelpCircle className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-lg font-mukta text-foreground">{t.postAppCard}</h3>
                  <p className="text-sm font-hind text-muted-foreground">{t.postAppDesc}</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-orange-500" />
            </button>
          </div>
        )}

        {mode === "pre_input" && (
          <div className="space-y-6" style={{ animation: "slide-up-fade 0.3s ease-out forwards" }}>
            <div className="bg-white p-5 rounded-none border shadow-sm space-y-5">
              <div>
                <label className="text-sm font-bold font-mukta text-gray-700">{t.incomeLabel}</label>
                <input
                  type="range"
                  min="20000"
                  max="500000"
                  step="10000"
                  value={valIncome}
                  onChange={(e) => setValIncome(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-none appearance-none cursor-pointer accent-primary mt-3"
                />
                <div className="text-right text-primary font-bold mt-1">₹{valIncome.toLocaleString()}</div>
              </div>

              <div>
                <label className="text-sm font-bold font-mukta text-gray-700">{t.landLabel}</label>
                <input
                  type="range"
                  min="0.5"
                  max="20"
                  step="0.5"
                  value={valLand}
                  onChange={(e) => setValLand(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-none appearance-none cursor-pointer accent-primary mt-3"
                />
                <div className="text-right text-primary font-bold mt-1">{valLand} Acres</div>
              </div>

              <div>
                <label className="text-sm font-bold font-mukta text-gray-700">{t.loanLabel}</label>
                <input
                  type="range"
                  min="10000"
                  max="1000000"
                  step="10000"
                  value={valLoan}
                  onChange={(e) => setValLoan(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-none appearance-none cursor-pointer accent-primary mt-3"
                />
                <div className="text-right text-primary font-bold mt-1">₹{valLoan.toLocaleString()}</div>
              </div>
            </div>

            <button
              onClick={() => handleProcess("pre_result")}
              className="w-full py-4 rounded-none shadow-sm bg-primary text-white font-bold font-mukta text-lg active:scale-95 transition-transform"
            >
              {t.checkChances}
            </button>
          </div>
        )}

        {mode === "pre_result" && (
          <div className="space-y-5" style={{ animation: "slide-up-fade 0.3s ease-out forwards" }}>
            {/* Meter */}
            <div className="bg-white rounded-none p-6 border shadow-sm text-center relative overflow-hidden">
               <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t.chanceHeader}</h3>
               <div className="text-6xl font-bold text-yellow-500 font-mukta my-2">72%</div>
               <div className="inline-flex items-center gap-2 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-none text-sm font-bold mt-2">
                 <AlertTriangle className="w-4 h-4" /> {t.moderate}
               </div>
            </div>

            {/* Why & Improve */}
            <div className="bg-white rounded-none p-5 border shadow-sm">
               <h3 className="font-bold font-mukta text-gray-400 text-xs tracking-widest uppercase mb-3">{t.why}</h3>
               <p className="font-hind text-foreground text-sm font-bold">{t.preWhyText}</p>
               
               <div className="w-full h-px bg-gray-100 my-4" />
               
               <h3 className="font-bold font-mukta text-gray-400 text-xs tracking-widest uppercase mb-3">{t.improve}</h3>
               <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm font-hind text-gray-700">
                     <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> {t.improve1}
                  </li>
                  <li className="flex items-center gap-2 text-sm font-hind text-gray-700">
                     <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> {t.improve2}
                  </li>
               </ul>
            </div>

            {/* Simulation */}
            <div className="bg-primary/5 rounded-none p-5 border border-primary/20 shadow-sm">
               <div className="flex items-center gap-2 mb-3">
                 <SlidersHorizontal className="w-5 h-5 text-primary" />
                 <h3 className="font-bold font-mukta text-primary text-sm uppercase tracking-wider">{t.simTitle}</h3>
               </div>
               <p className="text-sm font-hind font-bold text-primary-foreground" style={{color: 'var(--primary)'}}>{t.simRes}</p>
            </div>
          </div>
        )}

        {mode === "post_input" && (
          <div className="space-y-6" style={{ animation: "slide-up-fade 0.3s ease-out forwards" }}>
             <div className="bg-white p-8 rounded-none border border-dashed border-gray-300 flex flex-col items-center justify-center text-center shadow-sm">
               <Upload className="w-12 h-12 text-gray-300 mb-4" />
               <p className="font-mukta font-bold text-gray-600">{t.uploadDoc}</p>
             </div>

             <div className="flex items-center gap-4">
                <div className="h-px bg-gray-200 flex-1" />
                <span className="text-xs font-bold text-gray-400 uppercase">OR</span>
                <div className="h-px bg-gray-200 flex-1" />
             </div>

             <div className="bg-orange-50 p-6 rounded-none border border-orange-100 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
               <VoiceButton size="lg" />
               <p className="mt-4 font-hind font-bold text-orange-700/80 text-sm max-w-[200px]">{t.voicePrompt}</p>
             </div>

             <button
              onClick={() => handleProcess("post_result")}
              className="w-full py-4 rounded-none shadow-sm bg-orange-500 text-white font-bold font-mukta text-lg active:scale-95 transition-transform"
            >
              {t.analyzeRej}
            </button>
          </div>
        )}

        {mode === "post_result" && (
          <div className="space-y-5" style={{ animation: "slide-up-fade 0.3s ease-out forwards" }}>
             {/* Status Header */}
             <div className="bg-red-50 border border-red-200 rounded-none p-5 flex items-center gap-4 shadow-sm">
               <div className="w-12 h-12 bg-red-100 text-red-500 rounded-none flex items-center justify-center flex-shrink-0">
                 <ShieldAlert className="w-6 h-6" />
               </div>
               <div>
                  <h2 className="text-xl font-bold font-mukta text-red-600">{t.status}</h2>
               </div>
             </div>

             {/* Root Cause */}
             <div className="bg-white rounded-none p-5 border shadow-sm">
               <h3 className="font-bold font-mukta text-gray-400 text-xs tracking-widest uppercase mb-2">{t.rootCause}</h3>
               <p className="font-hind text-foreground text-sm font-bold">{t.causeText}</p>
             </div>

             {/* Fix Plan */}
             <div className="bg-white rounded-none p-5 border shadow-sm">
               <h3 className="font-bold font-mukta text-gray-400 text-xs tracking-widest uppercase mb-3">{t.fixPlan}</h3>
               <ul className="space-y-3">
                  <li className="flex gap-3">
                    <div className="w-6 h-6 rounded-none bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-bold">1</span></div>
                    <span className="text-sm font-hind text-gray-700 font-bold">{t.fix1}</span>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-6 h-6 rounded-none bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-bold">2</span></div>
                    <span className="text-sm font-hind text-gray-700 font-bold">{t.fix2}</span>
                  </li>
               </ul>
             </div>

             {/* Reapply */}
             <div className="bg-blue-50 border border-blue-100 rounded-none p-5 flex items-center gap-4 shadow-sm">
               <div className="w-10 h-10 bg-blue-100 text-blue-500 rounded-none flex items-center justify-center flex-shrink-0">
                 <FileClock className="w-5 h-5" />
               </div>
               <div>
                  <h3 className="font-bold font-mukta text-blue-800 text-sm uppercase tracking-wider">{t.reapply}</h3>
                  <p className="text-blue-700 text-sm font-bold font-hind">{t.reapplyText}</p>
               </div>
             </div>
          </div>
        )}
      </div>

      {(mode === "pre_input" || mode === "post_input") && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <div className="bg-card/95 backdrop-blur-md rounded-none px-5 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-border/50 flex items-center gap-3">
            <VoiceButton size="sm" />
            <span className="text-sm font-hind font-bold text-primary cursor-pointer hover:underline">Ask by voice</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanDecoder;
