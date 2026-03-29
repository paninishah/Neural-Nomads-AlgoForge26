import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { theme } from "@/designSystem";
import { 
  Users, AlertTriangle, FileText, IndianRupee, 
  Store, ShieldCheck, FileKey, Scale,
  ChevronRight, Activity, MapPin, 
  CheckCircle, XCircle, Clock, Landmark
} from "lucide-react";
import type { Lang } from "@/pages/Index";
import { Role } from "@/components/RoleLogin";
import { ngoApi, apiClient } from "@/api/client";
import { APIResponse } from "@/lib/api";
import AdminDashboard from "./AdminDashboard";
import NGOReview from "./NGOReview";
import NGOProfile from "./profile/NGOProfile";
import PriceTicker from "./PriceTicker";
import FarmerDashboard from "./FarmerDashboard";

interface HomeDashboardProps {
  onNavigate: (screen: any) => void;
  lang: Lang;
  onToggleLang: () => void;
  role: Role;
  openChat?: () => void;
  onStartTour?: () => void;
}

// ----------------------------------------------------------------------
// ADMIN DASHBOARD (Professional Control Center)
// ----------------------------------------------------------------------
const AdminSection = () => {
  return <AdminDashboard />;
};


// ----------------------------------------------------------------------
// NGO DASHBOARD (Field operator focus)
// ----------------------------------------------------------------------
const NgoDashboardSection = () => {
  const [activeSubView, setActiveSubView] = useState<"stats" | "review" | "profile">("stats");
  const ngoName = localStorage.getItem("annadata_user_name") || "Field Operator";
  const ngoOrg  = localStorage.getItem("annadata_user_org") || "Your NGO";
  
  const [pendingFarmers, setPendingFarmers] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const farmersRes = await ngoApi.getFarmers("needs_manual_review");
        if (farmersRes.data.status === "success") {
          setPendingFarmers(farmersRes.data.data.slice(0, 5));
        }

        const scansRes = await ngoApi.getPendingScans();
        const helpRes  = await ngoApi.getHelpRequests();
        
        const combinedAlerts = [];
        if (scansRes.data.status === "success") {
          scansRes.data.data.forEach(s => combinedAlerts.push({ ...s, type: 'scan', priority: 'high' }));
        }
        if (helpRes.data.status === "success") {
          helpRes.data.data.forEach(h => combinedAlerts.push({ ...h, type: 'help', priority: 'medium' }));
        }
        
        setAlerts(combinedAlerts.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 4));
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="bg-[#13311c] text-white p-6 border-l-4 border-[#e18b2c] shadow-sm mb-6 flex items-center justify-between">
         <div>
            <h2 className="font-mukta font-bold text-2xl mb-1">Welcome, {ngoName}</h2>
            <p className="font-hind text-white/80">{ngoOrg} · Infrastructure Access</p>
         </div>
         <div className="flex gap-2">
            <button 
              onClick={() => setActiveSubView("stats")}
              className={`px-4 py-2 text-xs font-black uppercase tracking-widest transition-all ${activeSubView === 'stats' ? 'bg-[#e18b2c] text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
               Dash
            </button>
            <button 
              onClick={() => setActiveSubView("review")}
              className={`px-4 py-2 text-xs font-black uppercase tracking-widest transition-all ${activeSubView === 'review' ? 'bg-[#e18b2c] text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
               Review Queue
            </button>
            <button 
              onClick={() => setActiveSubView("profile")}
              className={`px-4 py-2 text-xs font-black uppercase tracking-widest transition-all ${activeSubView === 'profile' ? 'bg-[#e18b2c] text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
               Organization
            </button>
         </div>
      </div>

      {activeSubView === "stats" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ animation: "slide-up-fade 0.4s ease-out" }}>
          {/* Assigned Tasks (NGO Specific) */}
          <div className={`${theme.classes.card} bg-white shadow-lg border-t-4 border-t-[#3174a1]`}>
            <div className="p-4 border-b border-[#e5e3d7] bg-[#f0f9ff] flex justify-between items-center">
              <h2 className={`${theme.classes.heading2} text-[#1b435e]`}>Assigned Requests</h2>
              <span className="bg-[#3174a1] text-white text-[10px] font-black px-2 py-0.5 uppercase tracking-widest">
                {alerts.filter(a => a.type === 'help').length} Active
              </span>
            </div>
            <div className="p-0 max-h-[350px] overflow-y-auto">
              {loading ? (
                <div className="p-10 flex justify-center"><div className="w-6 h-6 border-2 border-[#3174a1] border-t-transparent rounded-full animate-spin" /></div>
              ) : alerts.filter(a => a.type === 'help').length === 0 ? (
                <div className="p-10 text-center text-gray-400 font-bold text-sm italic">No specific tasks assigned yet.</div>
              ) : (
                alerts.filter(a => a.type === 'help').map((help, idx) => (
                  <div key={idx} className="p-4 border-b border-gray-100 flex justify-between items-center hover:bg-gray-50 transition-colors" onClick={() => setActiveSubView("review")}>
                    <div>
                      <p className="font-bold text-[#1a1a1a]">{help.farmer_name || 'Farmer Request'}</p>
                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">
                        {help.request_type?.toUpperCase()} Assistance • {new Date(help.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Verification Queue Preview */}
          <div className={theme.classes.card}>
            <div className="p-4 border-b border-[#e5e3d7] bg-gray-50 flex justify-between items-center">
              <h2 className={theme.classes.heading2}>Pending Identity Review</h2>
              <span className={theme.classes.badgeInfo}>{pendingFarmers.length} Flagged</span>
            </div>
            <div>
              {loading ? (
                <div className="p-10 flex justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
              ) : pendingFarmers.length === 0 ? (
                <div className="p-10 text-center text-gray-400 font-bold text-sm italic">Queue is clear.</div>
              ) : (
                <div className="p-0">
                  {pendingFarmers.map(f => (
                    <div key={f.user_id} className="p-4 border-b border-gray-100 flex justify-between items-center hover:bg-gray-50 transition-colors">
                       <div>
                          <p className="font-bold text-[#1a1a1a]">{f.name}</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">{f.location}</p>
                       </div>
                       <button onClick={() => setActiveSubView("review")} className="text-[#3174a1] text-[10px] font-black uppercase tracking-widest border border-[#3174a1]/20 px-3 py-1 hover:bg-[#3174a1] hover:text-white transition-all">Review</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* AI Field Alerts (Bottom Wide or split) */}
          <div className={theme.classes.card + " lg:col-span-2"}>
            <div className="p-4 border-b border-[#e5e3d7] bg-[#fdf2f2] flex justify-between items-center">
              <h2 className={theme.classes.heading2 + " text-[#c82b28]"}>High-Priority Alerts & Anomalies</h2>
              <span className={theme.classes.badgeError}>System Alert</span>
            </div>
            <div className="p-0 overflow-y-auto max-h-[350px]">
                {loading ? (
                  <div className="p-10 flex justify-center"><div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /></div>
                ) : alerts.filter(a => a.type === 'scan').length === 0 ? (
                  <div className="p-10 text-center text-gray-400 font-bold text-sm italic">Global status nominal.</div>
                ) : (
                  alerts.filter(a => a.type === 'scan').map((alert, idx) => (
                    <div key={idx} className="p-4 border-b border-gray-100 flex gap-4 hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => setActiveSubView("review")}>
                      <div className="mt-1">
                        {alert.priority === 'high' ? <AlertTriangle className="w-5 h-5 text-[#c82b28]" /> : <Clock className="w-5 h-5 text-[#e18b2c]" />}
                      </div>
                      <div className="flex-1">
                          <p className="font-bold text-sm text-[#1a1a1a]">
                            Suspicious Input: {alert.pesticide_name}
                          </p>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{alert.description || `Mismatch: ₹${alert.bill_price} vs ₹${alert.extracted_mrp}`}</p>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2">{alert.farmer_name || 'Anonymous Farmer'} • {alert.location || 'Unknown Location'}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 mt-2" />
                    </div>
                  ))
                )}
            </div>
          </div>
        </div>
      )}

      {activeSubView === "review" && (
        <div style={{ animation: "slide-up-fade 0.4s ease-out" }}>
           <NGOReview />
        </div>
      )}

      {activeSubView === "profile" && (
        <div style={{ animation: "slide-up-fade 0.4s ease-out" }}>
           <NGOProfile role="ngo" />
        </div>
      )}

    </div>
  );
};


// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
// PRESENTATION READY HEATMAPS (Hardcoded for "Wow" factor)
// ----------------------------------------------------------------------
const PresentationHeatmaps = () => {
  const [activeTab, setActiveTab] = useState<"map" | "grid">("map");

  const hardcodedPoints = [
    { id: 1, name: "Azadpur Mandi", price: 2100, lat: 28.7, lng: 77.1, intensity: 0.9, color: "#f59e0b" },
    { id: 2, name: "Vashi Market", price: 1850, lat: 19.1, lng: 73.0, intensity: 0.7, color: "#6366f1" },
    { id: 3, name: "Nashik Hub", price: 3200, lat: 20.0, lng: 73.8, intensity: 1.0, color: "#f59e0b" },
    { id: 4, name: "Karnal Wheat", price: 1950, lat: 29.7, lng: 76.9, intensity: 0.8, color: "#6366f1" },
    { id: 5, name: "Nagpur Orange", price: 4500, lat: 21.1, lng: 79.1, intensity: 1.0, color: "#f59e0b" },
    { id: 6, name: "Lucknow Potato", price: 1200, lat: 26.8, lng: 80.9, intensity: 0.4, color: "#6366f1" },
    { id: 7, name: "Kolkata Jute", price: 5600, lat: 22.6, lng: 88.3, intensity: 1.0, color: "#f59e0b" },
    { id: 8, name: "Bangalore Silk", price: 8200, lat: 12.9, lng: 77.6, intensity: 0.9, color: "#f59e0b" },
  ];

  const project = (lat: number, lng: number) => {
    const x = ((lng - 68.7) / (97.25 - 68.7)) * 100;
    const y = 100 - ((lat - 8.4) / (37.6 - 8.4)) * 100;
    return { x: `${x}%`, y: `${y}%` };
  };

  const GridHeatmap = () => (
    <div className="grid grid-cols-8 grid-rows-4 gap-2 h-full p-4 relative overflow-hidden bg-black/40">
       {[...Array(32)].map((_, i) => {
         const intensity = Math.random();
         return (
           <motion.div 
             key={i}
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ 
               opacity: [0.3, 0.8, 0.3],
               scale: intensity > 0.8 ? [1, 1.05, 1] : 1,
               backgroundColor: intensity > 0.8 ? "#f59e0b" : intensity > 0.5 ? "#6366f1" : "rgba(255,255,255,0.05)"
             }}
             transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
             className="w-full h-full border border-white/5 rounded-sm relative flex items-center justify-center"
           >
              {intensity > 0.8 && (
                <div className="absolute inset-0 bg-amber-500/20 blur-md animate-pulse" />
              )}
              {intensity > 0.9 && <Activity className="w-3 h-3 text-white/50" />}
           </motion.div>
         )
       })}
       <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-[80px] font-black text-white/5 uppercase tracking-tighter">Market Matrix</p>
       </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex bg-black/5 p-1 w-fit rounded-none border border-black/10">
         <button onClick={() => setActiveTab("map")} className={`px-4 py-1 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'map' ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}>Geospatial Pulse</button>
         <button onClick={() => setActiveTab("grid")} className={`px-4 py-1 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'grid' ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}>Market Matrix</button>
      </div>

      <div className="relative h-[400px] bg-[#0a0a0a] overflow-hidden border border-white/5 shadow-2xl">
        {/* SHARED BG ELEMENTS */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '25px 25px' }} />
        
        {activeTab === "map" ? (
          <>
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full p-8 opacity-20 stroke-[#333] fill-none stroke-[0.5]">
              <path d="M30,10 L45,5 L60,8 L70,20 L82,45 L78,65 L65,85 L50,92 L35,88 L20,75 L15,50 L20,30 Z" />
            </svg>
            {hardcodedPoints.map((p) => {
              const { x, y } = project(p.lat, p.lng);
              return (
                <div key={p.id} className="absolute group cursor-pointer" style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}>
                  <motion.div animate={{ scale: [1, 2.5], opacity: [0.6, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute inset-0 w-4 h-4 rounded-full" style={{ backgroundColor: p.color }} />
                  <div className="w-2 h-2 rounded-full relative z-20 shadow-[0_0_10px_white]" style={{ backgroundColor: p.color }} />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-black/90 border border-white/10 rounded-none opacity-0 group-hover:opacity-100 transition-opacity z-50 min-w-[100px]">
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{p.name}</p>
                    <p className="text-xs font-bold text-white mt-0.5">₹{(p.price/100).toFixed(1)}k</p>
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <GridHeatmap />
        )}

        {/* OVERLAYS */}
        <div className="absolute top-4 left-4 z-40 flex items-center gap-3">
           <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Intelligence Stream 0x82f</p>
           </div>
           <div className="w-px h-3 bg-white/20" />
           <p className="text-[10px] font-bold text-amber-500 uppercase tracking-tight">Anomalies Detected: 12</p>
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-40 pointer-events-none">
          <div className="flex gap-4">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-amber-500" />
               <span className="text-[9px] font-bold text-gray-500 uppercase">High Intensity</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1]" />
               <span className="text-[9px] font-bold text-gray-500 uppercase">System Nominal</span>
             </div>
          </div>
          <div className="text-right">
             <p className="text-[40px] font-black text-white/5 uppercase leading-none mb-[-5px]">Annadata</p>
             <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">Market OS v4.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};


// ----------------------------------------------------------------------
// MAIN EXPORT
// ----------------------------------------------------------------------
const HomeDashboard = ({ onNavigate, role, openChat, onStartTour }: HomeDashboardProps) => {
  if (role === "admin") return <AdminSection />;
  if (role === "ngo") return <NgoDashboardSection />;
  return <FarmerDashboard onNavigate={onNavigate} openChat={openChat || (() => {})} onStartTour={onStartTour} />;
};

export default HomeDashboard;
