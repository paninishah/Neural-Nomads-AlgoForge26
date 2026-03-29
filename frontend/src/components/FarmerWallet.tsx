import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { theme } from "@/designSystem";
import { 
  IndianRupee, TrendingUp, TrendingDown, Info, 
  MapPin, Store, AlertTriangle, ArrowRight, Activity, Calendar
} from "lucide-react";
import { apiClient } from "@/api/client";
import { APIResponse, FinancialsResponse } from "@/lib/api";

interface FarmerWalletProps {
  onNavigate: (s: any) => void;
}

const FarmerWallet = ({ onNavigate }: FarmerWalletProps) => {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<"input" | "calculating" | "dashboard">("input");
  
  // Input States
  const [valCrop, setValCrop] = useState("Wheat");
  const [valQty, setValQty] = useState(20);
  const [valRev, setValRev] = useState(42000);
  const [valExp, setValExp] = useState(48000);

  // What-If Simulator States
  const [soldInBetterMandi, setSoldInBetterMandi] = useState(false);
  const [reducedInputCost, setReducedInputCost] = useState(false);
  
  // Base Data Model
  const [baseData, setBaseData] = useState({
    revenue: 42000,
    expenses: 48000,
    mandiLoss: 8000,
    pesticideLoss: 3000,
    transportCost: 1000
  });

  const handleGenerate = async () => {
    setPhase("calculating");
    try {
      const resp = await apiClient.post<APIResponse<FinancialsResponse>>("/financials", {
        crop_type: valCrop,
        quantity: valQty,
        revenue: valRev,
        expenses: valExp
      });
      const data = resp.data.data;
      setBaseData({
        revenue: data.revenue,
        expenses: data.expenses,
        mandiLoss: data.mandi_loss,
        pesticideLoss: data.pesticide_loss,
        transportCost: data.transport_cost
      });
    } catch(e) {
      console.error("Failed to fetch financials.", e);
    } finally {
      setTimeout(() => setPhase("dashboard"), 1000);
    }
  };

  // Simulated Data based on "What-If"
  const currentRevenue = soldInBetterMandi ? baseData.revenue + baseData.mandiLoss : baseData.revenue;
  const currentExpenses = reducedInputCost ? baseData.expenses - baseData.pesticideLoss : baseData.expenses;
  const currentProfit = currentRevenue - currentExpenses;

  // Formatting utility
  const formatCur = (v: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  // Counter Hook for animated numbers
  const AnimatedCounter = ({ value, duration = 1.5 }: { value: number, duration?: number }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
      let startTime: number;
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        // easeOutQuart
        const ease = 1 - Math.pow(1 - progress, 4);
        setCount(value * ease);
        if (progress < 1) requestAnimationFrame(animate);
      };
      const frame = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(frame);
    }, [value, duration]);
    
    return <span>{formatCur(count)}</span>;
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-20">
      
      {/* PHASE 1: INPUT GATHERING */}
      {phase === "input" && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className={theme.classes.card + " p-8 max-w-2xl mx-auto mt-10"}
        >
          <div className="mb-6 border-b border-[#e5e3d7] pb-4">
            <h2 className={theme.classes.heading1}>{t("wallet.seasonFinancialEntry")}</h2>
            <p className={theme.classes.bodyText + " mt-1"}>{t("wallet.unlockIntelligence")}</p>
          </div>
          
          <div className="space-y-5">
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-xs font-bold uppercase text-[#666666] mb-1">{t("wallet.cropType")}</label>
                 <div className={theme.classes.inputWrapper}>
                   <input type="text" value={valCrop} onChange={e => setValCrop(e.target.value)} className={theme.classes.inputText} />
                 </div>
               </div>
               <div>
                 <label className="block text-xs font-bold uppercase text-[#666666] mb-1">{t("wallet.quantityQuintals")}</label>
                 <div className={theme.classes.inputWrapper}>
                   <input type="number" value={valQty} onChange={e => setValQty(Number(e.target.value))} className={theme.classes.inputText} />
                 </div>
               </div>
             </div>
             
             <div>
               <label className="block text-xs font-bold uppercase text-[#666666] mb-1">{t("wallet.totalSold")}</label>
               <div className={theme.classes.inputWrapper}>
                 <IndianRupee className="w-4 h-4 text-gray-400 ml-3" />
                 <input type="number" value={valRev} onChange={e => setValRev(Number(e.target.value))} className={theme.classes.inputText} />
               </div>
             </div>

             <div>
               <label className="block text-xs font-bold uppercase text-[#666666] mb-1">{t("wallet.totalExpenses")}</label>
               <div className={theme.classes.inputWrapper}>
                 <IndianRupee className="w-4 h-4 text-gray-400 ml-3" />
                 <input type="number" value={valExp} onChange={e => setValExp(Number(e.target.value))} className={theme.classes.inputText} />
               </div>
             </div>

             <button 
               onClick={handleGenerate}
               className={theme.classes.btnPrimary + " w-full py-3 mt-4 text-lg"}
             >
               {t("wallet.generateIntelligence")}
             </button>
          </div>
        </motion.div>
      )}

      {/* PHASE 2: CALCULATING */}
      {phase === "calculating" && (
         <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
              <Activity className="w-12 h-12 text-[#13311c]" />
            </motion.div>
            <h2 className={theme.classes.heading2 + " tracking-wide animate-pulse"}>{t("wallet.runningModels")}</h2>
            <p className={theme.classes.caption}>{t("common.loading")}</p>
         </div>
      )}

      {/* PHASE 3: DASHBOARD */}
      {phase === "dashboard" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          
          {/* 1. HERO SECTION */}
          <div className={`${theme.classes.card} p-8 relative overflow-hidden flex flex-col items-center justify-center min-h-[200px]`}>
            <div className={`absolute inset-0 z-0 transition-colors duration-1000 ${currentProfit >= 0 ? 'bg-gradient-to-br from-[#f1f8f3] to-[#e4f1e8]' : 'bg-gradient-to-br from-[#fdf2f2] to-[#fae1e1]'}`} />
            
            <div className="relative z-10 text-center">
              <h2 className="text-[#666666] uppercase font-bold tracking-widest text-sm mb-2">{t("wallet.netSeasonOutcome")}</h2>
              <div className={`text-6xl md:text-8xl font-black font-mukta tracking-tighter ${currentProfit >= 0 ? 'text-[#408447]' : 'text-[#c82b28]'}`}>
                 {currentProfit < 0 && "-"}<AnimatedCounter value={Math.abs(currentProfit)} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-2 space-y-6">
              
              <div className={theme.classes.card + " p-6"}>
                <h3 className={theme.classes.heading2 + " mb-6"}>{t("wallet.financialStructure")}</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1 font-bold">
                      <span className="text-[#3174a1] flex items-center gap-2"><IndianRupee className="w-4 h-4"/> Revenue</span>
                      <span className="text-[#1a1a1a]">{formatCur(currentRevenue)}</span>
                    </div>
                    <div className="w-full bg-gray-100 h-4 overflow-hidden border border-gray-200">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(currentRevenue / 80000) * 100}%` }} transition={{ duration: 1 }} className="h-full bg-[#3174a1]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1 font-bold">
                      <span className="text-[#c82b28] flex items-center gap-2"><Store className="w-4 h-4"/> Expenses</span>
                      <span className="text-[#1a1a1a]">{formatCur(currentExpenses)}</span>
                    </div>
                    <div className="w-full bg-gray-100 h-4 overflow-hidden border border-gray-200">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(currentExpenses / 80000) * 100}%` }} transition={{ duration: 1 }} className="h-full bg-[#c82b28]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className={theme.classes.card}>
                 <div className="p-4 border-b border-[#e5e3d7] bg-[#fbfaf5]">
                    <h3 className={theme.classes.heading2}>{t("wallet.whereMoneyWent")}</h3>
                 </div>
                 <div className="p-0">
                    <table className="w-full text-left border-collapse">
                      <tbody className="text-sm font-hind">
                        <tr className="border-b border-[#e5e3d7] hover:bg-gray-50 transition-colors">
                          <td className="p-4 font-bold text-[#1a1a1a] flex items-center gap-3">
                             <div className="w-8 h-8 bg-[#c82b28]/10 text-[#c82b28] flex items-center justify-center border border-[#c82b28]/20"><Store className="w-4 h-4" /></div>
                             Sold below MSP
                          </td>
                          <td className="p-4 text-right font-bold text-[#c82b28]">- {formatCur(baseData.mandiLoss)}</td>
                        </tr>
                        <tr className="border-b border-[#e5e3d7] hover:bg-gray-50 transition-colors">
                          <td className="p-4 font-bold text-[#1a1a1a] flex items-center gap-3">
                             <div className="w-8 h-8 bg-[#e18b2c]/10 text-[#e18b2c] flex items-center justify-center border border-[#e18b2c]/20"><AlertTriangle className="w-4 h-4" /></div>
                             High Pesticide Cost
                          </td>
                          <td className="p-4 text-right font-bold text-[#e18b2c]">- {formatCur(baseData.pesticideLoss)}</td>
                        </tr>
                      </tbody>
                    </table>
                 </div>
              </div>

            </div>

            <div className="space-y-6">
              
              <div className="bg-white border-2 border-[#13311c] shadow-md relative overflow-hidden">
                <div className="bg-[#13311c] p-3 text-white flex items-center gap-2">
                   <Activity className="w-5 h-5 text-[#d4cb7e]" />
                   <h3 className="font-bold text-sm uppercase tracking-wider">{t("wallet.whatIfSimulator")}</h3>
                </div>
                <div className="p-5 space-y-5">
                   <label className="flex items-start gap-3 cursor-pointer group">
                     <div className="relative flex items-center pt-1">
                       <input type="checkbox" className="sr-only" checked={soldInBetterMandi} onChange={() => setSoldInBetterMandi(!soldInBetterMandi)} />
                       <div className={`w-10 h-5 border transition-colors ${soldInBetterMandi ? 'bg-[#408447] border-[#408447]' : 'bg-gray-100 border-gray-300'} relative`}>
                         <div className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 bg-white shadow-sm transition-transform ${soldInBetterMandi ? 'translate-x-5' : 'translate-x-0'}`} />
                       </div>
                     </div>
                     <div className="flex-1">
                       <span className="block text-sm font-bold text-[#1a1a1a] group-hover:text-[#408447] transition-colors">If sold in Nashik Mandi</span>
                       <span className="block text-xs text-[#408447] font-bold mt-1">+ {formatCur(baseData.mandiLoss)}</span>
                     </div>
                   </label>
                   <label className="flex items-start gap-3 cursor-pointer group">
                     <div className="relative flex items-center pt-1">
                       <input type="checkbox" className="sr-only" checked={reducedInputCost} onChange={() => setReducedInputCost(!reducedInputCost)} />
                       <div className={`w-10 h-5 border transition-colors ${reducedInputCost ? 'bg-[#408447] border-[#408447]' : 'bg-gray-100 border-gray-300'} relative`}>
                         <div className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 bg-white shadow-sm transition-transform ${reducedInputCost ? 'translate-x-5' : 'translate-x-0'}`} />
                       </div>
                     </div>
                     <div className="flex-1">
                       <span className="block text-sm font-bold text-[#1a1a1a] group-hover:text-[#408447] transition-colors">If bought at MSP</span>
                       <span className="block text-xs text-[#408447] font-bold mt-1">+ {formatCur(baseData.pesticideLoss)}</span>
                     </div>
                   </label>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs uppercase font-bold tracking-widest text-[#666666] ml-1">{t("wallet.takeAction")}</h3>
                <button 
                  onClick={() => onNavigate("mandi")}
                  className="w-full text-left bg-white border border-[#e5e3d7] p-3 hover:border-[#386542] hover:shadow-md transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#f1f8f3] text-[#408447] border border-[#408447]/20 flex items-center justify-center shrink-0"><MapPin className="w-4 h-4"/></div>
                    <div>
                      <p className="text-sm font-bold text-[#1a1a1a]">{t("mandi.title")}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#408447] transition-colors" />
                </button>
              </div>

            </div>

          </div>
        </motion.div>
      )}

    </div>
  );
};

export default FarmerWallet;
