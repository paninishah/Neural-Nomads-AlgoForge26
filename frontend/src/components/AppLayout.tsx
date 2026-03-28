import { useState } from "react";
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
  FileText
} from "lucide-react";
import type { Lang } from "@/pages/Index";
import type { Role } from "@/components/RoleLogin";
import VoiceAssistant from "./VoiceAssistant";

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
  { id: "home", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "ngo", "farmer"] },
  { id: "mandi", label: "Mandi Prices", icon: LineChart, roles: ["admin", "farmer"] },
  { id: "fraud", label: "Input Verification", icon: ShieldCheck, roles: ["admin", "farmer", "ngo"] },
  { id: "loan", label: "Loan Decoder", icon: Landmark, roles: ["admin", "farmer"] },
  { id: "legal", label: "Legal Aid", icon: Scale, roles: ["admin", "farmer", "ngo"] },
  { id: "wallet", label: "Farmer Wallet", icon: Briefcase, roles: ["farmer"] },
  { id: "heatmap", label: "Map Intelligence", icon: LayoutDashboard, roles: ["admin", "ngo", "farmer"] }, 
];

const SECONDARY_ITEMS = [
  { id: "lang", label: "English", action: true },
];

const AppLayout = ({ children, currentScreen, onNavigate, lang, onToggleLang, role, onLogout }: AppLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Filter Sidebar based on role
  const SIDEBAR_ITEMS = ALL_SIDEBAR_ITEMS.filter(item => item.roles.includes(role));

  // Derived Title for Header
  const activeItem = SIDEBAR_ITEMS.find(item => item.id === currentScreen);
  const headerTitle = activeItem ? activeItem.label : "Dashboard";
  
  // Format current date exactly like "Saturday, 28 March 2026"
  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const formattedDate = today.toLocaleDateString("en-GB", dateOptions);

  return (
    <div className="min-h-screen bg-[#fbfaf5] font-hind flex overflow-hidden">
      
      {/* SIDEBAR (Desktop) */}
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
              <span className="font-mukta font-bold text-lg">↑</span>
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
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-1">
          {SECONDARY_ITEMS.map((item) => (
             <button
               key={item.id}
               onClick={item.action ? onToggleLang : undefined}
               className={`w-full flex items-center px-4 py-2 text-xs font-bold transition-all ${
                 item.id === "fpo" ? "bg-[#386542] text-white border border-[#4f855c]" : "text-white/70 hover:bg-white/5 hover:text-white"
               }`}
             >
               {item.id === "lang" ? (lang === "en" ? "Hindi (Switch)" : "English (Switch)") : item.label}
             </button>
          ))}
          <button 
             onClick={onLogout}
             className="w-full flex items-center px-4 py-2 text-xs font-bold transition-all text-red-300 hover:bg-red-500/10 hover:text-red-200 mt-4"
           >
             <LogOut className="w-3 h-3 mr-2" />
             Sign Out System
           </button>
        </div>
      </aside>

      {/* MOBILE HEADER OVERLAY */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
      <aside className={`fixed inset-y-0 left-0 w-[260px] bg-[#13311c] text-white z-50 transform transition-transform lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
         {/* Simple close button for mobile */}
         <div className="p-4 border-b border-white/10 flex justify-between items-center">
            <h1 className="font-mukta font-bold text-xl text-[#d4cb7e]">Annadata</h1>
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
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* TOP HEADER */}
        <header className="h-[72px] bg-white border-b border-[#e5e3d7] flex items-center justify-between px-6 flex-shrink-0 z-10 w-full relative">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-[#1a1a1a] hover:bg-gray-100 p-2"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-baseline gap-3">
              <h2 className="text-xl font-bold font-mukta text-[#1a1a1a]">{headerTitle}</h2>
              <span className="hidden sm:inline text-[#666666] text-xs pt-1">{formattedDate}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center bg-gray-50 border border-gray-200 px-3 py-1.5 w-64 focus-within:border-[#13311c] transition-colors">
              <Search className="w-4 h-4 text-gray-400 mr-2" />
              <input 
                type="text" 
                placeholder="Search farmers, cases, crops..." 
                className="bg-transparent border-none outline-none text-xs w-full text-gray-700"
              />
            </div>
            
            <button className="relative text-gray-500 hover:text-gray-800 transition-colors">
              <Bell className="w-5 h-5" />
              <div className="absolute -top-1.5 -right-1.5 bg-[#c82b28] text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-none shadow-sm">
                5
              </div>
            </button>

            <div className="w-8 h-8 bg-[#254d31] text-white flex items-center justify-center text-xs font-bold border border-[#13311c]">
              RS
            </div>
          </div>
        </header>

        {/* PAGE CONTENT (Scrollable area) */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 relative">
          {children}
        </main>
      </div>
      
      {/* Global Voice Assistant for Farmers */}
      {role === "farmer" && (
        <VoiceAssistant role={role} onNavigate={onNavigate} />
      )}
    </div>
  );
};

export default AppLayout;
