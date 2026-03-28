import { useState } from "react";
import HeroLanding from "@/components/HeroLanding";
import HomeDashboard from "@/components/HomeDashboard";
import MandiPrice from "@/components/MandiPrice";
import FraudDetection from "@/components/FraudDetection";
import LoanDecoder from "@/components/LoanDecoder";
import LegalAction from "@/components/LegalAction";
import HeatmapIntelligence from "@/components/HeatmapIntelligence";

type Screen = "hero" | "home" | "mandi" | "fraud" | "loan" | "legal" | "heatmap";
export type Lang = "en" | "hi";

const Index = () => {
  const [screen, setScreen] = useState<Screen>("hero");
  const [lang, setLang] = useState<Lang>("en");

  const navigate = (s: Screen) => setScreen(s);
  const toggleLang = () => setLang(l => (l === "en" ? "hi" : "en"));

  return (
    <div className="min-h-screen bg-background font-mukta texture-jute overflow-x-hidden">
      {screen === "hero" && <HeroLanding onEnter={() => navigate("home")} lang={lang} onToggleLang={toggleLang} />}
      {screen === "home" && <HomeDashboard onNavigate={navigate} lang={lang} onToggleLang={toggleLang} />}
      {screen === "mandi" && <MandiPrice onBack={() => navigate("home")} lang={lang} />}
      {screen === "fraud" && <FraudDetection onBack={() => navigate("home")} lang={lang} />}
      {screen === "loan" && <LoanDecoder onBack={() => navigate("home")} lang={lang} />}
      {screen === "legal" && <LegalAction onBack={() => navigate("home")} lang={lang} />}
      {screen === "heatmap" && <HeatmapIntelligence onBack={() => navigate("home")} />}
    </div>
  );
};

export default Index;
