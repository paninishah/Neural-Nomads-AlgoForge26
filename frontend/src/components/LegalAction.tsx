import { useState } from "react";
import { FileText, Send, Download, Phone, ChevronRight } from "lucide-react";
import ScreenHeader from "./ScreenHeader";
import VoiceButton from "./VoiceButton";
import type { Lang } from "@/pages/Index";

interface LegalActionProps {
  onBack: () => void;
  lang: Lang;
}

const content = {
  en: {
    title: "Legal Assistance",
    subtitle: "File complaints, know your rights",
    whatHappened: "What happened?",
    infoText: "📄 We'll automatically generate a legal document for your case. Just tell us what happened — we'll handle the rest.",
    caseTitle: "Case Summary",
    tabs: ["Complaint", "Next Steps", "Support"],
    complainant: "Complainant",
    issue: "Issue",
    amount: "Amount",
    ref: "Ref",
    complainantVal: "Ramesh Kumar",
    issueVal: "Unfair Pricing",
    amountVal: "₹14,500 loss",
    refVal: "KS/2025/0847",
    draftTitle: "Complaint Draft",
    ready: "Ready",
    refDate: "Date: 25/03/2026",
    submitBtn: "Submit Complaint",
    downloadBtn: "Download PDF",
    generatingTitle: "Generating your document...",
    generatingDesc: "This takes a moment 📄",
    voiceCta: "Ask by voice",
    caseTypes: [
      { icon: "🪙", text: "Unfair pricing (below MSP)" },
      { icon: "🚫", text: "Fake pesticide / seeds sold" },
      { icon: "🏦", text: "Loan fraud / hidden charges" },
      { icon: "📄", text: "Land dispute" },
    ],
    nextSteps: [
      "Submit complaint at District Consumer Forum",
      "Attach all purchase receipts",
      "Follow up within 15 days",
      "Seek legal aid if no response",
    ],
    support: [
      { label: "Kisan Helpline", value: "1800-180-1551" },
      { label: "District Legal Aid", value: "011-2338-7214" },
    ],
  },
  hi: {
    title: "कानूनी सहायता",
    subtitle: "शिकायत दर्ज करें, अपने अधिकार जानें",
    whatHappened: "क्या हुआ?",
    infoText: "📄 हम आपके केस के लिए स्वचालित रूप से कानूनी दस्तावेज़ तैयार करेंगे। बस बताएँ क्या हुआ — बाकी हम संभालेंगे।",
    caseTitle: "केस सारांश",
    tabs: ["शिकायत", "अगले कदम", "सहायता"],
    complainant: "शिकायतकर्ता",
    issue: "मुद्दा",
    amount: "राशि",
    ref: "संदर्भ",
    complainantVal: "रमेश कुमार",
    issueVal: "अनुचित मूल्य निर्धारण",
    amountVal: "₹14,500 नुकसान",
    refVal: "KS/2025/0847",
    draftTitle: "शिकायत प्रारूप",
    ready: "तैयार",
    refDate: "तिथि: 25/03/2026",
    submitBtn: "शिकायत जमा करें",
    downloadBtn: "PDF डाउनलोड करें",
    generatingTitle: "आपका दस्तावेज़ तैयार हो रहा है...",
    generatingDesc: "इसमें थोड़ा समय लगेगा 📄",
    voiceCta: "बोलकर पूछिए",
    caseTypes: [
      { icon: "🪙", text: "अनुचित मूल्य (MSP से कम)" },
      { icon: "🚫", text: "नकली कीटनाशक / बीज बेचे गए" },
      { icon: "🏦", text: "लोन धोखाधड़ी / छुपे शुल्क" },
      { icon: "📄", text: "भूमि विवाद" },
    ],
    nextSteps: [
      "जिला उपभोक्ता फोरम में शिकायत दर्ज करें",
      "सभी खरीद रसीदें संलग्न करें",
      "15 दिनों के भीतर फॉलो अप करें",
      "कोई जवाब न मिलने पर कानूनी सहायता लें",
    ],
    support: [
      { label: "किसान हेल्पलाइन", value: "1800-180-1551" },
      { label: "जिला कानूनी सहायता", value: "011-2338-7214" },
    ],
  },
};

const LegalAction = ({ onBack, lang }: LegalActionProps) => {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const t = content[lang];

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen pb-28">
      <ScreenHeader onBack={onBack} title={t.title} icon="⚖️" subtitle={t.subtitle} />

      <div className="px-5 space-y-4 mt-4">
        {!generated ? (
          <>
            <div>
              <h3 className="text-sm font-bold text-foreground font-mukta mb-3">{t.whatHappened}</h3>
              <div className="space-y-2">
                {t.caseTypes.map((c, i) => (
                  <button key={i} onClick={handleGenerate} className="w-full bg-card rounded-2xl p-4 border border-border/50 flex items-center gap-4 active:scale-[0.98] transition-all hover:border-primary/30" style={{ animation: `slide-up-fade 0.4s ease-out ${i * 0.08}s forwards`, opacity: 0 }}>
                    <span className="text-2xl">{c.icon}</span>
                    <span className="text-sm font-bold text-foreground font-mukta flex-1 text-left">{c.text}</span>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-secondary/10 rounded-2xl p-4 border border-secondary/30">
              <p className="text-sm text-muted-foreground font-hind leading-relaxed">{t.infoText}</p>
            </div>
          </>
        ) : (
          <>
            {/* Case Summary */}
            <div className="bg-card rounded-2xl p-5 border border-border/50" style={{ animation: "slide-up-fade 0.5s ease-out forwards" }}>
              <h3 className="text-sm font-bold text-foreground font-mukta mb-3">{t.caseTitle}</h3>
              <div className="space-y-2 text-sm font-hind">
                {[
                  [t.complainant, t.complainantVal, "text-foreground"],
                  [t.issue, t.issueVal, "text-foreground"],
                  [t.amount, t.amountVal, "text-destructive"],
                  [t.ref, t.refVal, "text-foreground"],
                ].map(([label, val, color], i) => (
                  <div key={i} className={`flex justify-between py-1.5 ${i < 3 ? "border-b border-border/30" : ""}`}>
                    <span className="text-muted-foreground">{label}</span>
                    <span className={`font-bold ${color}`}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Tabs */}
            <div className="flex gap-1 bg-muted rounded-xl p-1">
              {t.tabs.map((tab, i) => (
                <button key={i} onClick={() => setActiveTab(i)} className={`flex-1 py-2.5 rounded-lg text-sm font-bold font-mukta transition-all ${activeTab === i ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>{tab}</button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 0 && (
              <div className="bg-card rounded-2xl p-5 border border-border/50" style={{ animation: "slide-up-fade 0.3s ease-out forwards" }}>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-bold text-foreground font-mukta">{t.draftTitle}</h3>
                  <span className="text-[10px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full ml-auto">{t.ready}</span>
                </div>
                <div className="space-y-2">
                  {[1, 0.92, 1, 0.75, 1, 0.85, 0.6].map((w, i) => (
                    <div key={i} className="h-2.5 bg-foreground/8 rounded-full" style={{ width: `${w * 100}%` }} />
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-border/30 flex justify-between text-xs text-muted-foreground font-hind">
                  <span>{t.ref}: {t.refVal}</span>
                  <span>{t.refDate}</span>
                </div>
              </div>
            )}

            {activeTab === 1 && (
              <div className="bg-card rounded-2xl p-5 border border-border/50 space-y-3" style={{ animation: "slide-up-fade 0.3s ease-out forwards" }}>
                {t.nextSteps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary-foreground">{i + 1}</span>
                    </div>
                    <p className="text-sm text-foreground font-hind pt-1">{step}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 2 && (
              <div className="bg-card rounded-2xl p-5 border border-border/50 space-y-3" style={{ animation: "slide-up-fade 0.3s ease-out forwards" }}>
                {t.support.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-muted/50 rounded-xl">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground font-mukta">{item.label}</p>
                      <p className="text-xs text-muted-foreground font-hind">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button className="w-full py-3.5 rounded-xl bg-primary font-bold text-primary-foreground active:scale-[0.97] transition-transform font-mukta text-base flex items-center justify-center gap-2">
                <Send className="w-5 h-5" /> {t.submitBtn}
              </button>
              <button className="w-full py-3 rounded-xl bg-card border border-border font-bold text-foreground active:scale-[0.97] transition-transform font-mukta flex items-center justify-center gap-2">
                <Download className="w-5 h-5" /> {t.downloadBtn}
              </button>
            </div>
          </>
        )}

        {/* Loading Overlay */}
        {generating && (
          <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-card rounded-2xl p-8 flex flex-col items-center gap-4 mx-8 shadow-xl">
              <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-base font-bold text-foreground font-mukta text-center">{t.generatingTitle}</p>
              <p className="text-xs text-muted-foreground font-hind">{t.generatingDesc}</p>
            </div>
          </div>
        )}
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

export default LegalAction;
