import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { theme } from "@/designSystem";
import { 
  IndianRupee, TrendingUp, TrendingDown, Info, 
  MapPin, Store, AlertTriangle, ArrowRight, Activity, Calendar
} from "lucide-react";

interface FarmerWalletProps {
  onNavigate: (s: any) => void;
}

const FarmerWallet = ({ onNavigate }: FarmerWalletProps) => {
  const [phase, setPhase] = useState<"input" | "calculating" | "dashboard">("input");
  
  // What-If Simulator States
  const [soldInBetterMandi, setSoldInBetterMandi] = useState(false);
  const [reducedInputCost, setReducedInputCost] = useState(false);
  
  // Base Data Model
  const baseData = {
    revenue: 42000,
    expenses: 48000,
    mandiLoss: 8000,
    pesticideLoss: 3000,
    transportCost: 1000
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
            <h2 className={theme.classes.heading1}>Season Financial Entry</h2>
            <p className={theme.classes.bodyText + " mt-1"}>Enter your harvest details to unlock deep profit intelligence.</p>
          </div>
          
          <div className="space-y-5">
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-xs font-bold uppercase text-[#666666] mb-1">Crop Type</label>
                 <div className={theme.classes.inputWrapper}>
                   <input type="text" defaultValue="Wheat" className={theme.classes.inputText} />
                 </div>
               </div>
               <div>
                 <label className="block text-xs font-bold uppercase text-[#666666] mb-1">Quantity (Quintals)</label>
                 <div className={theme.classes.inputWrapper}>
                   <input type="number" defaultValue={20} className={theme.classes.inputText} />
                 </div>
               </div>
             </div>
             
             <div>
               <label className="block text-xs font-bold uppercase text-[#666666] mb-1">Total Sold For (Revenue - ₹)</label>
               <div className={theme.classes.inputWrapper}>
                 <IndianRupee className="w-4 h-4 text-gray-400 ml-3" />
                 <input type="number" defaultValue={42000} className={theme.classes.inputText} />
               </div>
             </div>

             <div>
               <label className="block text-xs font-bold uppercase text-[#666666] mb-1">Total Expenses (Seeds, Fertilizer, etc. - ₹)</label>
               <div className={theme.classes.inputWrapper}>
                 <IndianRupee className="w-4 h-4 text-gray-400 ml-3" />
                 <input type="number" defaultValue={48000} className={theme.classes.inputText} />
               </div>
             </div>

             <button 
               onClick={() => {
                 setPhase("calculating");
                 setTimeout(() => setPhase("dashboard"), 2500);
               }}
               className={theme.classes.btnPrimary + " w-full py-3 mt-4 text-lg"}
             >
               Generate Profit Intelligence
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
            <h2 className={theme.classes.heading2 + " tracking-wide animate-pulse"}>Running Financial Models...</h2>
            <p className={theme.classes.caption}>Comparing constraints against regional Mandy data</p>
         </div>
      )}

      {/* PHASE 3: DASHBOARD */}
      {phase === "dashboard" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          
          {/* 1. HERO SECTION */}
          <div className={`${theme.classes.card} p-8 relative overflow-hidden flex flex-col items-center justify-center min-h-[200px]`}>
            {/* Flat Gradient Background tailored to OS Design */}
            <div className={`absolute inset-0 z-0 transition-colors duration-1000 ${currentProfit >= 0 ? 'bg-gradient-to-br from-[#f1f8f3] to-[#e4f1e8]' : 'bg-gradient-to-br from-[#fdf2f2] to-[#fae1e1]'}`} />
            
            <div className="relative z-10 text-center">
              <h2 className="text-[#666666] uppercase font-bold tracking-widest text-sm mb-2">Net Season Outcome</h2>
              <div className={`text-6xl md:text-8xl font-black font-mukta tracking-tighter ${currentProfit >= 0 ? 'text-[#408447]' : 'text-[#c82b28]'}`}>
                 {currentProfit < 0 && "-"}<AnimatedCounter value={Math.abs(currentProfit)} />
              </div>
              <div className="mt-4 flex items-center justify-center gap-2">
                 {currentProfit >= 0 
                   ? <span className="flex items-center gap-1 bg-white border border-[#408447]/30 text-[#408447] px-3 py-1 font-bold text-sm shadow-sm"><TrendingUp className="w-4 h-4"/> +15% from last season</span>
                   : <span className="flex items-center gap-1 bg-white border border-[#c82b28]/30 text-[#c82b28] px-3 py-1 font-bold text-sm shadow-sm"><TrendingDown className="w-4 h-4"/> Severe Loss Detected</span>
                 }
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 2 & 4. PROFIT BREAKDOWN & LOSS ANALYSIS (Left Column) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* 3. IMPACT INSIGHT (MUST STAND OUT) */}
              {currentProfit < 0 ? (
                <div className="bg-[#13311c] text-white p-6 border-l-4 border-[#e18b2c] relative overflow-hidden shadow-lg shadow-[#13311c]/20">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-[#e18b2c]/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="bg-[#e18b2c]/20 p-2 border border-[#e18b2c]/30 text-[#e18b2c]">
                      <Info className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#d4cb7e] text-xs uppercase tracking-widest mb-1">What Happened?</h3>
                      <p className="font-hind text-xl font-medium leading-snug">
                        You lost <span className="text-white font-bold">{formatCur(Math.abs(currentProfit))}</span> primarily due to selling below average market prices and severe input inefficiencies.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-[#13311c] text-white p-6 border-l-4 border-[#408447] relative overflow-hidden shadow-lg shadow-[#13311c]/20">
                   <div className="absolute right-0 top-0 w-32 h-32 bg-[#408447]/10 rounded-full blur-2xl pointer-events-none" />
                   <div className="flex items-start gap-4 relative z-10">
                    <div className="bg-[#408447]/20 p-2 border border-[#408447]/30 text-[#408447]">
                      <Info className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#d4cb7e] text-xs uppercase tracking-widest mb-1">Great Job!</h3>
                      <p className="font-hind text-xl font-medium leading-snug">
                        You're operating at a <span className="text-white font-bold">profit</span>! Optimization strategies shown below can stretch limits even further next season.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. PROFIT BREAKDOWN (Bars) */}
              <div className={theme.classes.card + " p-6"}>
                <h3 className={theme.classes.heading2 + " mb-6"}>Financial Structure</h3>
                
                <div className="space-y-4">
                  {/* Revenue Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1 font-bold">
                      <span className="text-[#3174a1] flex items-center gap-2"><IndianRupee className="w-4 h-4"/> Revenue</span>
                      <span className="text-[#1a1a1a]">{formatCur(currentRevenue)}</span>
                    </div>
                    <div className="w-full bg-gray-100 h-4 overflow-hidden border border-gray-200">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(currentRevenue / 80000) * 100}%` }} transition={{ duration: 1 }} className="h-full bg-[#3174a1]" />
                    </div>
                  </div>

                  {/* Expenses Bar */}
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

              {/* 4. LOSS ANALYSIS / WHERE MONEY WENT */}
              <div className={theme.classes.card}>
                 <div className="p-4 border-b border-[#e5e3d7] bg-[#fbfaf5]">
                    <h3 className={theme.classes.heading2}>Where Your Money Went</h3>
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
                             High Pesticide Cost (Overpaid)
                          </td>
                          <td className="p-4 text-right font-bold text-[#e18b2c]">- {formatCur(baseData.pesticideLoss)}</td>
                        </tr>
                        <tr className="border-b border-[#e5e3d7] hover:bg-gray-50 transition-colors">
                          <td className="p-4 font-bold text-[#1a1a1a] flex items-center gap-3">
                             <div className="w-8 h-8 bg-gray-100 text-gray-600 flex items-center justify-center border border-gray-200"><Activity className="w-4 h-4" /></div>
                             Standard Transport
                          </td>
                          <td className="p-4 text-right font-bold text-gray-600">- {formatCur(baseData.transportCost)}</td>
                        </tr>
                      </tbody>
                    </table>
                 </div>
              </div>

               {/* 9. SEASON TRACKING HISTORY */}
              <div className={theme.classes.card + " p-6"}>
                 <h3 className={theme.classes.heading2 + " mb-4 flex items-center gap-2"}><Calendar className="w-5 h-5 text-[#386542]" /> Performance Over Time</h3>
                 <div className="h-[120px] relative border-b border-l border-gray-300 w-full ml-2">
                    {/* Mock simple bar chart */}
                    <div className="absolute bottom-0 left-[20%] w-16 bg-gray-300 border border-gray-400 h-[60%] flex items-end justify-center pb-2 text-xs font-bold text-gray-700">Last</div>
                    <div className="absolute bottom-0 left-[60%] w-16 bg-[#c82b28] border border-[#a3221f] h-[40%] flex items-end justify-center pb-2 text-xs font-bold text-white shadow-inner">Current</div>
                 </div>
              </div>

            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-6">
              
              {/* 7. WHAT-IF SIMULATOR */}
              <div className="bg-white border-2 border-[#13311c] shadow-md relative overflow-hidden">
                <div className="bg-[#13311c] p-3 text-white flex items-center gap-2">
                   <Activity className="w-5 h-5 text-[#d4cb7e]" />
                   <h3 className="font-bold text-sm uppercase tracking-wider">What-If Simulator</h3>
                </div>
                <div className="p-5 space-y-5">
                   <p className="text-sm font-hind text-[#666666]">Toggle variables to see how decisions could have changed your profit.</p>
                   
                   <label className="flex items-start gap-3 cursor-pointer group">
                     <div className="relative flex items-center pt-1">
                       <input type="checkbox" className="sr-only" checked={soldInBetterMandi} onChange={() => setSoldInBetterMandi(!soldInBetterMandi)} />
                       <div className={`w-10 h-5 border transition-colors ${soldInBetterMandi ? 'bg-[#408447] border-[#408447]' : 'bg-gray-100 border-gray-300'} relative`}>
                         <div className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 bg-white shadow-sm transition-transform ${soldInBetterMandi ? 'translate-x-5' : 'translate-x-0'}`} />
                       </div>
                     </div>
                     <div className="flex-1">
                       <span className="block text-sm font-bold text-[#1a1a1a] group-hover:text-[#408447] transition-colors">If sold in Nashik Mandi</span>
                       <span className="block text-xs text-[#408447] font-bold mt-1">+ {formatCur(baseData.mandiLoss)} Revenue</span>
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
                       <span className="block text-sm font-bold text-[#1a1a1a] group-hover:text-[#408447] transition-colors">If bought inputs at MSP</span>
                       <span className="block text-xs text-[#408447] font-bold mt-1">+ {formatCur(baseData.pesticideLoss)} Saved Expenses</span>
                     </div>
                   </label>
                </div>
              </div>

              {/* 5. COMPARISON ENGINE */}
              <div className={theme.classes.card + " bg-[#fefdf9]"}>
                 <div className="p-4 border-b border-[#e5e3d7]">
                    <h3 className={theme.classes.heading2}>How You Compare</h3>
                 </div>
                 <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between items-center gap-3">
                       <p className="text-sm font-bold font-hind text-[#1a1a1a]">Nearby Farmers Earned</p>
                       <span className="px-2 py-1 bg-red-100 text-red-600 border border-red-200 text-xs font-bold uppercase shrink-0">22% More</span>
                    </div>
                    <div className="flex items-center justify-between items-center gap-3">
                       <p className="text-sm font-bold font-hind text-[#1a1a1a]">Nashik Mandi Avg.</p>
                       <span className="px-2 py-1 bg-red-100 text-red-600 border border-red-200 text-xs font-bold uppercase shrink-0">18% Higher</span>
                    </div>
                 </div>
              </div>

              {/* 8. INTEGRATIONS */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase font-bold tracking-widest text-[#666666] ml-1">Take Action Now</h3>
                
                <button 
                  onClick={() => onNavigate("mandi")}
                  className="w-full text-left bg-white border border-[#e5e3d7] p-3 hover:border-[#386542] hover:shadow-md transition-all group relative overflow-hidden flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#f1f8f3] text-[#408447] border border-[#408447]/20 flex items-center justify-center shrink-0"><MapPin className="w-4 h-4"/></div>
                    <div>
                      <p className="text-sm font-bold text-[#1a1a1a]">Market Intelligence</p>
                      <p className="text-xs text-[#666666]">Better price available nearby</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#408447] transition-colors" />
                </button>

                <button 
                  onClick={() => onNavigate("fraud")}
                  className="w-full text-left bg-white border border-[#e5e3d7] p-3 hover:border-[#386542] hover:shadow-md transition-all group relative overflow-hidden flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#fdf2f2] text-[#c82b28] border border-[#c82b28]/20 flex items-center justify-center shrink-0"><AlertTriangle className="w-4 h-4"/></div>
                    <div>
                      <p className="text-sm font-bold text-[#1a1a1a]">Input Verification</p>
                      <p className="text-xs text-[#666666]">You overpaid for pesticide</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#c82b28] transition-colors" />
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
