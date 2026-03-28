import { useState } from "react";
import { CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import ScreenHeader from "./ScreenHeader";
import VoiceButton from "./VoiceButton";
import type { Lang } from "@/pages/Index";

interface LoanDecoderProps {
  onBack: () => void;
  lang: Lang;
}

const content = {
  en: {
    title: "Loan Guidance",
    subtitle: "Understand and fix your loan application",
    appTitle: "KCC Loan Application",
    status: "Status: REJECTED",
    whyTitle: "Why was it rejected?",
    fixTitle: "Fix Plan",
    complete: "complete",
    reapply: "Reapply for Loan",
    getHelp: "Get Expert Help 📞",
    voiceCta: "Ask by voice",
    reasons: [
      { text: "Land record missing — Get from Patwari", status: "missing" },
      { text: "Credit history weak — CIBIL score 580", status: "weak" },
      { text: "Aadhaar verified", status: "ok" },
      { text: "Income proof not submitted", status: "missing" },
      { text: "Bank account linked", status: "ok" },
    ],
    steps: [
      { title: "Get Land Record", desc: "Visit Patwari office, arrange 6/12 record" },
      { title: "Fix Credit Score", desc: "Pay ₹2,000 EMI on old loan to improve CIBIL" },
      { title: "Income Certificate", desc: "Get from Tehsildar office with ID proof" },
      { title: "Reapply for KCC", desc: "Submit again in 15 days with all documents" },
    ],
  },
  hi: {
    title: "लोन मार्गदर्शन",
    subtitle: "अपने लोन आवेदन को समझें और ठीक करें",
    appTitle: "KCC लोन आवेदन",
    status: "स्थिति: अस्वीकृत",
    whyTitle: "अस्वीकार क्यों हुआ?",
    fixTitle: "सुधार योजना",
    complete: "पूर्ण",
    reapply: "लोन के लिए दोबारा आवेदन करें",
    getHelp: "विशेषज्ञ सहायता 📞",
    voiceCta: "बोलकर पूछिए",
    reasons: [
      { text: "भूमि रिकॉर्ड गायब — पटवारी से लें", status: "missing" },
      { text: "क्रेडिट हिस्ट्री कमजोर — CIBIL स्कोर 580", status: "weak" },
      { text: "आधार सत्यापित", status: "ok" },
      { text: "आय प्रमाण जमा नहीं किया", status: "missing" },
      { text: "बैंक खाता जुड़ा हुआ", status: "ok" },
    ],
    steps: [
      { title: "भूमि रिकॉर्ड प्राप्त करें", desc: "पटवारी कार्यालय जाएँ, 6/12 रिकॉर्ड बनवाएँ" },
      { title: "क्रेडिट स्कोर सुधारें", desc: "पुराने लोन की ₹2,000 EMI भरें" },
      { title: "आय प्रमाणपत्र", desc: "तहसीलदार कार्यालय से ID प्रूफ के साथ प्राप्त करें" },
      { title: "KCC के लिए दोबारा आवेदन करें", desc: "15 दिन में सभी दस्तावेजों के साथ जमा करें" },
    ],
  },
};

const LoanDecoder = ({ onBack, lang }: LoanDecoderProps) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const t = content[lang];

  const toggleStep = (i: number) => {
    setCompletedSteps(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  const progress = Math.round((completedSteps.length / t.steps.length) * 100);

  return (
    <div className="min-h-screen pb-28">
      <ScreenHeader onBack={onBack} title={t.title} icon="🏦" subtitle={t.subtitle} />

      <div className="px-5 space-y-4 mt-4">
        {/* Status Card */}
        <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-5" style={{ animation: "slide-up-fade 0.5s ease-out forwards" }}>
          <div className="flex items-center gap-3 mb-1">
            <AlertCircle className="w-6 h-6 text-destructive" />
            <div>
              <h3 className="text-base font-bold text-foreground font-mukta">{t.appTitle}</h3>
              <p className="text-xs font-bold text-destructive font-hind">{t.status}</p>
            </div>
          </div>
        </div>

        {/* Rejection Reasons */}
        <div>
          <h3 className="text-sm font-bold text-foreground font-mukta mb-3">{t.whyTitle}</h3>
          <div className="bg-card rounded-2xl border border-border/50 divide-y divide-border/50">
            {t.reasons.map((r, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5" style={{ animation: `slide-up-fade 0.4s ease-out ${i * 0.08}s forwards`, opacity: 0 }}>
                {r.status === "ok" ? (
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                )}
                <span className="text-sm text-foreground font-hind">{r.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fix Plan */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-foreground font-mukta">{t.fixTitle}</h3>
            <span className="text-xs font-bold text-primary font-hind">{progress}% {t.complete}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <div className="space-y-3">
            {t.steps.map((step, i) => {
              const done = completedSteps.includes(i);
              return (
                <button
                  key={i}
                  onClick={() => toggleStep(i)}
                  className={`w-full text-left rounded-2xl p-4 border transition-all active:scale-[0.98] ${done ? "bg-primary/5 border-primary/30" : "bg-card border-border/50"}`}
                  style={{ animation: `slide-up-fade 0.4s ease-out ${i * 0.1}s forwards`, opacity: 0 }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${done ? "bg-primary" : "bg-muted"}`}>
                      {done ? <CheckCircle2 className="w-4 h-4 text-primary-foreground" /> : <span className="text-xs font-bold text-foreground font-mukta">{i + 1}</span>}
                    </div>
                    <div>
                      <p className={`text-sm font-bold font-mukta ${done ? "text-primary line-through" : "text-foreground"}`}>{step.title}</p>
                      <p className="text-xs text-muted-foreground font-hind mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-3 pt-2">
          <button className="w-full py-3.5 rounded-xl bg-primary font-bold text-primary-foreground active:scale-[0.97] transition-transform font-mukta text-base flex items-center justify-center gap-2">
            {t.reapply} <ArrowRight className="w-5 h-5" />
          </button>
          <button className="w-full py-3 rounded-xl bg-card border border-border font-bold text-foreground active:scale-[0.97] transition-transform font-mukta">{t.getHelp}</button>
        </div>
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <div className="bg-card/95 backdrop-blur-md rounded-full px-5 py-3 shadow-lg border border-border/50 flex items-center gap-3">
          <VoiceButton size="sm" />
          <span className="text-sm font-hind text-muted-foreground">{t.voiceCta}</span>
        </div>
      </div>
    </div>
  );
};

export default LoanDecoder;
