import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { 
  Landmark, ShieldCheck, 
  MessageSquare, Bot, List, 
  ChevronRight, Clock, CheckCircle2,
  AlertCircle, Map, Activity, User
} from "lucide-react";
import { profileApi, requestApi } from "@/api/client";
import { APIResponse } from "@/lib/api";
import PriceChart from "./PriceChart";
import PriceTicker from "./PriceTicker";
import MandiPrice from "./MandiPrice";

interface FarmerDashboardProps {
  onNavigate: (screen: string) => void;
  openChat?: () => void;
  onStartTour?: () => void;
}

const FarmerDashboard = ({ onNavigate, openChat, onStartTour }: FarmerDashboardProps) => {
  const { t } = useTranslation();
  const userId = localStorage.getItem("annadata_user_id");
  
  const [userName, setUserName] = useState(localStorage.getItem("annadata_user_name") || "Farmer");
  const [requests, setRequests] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [assignedNGO, setAssignedNGO] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      try {
        // Fetch User Requests
        const reqRes = await requestApi.getUserRequests(userId);
        if (reqRes.data.status === "success") {
          const reqList = reqRes.data.data;
          setRequests(reqList.slice(0, 3));
          
          // Find the most recent assigned NGO via requests
          const assignment = reqList.find((r: any) => r.assigned_ngo_id);
          if (assignment) {
            const ngoRes = await profileApi.getProfile(assignment.assigned_ngo_id);
            if (ngoRes.data.status === "success") {
              setAssignedNGO(ngoRes.data.data);
            }
          }
        }

        // Fetch Detailed Profile
        const profRes = await profileApi.getProfile(userId);
        if (profRes.data.status === "success") {
          setProfile(profRes.data.data);
          if (profRes.data.data.name) {
            setUserName(profRes.data.data.name);
            localStorage.setItem("annadata_user_name", profRes.data.data.name);
          }
        }
      } catch (e) {
        console.error("Dashboard fetch error", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const ACTIONS = [
    { id: "mandi",     label: t("nav.mandiPrices"),       icon: Landmark,     color: "bg-[#ecfccb] text-[#3f6212] border-[#3f6212]/20", tourId: "tour-mandi" },
    { id: "fraud",     label: t("nav.inputVerification"), icon: ShieldCheck,  color: "bg-[#fdf2f2] text-[#c82b28] border-[#c82b28]/20", tourId: "tour-fraud" },
    { id: "loan",      label: t("nav.loanDecoder"),       icon: Landmark,     color: "bg-[#eef6fc] text-[#3174a1] border-[#3174a1]/20", tourId: "tour-loan" },
    { id: "legal",     label: t("nav.legalAid"),          icon: MessageSquare, color: "bg-[#fdf5e8] text-[#e18b2c] border-[#e18b2c]/20", tourId: "tour-legal" },
    { id: "heatmap",   label: t("nav.mapIntelligence"),   icon: Map,          color: "bg-[#f0f9ff] text-[#0369a1] border-[#0369a1]/20", tourId: "tour-heatmap" },
    { id: "wallet",    label: t("nav.farmerWallet"),      icon: List,         color: "bg-white text-gray-700 border-gray-200", tourId: "tour-wallet" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Cinematic Greeting */}
      <div className="relative overflow-hidden bg-[#13311c] p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#408447] blur-[100px] opacity-20 -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-mukta font-bold leading-tight">
              {t("dashboard.welcomeBack")}, <span className="text-[#d4cb7e]">{userName}</span>
            </h1>
            <p className="mt-2 text-white/70 font-medium max-w-md">
              {profile ? `${profile.village}, ${profile.district}` : t("dashboard.oneScreenSubtitle")}
            </p>
            
            {/* Assigned NGO Status */}
            {assignedNGO && (
              <div className="mt-4 flex items-center gap-2 bg-[#d4cb7e]/10 border border-[#d4cb7e]/30 px-3 py-1.5 rounded-full w-fit">
                <ShieldCheck className="w-4 h-4 text-[#d4cb7e]" />
                <span className="text-xs font-bold text-[#d4cb7e] uppercase tracking-wider">
                  Assigned: {assignedNGO.organization_name || assignedNGO.name}
                </span>
              </div>
            )}
            
            <div id="tour-ai" className="mt-4 p-3 bg-white/10 backdrop-blur-md rounded border border-white/10 inline-flex items-center gap-2 cursor-pointer hover:bg-white/20 transition-all">
               <Bot className="w-4 h-4 text-[#d4cb7e]" />
               <span className="text-xs font-bold uppercase tracking-widest">{t("onboarding.aiTitle")}</span>
               <ChevronRight className="w-3 h-3 text-white/40" />
            </div>
          </div>
          
          {/* Manual Tour Trigger */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStartTour}
            className="h-fit bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 px-6 py-3 flex items-center gap-3 text-white transition-all group shadow-xl"
          >
            <div className="w-8 h-8 rounded-full bg-[#d4cb7e] flex items-center justify-center group-hover:bg-[#408447] transition-colors">
              <Activity className="w-4 h-4 text-[#1a1a1a]" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-none mb-1">Guide</p>
              <p className="text-sm font-bold leading-none">{t("common.viewTour", "Take a Tour")}</p>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Primary Action Suite */}
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ACTIONS.slice(0, 6).map((action) => (
            <motion.button
              key={action.id}
              id={action.tourId}
              whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate(action.id)}
              className={`flex flex-col items-center justify-center p-6 border-2 transition-all ${action.color} group relative overflow-hidden h-full min-h-[140px] shadow-sm`}
            >
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
              <action.icon className="w-8 h-8 mb-4 relative z-10" />
              <span className="font-bold text-xs md:text-sm text-center leading-tight relative z-10 px-2 uppercase tracking-tight">
                {action.label}
              </span>
            </motion.button>
          ))}
        </div>

        {/* LIVE MARKET TICKER (Full Width Raw Data) */}
        <div className="w-full">
          <div className="min-h-[450px]">
            <PriceTicker />
          </div>
        </div>
      </div>

      {/* Helper Tip */}
      <div className="bg-[#f0f9ff] border-l-4 border-[#0369a1] p-6 flex gap-4 items-start">
         <Bot className="w-6 h-6 text-[#0369a1] shrink-0" />
         <div>
            <p className="font-bold text-sm text-[#0c4a6e]">{t("dashboard.assistantTip")}</p>
            <p className="text-sm text-[#0c4a6e]/80 mt-1">
              "Use the floating microphone button to navigate or check prices hands-free. Just tap and speak!"
            </p>
         </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
