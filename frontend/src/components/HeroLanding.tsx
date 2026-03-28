import { useState, useEffect } from "react";
import heroFarm from "@/assets/hero-farm.jpg";
import VoiceButton from "./VoiceButton";
import LanguageSwitcher from "./LanguageSwitcher";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import type { Lang } from "@/pages/Index";
import { motion } from "framer-motion";

interface HeroLandingProps {
  onEnter: () => void;
  lang: Lang;
  onToggleLang: () => void;
}

const content = {
  en: {
    brand: "Annadata",
    headline1: "Stop Getting",
    headline2: "Cheated.",
    sub: "Know if you're being underpaid, sold fake inputs, or unfairly denied loans —",
    subBold: "instantly.",
    subtext: "Har faisla — data ke saath, bina andaze ke.",
    cta1: "🎤 Start Speaking",
    cta2: "See How It Works →",
    mockHeader: "Mandi Price Check",
    mockTitle: "Aaj ka Rate — Lucknow Mandi",
    mockFooter: "⚠️ Aapko ₹250/quintal kam mil raha hai",
    featuresTitle: "One app. Four protections.",
    featuresDesc: "A simple, powerful tool against every kind of cheating.",
    voiceTitle: "Just speak — no typing needed",
    voiceDesc: "Talk in Hindi, Marathi, or your language. AI will understand.",
    voiceCta: "Get Started →",
    trust1: "Built for Indian Farmers",
    trust2: "Hindi, Marathi & Regional Languages",
    trust3: "Data Safe & Private",
    footer: "© 2026 Annadata · Farmers first, always.",
    footerCta: "Go to Dashboard →",
    features: [
      { icon: "🪙", title: "Fair Price Check", desc: "Know the real mandi price before selling" },
      { icon: "🚨", title: "Fraud Detection", desc: "Identify fake seeds & pesticides instantly" },
      { icon: "🏦", title: "Loan Clarity", desc: "Understand why your loan was rejected" },
      { icon: "⚖️", title: "Legal Help", desc: "Generate complaints in one tap" },
    ],
  },
  hi: {
    brand: "अन्नदाता",
    headline1: "धोखा अब",
    headline2: "नहीं चलेगा।",
    sub: "जानिए कि आपको कम दाम मिल रहा है, नकली बीज बेचा जा रहा है, या लोन अनुचित तरीके से अस्वीकार हुआ —",
    subBold: "तुरंत।",
    subtext: "हर फैसला — डेटा के साथ, बिना अंदाज़े के।",
    cta1: "🎤 बोलकर पूछिए",
    cta2: "कैसे काम करता है →",
    mockHeader: "मंडी भाव जाँच",
    mockTitle: "आज का रेट — लखनऊ मंडी",
    mockFooter: "⚠️ आपको ₹250/क्विंटल कम मिल रहा है",
    featuresTitle: "एक ऐप। चार सुरक्षा।",
    featuresDesc: "हर धोखे के खिलाफ एक सरल, शक्तिशाली उपकरण।",
    voiceTitle: "बोलकर पूछिए — टाइप करने की ज़रूरत नहीं",
    voiceDesc: "हिंदी, मराठी, या अपनी भाषा में बात करें। AI समझेगा।",
    voiceCta: "शुरू करें →",
    trust1: "भारतीय किसानों के लिए बनाया गया",
    trust2: "हिंदी, मराठी और क्षेत्रीय भाषाएँ",
    trust3: "डेटा सुरक्षित और निजी",
    footer: "© 2026 अन्नदाता · किसान सबसे पहले, हमेशा।",
    footerCta: "डैशबोर्ड में जाएँ →",
    features: [
      { icon: "🪙", title: "उचित मूल्य जाँच", desc: "बेचने से पहले असली मंडी भाव जानें" },
      { icon: "🚨", title: "धोखा पहचान", desc: "नकली बीज और कीटनाशक तुरंत पहचानें" },
      { icon: "🏦", title: "लोन स्पष्टता", desc: "समझें आपका लोन क्यों अस्वीकार हुआ" },
      { icon: "⚖️", title: "कानूनी मदद", desc: "एक टैप में शिकायत दर्ज करें" },
    ],
  },
};

const previewItems = [
  { label: "Gehun", you: "₹1,930", market: "₹2,180", diff: "-₹250", alert: true },
  { label: "Chana", you: "₹4,100", market: "₹4,250", diff: "-₹150", alert: true },
  { label: "Sarson", you: "₹5,400", market: "₹5,380", diff: "+₹20", alert: false },
];

const RevealSection = ({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.7,
        delay: delay / 1000,
        ease: "easeOut",
      }}
      viewport={{ once: true, margin: "-50px" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const HeroLanding = ({ onEnter, lang, onToggleLang }: HeroLandingProps) => {
  const [visible, setVisible] = useState(false);
  const t = content[lang];

  useEffect(() => {
    setTimeout(() => setVisible(true), 200);
  }, []);

  return (
    <div className="min-h-screen bg-transparent">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroFarm} alt="Indian wheat field at sunrise" className="w-full h-full object-cover scale-110" style={{ filter: "blur(1px)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(170deg, hsl(120 52% 14% / 0.88) 0%, hsl(120 40% 18% / 0.82) 40%, hsl(30 30% 20% / 0.75) 100%)" }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 pt-8 pb-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-12 md:mb-20"
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌾</span>
            <span className="text-lg md:text-xl font-bold tracking-widest text-kisan-yellow uppercase font-mukta">{t.brand}</span>
          </div>
          <LanguageSwitcher lang={lang} onToggle={onToggleLang} />
        </motion.div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-16">
          <div className={`flex-1 transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h1 className="text-[2.75rem] md:text-6xl lg:text-7xl font-extrabold leading-[1.08] text-primary-foreground font-mukta mb-5">
              {t.headline1}<br /><span className="text-kisan-yellow">{t.headline2}</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 font-hind max-w-lg mb-3 leading-relaxed">
              {t.sub} <strong className="text-primary-foreground">{t.subBold}</strong>
            </p>
            <p className="text-sm md:text-base text-primary-foreground/60 font-hind mb-8">{t.subtext}</p>
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-10 lg:mb-0">
              <button onClick={onEnter} className="flex items-center gap-2.5 px-8 py-4 rounded-none bg-kisan-yellow text-foreground font-bold text-lg shadow-xl active:scale-[0.97] transition-transform font-mukta" style={{ boxShadow: "0 6px 24px hsl(48 96% 58% / 0.35)" }}>{t.cta1}</button>
              <button onClick={onEnter} className="px-6 py-4 rounded-none border-2 border-primary-foreground/30 text-primary-foreground font-semibold text-base hover:bg-primary-foreground/10 transition-colors font-mukta">{t.cta2}</button>
            </div>
          </div>

          <div className={`flex-shrink-0 w-full lg:w-[380px] transition-all duration-1000 delay-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
            <div className="rounded-none border border-primary-foreground/10 overflow-hidden" style={{ background: "hsl(48 50% 93% / 0.95)", boxShadow: "0 20px 60px hsl(0 0% 0% / 0.35)" }}>
              <div className="px-5 pt-5 pb-3 border-b border-border/40">
                <p className="text-xs text-muted-foreground font-hind mb-1">{t.mockHeader}</p>
                <p className="text-base font-bold text-foreground font-mukta">{t.mockTitle}</p>
              </div>
              <div className="divide-y divide-border/30">
                {previewItems.map((item) => (
                  <div key={item.label} className="flex items-center justify-between px-5 py-3.5">
                    <div>
                      <p className="text-sm font-semibold text-foreground font-mukta">{item.label}</p>
                      <p className="text-xs text-muted-foreground font-hind">You: {item.you} · Market: {item.market}</p>
                    </div>
                    <span className={`text-sm font-bold font-mukta px-2.5 py-1 rounded-none ${item.alert ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>{item.diff}</span>
                  </div>
                ))}
              </div>
              <div className="px-5 py-4 bg-destructive/5">
                <p className="text-xs font-semibold text-destructive font-mukta">{t.mockFooter}</p>
              </div>
            </div>
          </div>
        </div>
    </div>
      </section >

      <section className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <RevealSection>
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground font-mukta mb-3">{t.featuresTitle}</h2>
            <p className="text-muted-foreground font-hind text-base max-w-md mx-auto">{t.featuresDesc}</p>
          </div>
        </RevealSection>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {t.features.map((f, i) => (
            <RevealSection key={f.title} delay={i * 120}>
              <div className="paper-card p-6 text-center h-full">
                <span className="text-4xl block mb-4">{f.icon}</span>
                <h3 className="text-base font-bold text-foreground font-mukta mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground font-hind leading-relaxed">{f.desc}</p>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      <section className="bg-primary py-16 md:py-20">
        <RevealSection>
          <div className="max-w-3xl mx-auto px-5 md:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground font-mukta mb-3">{t.voiceTitle}</h2>
            <p className="text-primary-foreground/70 font-hind text-base mb-8 max-w-md mx-auto">{t.voiceDesc}</p>
            <div className="flex justify-center mb-8"><VoiceButton /></div>
            <button onClick={onEnter} className="px-8 py-4 rounded-none bg-kisan-yellow text-foreground font-bold text-lg shadow-xl active:scale-[0.97] transition-transform font-mukta" style={{ boxShadow: "0 6px 24px hsl(48 96% 58% / 0.3)" }}>{t.voiceCta}</button>
          </div>
        </RevealSection>
      </section>

      <section className="max-w-6xl mx-auto px-5 md:px-8 py-12 md:py-16">
        <RevealSection>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 text-center">
            <div className="flex items-center gap-2"><span className="text-xl">🇮🇳</span><p className="text-sm font-semibold text-foreground font-mukta">{t.trust1}</p></div>
            <div className="hidden md:block w-px h-6 bg-border" />
            <div className="flex items-center gap-2"><span className="text-xl">🗣️</span><p className="text-sm font-semibold text-foreground font-mukta">{t.trust2}</p></div>
            <div className="hidden md:block w-px h-6 bg-border" />
            <div className="flex items-center gap-2"><span className="text-xl">🔒</span><p className="text-sm font-semibold text-foreground font-mukta">{t.trust3}</p></div>
          </div>
        </RevealSection>
      </section>

      <section className="border-t border-border py-10">
        <div className="max-w-6xl mx-auto px-5 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground font-hind text-sm">{t.footer}</p>
          <button onClick={onEnter} className="text-sm font-semibold text-primary font-mukta hover:underline">{t.footerCta}</button>
        </div>
      </section>
    </div >
  );
};

export default HeroLanding;
