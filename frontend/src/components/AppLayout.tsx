import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  LineChart,
  ShieldCheck,
  Landmark,
  Scale,
  Briefcase,
  Search,
  Bell,
  LogOut,
  Menu,
  X,
  FileText,
  Sprout,
  ArrowLeft
} from "lucide-react";
import type { Lang } from "@/pages/Index";
import type { Role } from "@/components/RoleLogin";
import VoiceAssistant from "./VoiceAssistant";
import LanguageSwitcher from "./LanguageSwitcher";

interface AppLayoutProps {
  children: React.ReactNode;
  currentScreen: string;
  onNavigate: (screen: any) => void;
  lang: Lang;
  onToggleLang: () => void;
  role: Role;
  onLogout: () => void;
}

const ALL_SIDEBAR_ITEMS = [
  { id: "home",    labelKey: "nav.dashboard",         icon: LayoutDashboard, roles: ["admin", "ngo", "farmer"] },
  { id: "mandi",   labelKey: "nav.mandiPrices",        icon: LineChart,        roles: ["admin", "farmer"] },
  { id: "fraud",   labelKey: "nav.inputVerification",  icon: ShieldCheck,      roles: ["admin", "farmer", "ngo"] },
  { id: "loan",    labelKey: "nav.loanDecoder",        icon: Landmark,         roles: ["admin", "farmer"] },
  { id: "legal",   labelKey: "nav.legalAid",           icon: Scale,            roles: ["admin", "farmer", "ngo"] },
  { id: "wallet",  labelKey: "nav.farmerWallet",       icon: Briefcase,        roles: ["farmer"] },
  { id: "heatmap", labelKey: "nav.mapIntelligence",    icon: LayoutDashboard,  roles: ["admin", "ngo", "farmer"] },
  { id: "profile", labelKey: "nav.myProfile",          icon: FileText,         roles: ["admin", "ngo", "farmer"] },
];

const AppLayout = ({ children, currentScreen, onNavigate, lang, onToggleLang, role, onLogout }: AppLayoutProps) => {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const userName = localStorage.getItem("annadata_user_name") || "User";
  const userInitials = userName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Filter Sidebar based on role
  const SIDEBAR_ITEMS = ALL_SIDEBAR_ITEMS.filter(item => item.roles.includes(role));

  // Derived Title for Header
  const activeItem = SIDEBAR_ITEMS.find(item => item.id === currentScreen);
  const headerTitle = activeItem ? t(activeItem.labelKey) : t("nav.dashboard");
  
  // Format current date exactly like "Saturday, 28 March 2026"
  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const formattedDate = today.toLocaleDateString("en-GB", dateOptions);

  return (
    <div className="min-h-screen bg-[#fbfaf5] font-hind flex overflow-hidden">
      
      {/* SIDEBAR (Desktop) - Hidden for Farmers */}
      {role !== "farmer" && (
        <aside className="hidden lg:flex flex-col w-[260px] bg-[#13311c] text-white flex-shrink-0 relative z-20 shadow-xl overflow-y-auto">
          <div className="p-6 border-b border-white/5 flex flex-col gap-1 relative overflow-hidden">
            {/* Subtle leaves drawing background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg viewBox="0 0 100 100" className="w-full h-full text-white" preserveAspectRatio="none">
                <path d="M0,50 Q25,30 50,50 T100,50" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <path d="M0,80 Q25,60 50,80 T100,80" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </svg>
            </div>
            
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-8 h-8 flex items-center justify-center border border-[#d4cb7e] text-[#d4cb7e]">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-mukta font-bold text-xl text-[#d4cb7e] leading-tight tracking-wide">Annadata</h1>
                <p className="text-[10px] font-bold text-[#d4cb7e]/70 tracking-widest uppercase">Farmer Intelligence OS</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 relative z-10">
            {SIDEBAR_ITEMS.map((item) => {
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3 text-sm transition-colors text-left font-semibold ${
                    isActive ? "bg-[#254d31] text-[#d4cb7e] border-l-4 border-[#d4cb7e]" : "text-white/80 hover:bg-white/5 hover:text-white border-l-4 border-transparent"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {t(item.labelKey)}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/10 space-y-1">
            <LanguageSwitcher compact />
            <button 
               onClick={onLogout}
               className="w-full flex items-center px-4 py-2 text-xs font-bold transition-all text-red-300 hover:bg-red-500/10 hover:text-red-200 mt-2"
             >
               <LogOut className="w-3 h-3 mr-2" />
               {t("common.signOut")}
             </button>
          </div>
        </aside>
      )}

      {/* MOBILE HEADER OVERLAY - Only for NGOs/Admins */}
      {role !== "farmer" && mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
      {role !== "farmer" && (
        <aside className={`fixed inset-y-0 left-0 w-[260px] bg-[#13311c] text-white z-50 transform transition-transform lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
           {/* Simple close button for mobile */}
           <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sprout className="w-5 h-5 text-[#d4cb7e]" />
                <h1 className="font-mukta font-bold text-xl text-[#d4cb7e]">Annadata</h1>
              </div>
              <button onClick={() => setMobileOpen(false)}>
                <X className="w-6 h-6 text-white/70" />
              </button>
           </div>
           <nav className="flex-1 px-4 py-6 space-y-1">
            {SIDEBAR_ITEMS.map((item) => {
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { onNavigate(item.id); setMobileOpen(false); }}
                  className={`w-full flex items-center gap-4 px-4 py-3 text-sm transition-colors text-left font-semibold border-l-4 ${
                    isActive ? "bg-[#254d31] text-[#d4cb7e] border-[#d4cb7e]" : "text-white/80 border-transparent"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {t(item.labelKey)}
                </button>
              );
            })}
          </nav>
          <div className="p-4 border-t border-white/10">
            <LanguageSwitcher compact />
          </div>
        </aside>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* TOP HEADER */}
        <header className="h-[72px] bg-white border-b border-[#e5e3d7] flex items-center justify-between px-6 flex-shrink-0 z-50 w-full relative">
          <div className="flex items-center gap-4">
            {role !== "farmer" ? (
              <button 
                className="lg:hidden text-[#1a1a1a] hover:bg-gray-100 p-2"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
            ) : currentScreen !== "home" && (
              <button 
                onClick={() => onNavigate("home")}
                className="p-2 -ml-2 hover:bg-gray-50 text-[#13311c] transition-colors flex items-center gap-1 group"
                title="Go Back"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </button>
            )}
            
            <div className="flex items-center gap-3">
              {role === 'farmer' && currentScreen === 'home' && (
                <div className="w-8 h-8 flex items-center justify-center border border-[#13311c] text-[#13311c]">
                  <Sprout className="w-5 h-5" />
                </div>
              )}
              <div className="flex items-baseline gap-3">
                <h2 className="text-xl font-bold font-mukta text-[#1a1a1a]">
                  {role === 'farmer' ? "Annadata" : headerTitle}
                </h2>
                <span className="hidden sm:inline text-[#666666] text-[10px] font-bold uppercase tracking-widest pt-1">
                  {formattedDate}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            {role === 'farmer' && (
              <div className="hidden sm:block">
                <LanguageSwitcher variant="header" />
              </div>
            )}
            {role !== "farmer" && (
              <div className="hidden md:flex items-center bg-gray-50 border border-gray-200 px-3 py-1.5 w-64 focus-within:border-[#13311c] transition-colors">
                <Search className="w-4 h-4 text-gray-400 mr-2" />
                <input 
                  type="text" 
                  placeholder={t("common.search")} 
                  className="bg-transparent border-none outline-none text-xs w-full text-gray-700"
                />
              </div>
            )}
            
            <button className="relative text-gray-500 hover:text-gray-800 transition-colors">
              <Bell className="w-5 h-5" />
              <div className="absolute -top-1.5 -right-1.5 bg-[#c82b28] text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-none shadow-sm">
                5
              </div>
            </button>

            <div
              className={`w-8 h-8 ${role === 'farmer' ? 'bg-[#408447]' : 'bg-[#254d31]'} text-white flex items-center justify-center text-xs font-bold border border-[#13311c] cursor-pointer hover:bg-opacity-80 transition-colors`}
              onClick={() => onNavigate('profile')}
              title="My Profile"
            >
              {userInitials}
            </div>
            
            {role === 'farmer' && (
              <button 
                onClick={onLogout}
                className="text-[#c82b28] hover:text-red-700"
                title={t("common.signOut")}
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </header>

        {/* PAGE CONTENT (Scrollable area) */}
        <main className={`flex-1 relative ${
          currentScreen === 'heatmap'
            ? 'overflow-hidden p-0'          /* map fills entire area, no padding */
            : 'overflow-x-hidden overflow-y-auto p-4 md:p-6'
        }`}>
          {children}
        </main>
      </div>
      
      {/* Global Bot Helper removed in favor of single-screen dashboard triggers */}
    </div>
  );
};

export default AppLayout;
