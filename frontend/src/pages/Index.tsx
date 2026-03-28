import { useState } from "react";
import HeroLanding from "@/components/HeroLanding";
import HomeDashboard from "@/components/HomeDashboard";
import MandiPrice from "@/components/MandiPrice";
import FraudDetection from "@/components/FraudDetection";
import LoanDecoder from "@/components/LoanDecoder";
import HeatmapIntelligence from "@/components/HeatmapIntelligence";
import FarmerWallet from "@/components/FarmerWallet";
import LegalAction from "@/components/LegalAction";
import ProfilePage from "@/components/profile/ProfilePage";
import AppLayout from "@/components/AppLayout";
import RoleLogin, { Role } from "@/components/RoleLogin";

type Screen = "hero" | "home" | "mandi" | "fraud" | "loan" | "legal" | "heatmap" | "wallet" | "profile";
export type Lang = "en" | "hi";

const Index = () => {
  const [screen, setScreen] = useState<Screen>("home");
  const [lang, setLang] = useState<Lang>("en");
  const [role, setRole] = useState<Role | null>(null);

  const navigate = (s: Screen) => setScreen(s);
  const toggleLang = () => setLang(l => (l === "en" ? "hi" : "en"));

  const handleLogout = () => {
    setRole(null);
    setScreen("home");
  };

  if (screen === "hero") {
    // Keep hero separate as it's the landing page wrapper before they log into the OS
    return <HeroLanding onEnter={() => navigate("home")} lang={lang} onToggleLang={toggleLang} />;
  }

  // If there's no active role identified, lock out to the Login selector
  if (!role) {
    return <RoleLogin onLogin={(assignedRole) => setRole(assignedRole)} />;
  }

  return (
    <AppLayout currentScreen={screen} onNavigate={navigate} lang={lang} onToggleLang={toggleLang} role={role} onLogout={handleLogout}>
      {screen === "home" && <HomeDashboard onNavigate={navigate} lang={lang} onToggleLang={toggleLang} role={role} />}
      {screen === "mandi" && <MandiPrice onBack={() => navigate("home")} lang={lang} />}
      {screen === "fraud" && <FraudDetection onBack={() => navigate("home")} lang={lang} role={role} />}
      {screen === "loan" && <LoanDecoder onBack={() => navigate("home")} lang={lang} />}
      {screen === "legal" && <LegalAction onBack={() => navigate("home")} lang={lang} role={role} />}
      {screen === "wallet"  && <FarmerWallet onNavigate={navigate} />}
      {screen === "heatmap" && <HeatmapIntelligence onBack={() => navigate("home")} />}
      {screen === "profile" && <ProfilePage role={role} />}
    </AppLayout>
  );
};

export default Index;
