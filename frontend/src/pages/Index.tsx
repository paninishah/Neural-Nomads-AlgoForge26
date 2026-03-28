import { useState } from "react";
import VineReveal from "@/components/VineReveal";
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
import NGODashboard from "@/components/NGODashboard";
import AdminDashboard from "@/components/AdminDashboard";

type Screen = "vine" | "hero" | "home" | "mandi" | "fraud" | "loan" | "legal" | "heatmap" | "wallet" | "profile";
export type Lang = "en" | "hi";

const Index = () => {
  const [screen, setScreen] = useState<Screen>("vine");
  const [lang, setLang] = useState<Lang>("en");
  const [role, setRole] = useState<Role | null>(null);

  const navigate = (s: Screen) => setScreen(s);
  const toggleLang = () => setLang(l => (l === "en" ? "hi" : "en"));

  const handleLogout = () => {
    setRole(null);
    setScreen("home");
  };

  if (screen === "vine") {
    return <VineReveal onComplete={() => { window.scrollTo(0, 0); navigate("home"); }} />;
  }

  // If there's no active role identified, lock out to the Login selector
  if (!role) {
    return <RoleLogin onLogin={(assignedRole) => setRole(assignedRole)} />;
  }

  return (
    <AppLayout currentScreen={screen} onNavigate={navigate} lang={lang} onToggleLang={toggleLang} role={role} onLogout={handleLogout}>
      {screen === "home" && (
        <HomeDashboard onNavigate={navigate} lang={lang} onToggleLang={toggleLang} role={role} />
      )}
      {screen === "mandi" && <MandiPrice onBack={() => navigate("home")} lang={lang} />}
      {screen === "fraud" && <FraudDetection onBack={() => navigate("home")} role={role} />}
      {screen === "loan" && <LoanDecoder onBack={() => navigate("home")} />}
      {screen === "legal" && <LegalAction onBack={() => navigate("home")} lang={lang} role={role} />}
      {screen === "wallet"  && <FarmerWallet onNavigate={navigate} />}
      {screen === "heatmap" && <HeatmapIntelligence onBack={() => navigate("home")} />}
      {screen === "profile" && <ProfilePage role={role} />}
    </AppLayout>
  );
};

export default Index;
