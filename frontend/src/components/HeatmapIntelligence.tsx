import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, ShieldAlert, Landmark, Scale, MapPin, Info, ChevronUp, AlertTriangle, CheckCircle2 } from "lucide-react";

type Layer = "market" | "fraud" | "loan" | "legal";

// Define the data associated with each layer for 5 abstract "zones"
const zonesData = {
  market: {
    theme: "from-emerald-900 via-green-900 to-emerald-950",
    glowBase: "bg-green-500",
    gradientText: "bg-gradient-to-r from-green-400 to-emerald-200",
    title: "Market Intelligence",
    icon: TrendingUp,
    zones: [
      { id: 1, name: "North Sector", intensity: 0.2, x: 20, y: 20, value: "₹2,050", insight: "Low demand, hold crops", status: "low" },
      { id: 2, name: "Central Mandi", intensity: 0.8, x: 50, y: 45, value: "₹2,350", insight: "📈 Sell now: Prices here are 15% higher", status: "high" },
      { id: 3, name: "East Hub", intensity: 0.5, x: 80, y: 30, value: "₹2,180", insight: "Stable prices, standard rate", status: "medium" },
      { id: 4, name: "West Gate", intensity: 0.3, x: 30, y: 70, value: "₹2,100", insight: "Market cooling down", status: "low" },
      { id: 5, name: "South Market", intensity: 0.9, x: 75, y: 75, value: "₹2,400", insight: "🔥 High bulk buyer demand detected", status: "high" },
    ],
    panelInsights: "Prices in Central and South have spiked 15%. Direct your logistics towards these high-paying zones.",
    legend: { low: "Low Price", high: "Premium Price", gradient: "from-green-200 via-yellow-400 to-red-500" } // Prompt: Green -> Yellow -> Red
  },
  fraud: {
    theme: "from-gray-900 via-neutral-900 to-black",
    glowBase: "bg-orange-500",
    gradientText: "bg-gradient-to-r from-orange-400 to-red-400",
    title: "Fraud Activity",
    icon: ShieldAlert,
    zones: [
      { id: 1, name: "North Sector", intensity: 0.1, x: 20, y: 20, value: "1 Report", insight: "Sector clear, verified sellers", status: "low" },
      { id: 2, name: "Central Mandi", intensity: 0.4, x: 50, y: 45, value: "4 Reports", insight: "Watch out for unverified seed packets", status: "medium" },
      { id: 3, name: "East Hub", intensity: 0.9, x: 80, y: 30, value: "12 Reports", insight: "⚠️ High fake pesticide activity. Avoid unknown sellers.", status: "high" },
      { id: 4, name: "West Gate", intensity: 0.2, x: 30, y: 70, value: "2 Reports", insight: "Normal activity", status: "low" },
      { id: 5, name: "South Market", intensity: 0.7, x: 75, y: 75, value: "8 Reports", insight: "Fake fertilizer batches detected recently", status: "high" },
    ],
    panelInsights: "⚠️ High fake pesticide activity detected in the East Hub. Avoid buying from unknown sellers.",
    legend: { low: "Safe", high: "Danger", gradient: "from-green-400 via-orange-500 to-red-600" } // Prompt: Green -> Orange -> Red
  },
  loan: {
    theme: "from-indigo-950 via-slate-900 to-indigo-950",
    glowBase: "bg-blue-400",
    gradientText: "bg-gradient-to-r from-blue-300 to-cyan-300",
    title: "Loan Approvals",
    icon: Landmark,
    zones: [
      { id: 1, name: "North Sector", intensity: 0.3, x: 20, y: 20, value: "34% Approved", insight: "Banks rejecting due to low CIBIL", status: "low" },
      { id: 2, name: "Central Mandi", intensity: 0.8, x: 50, y: 45, value: "82% Approved", insight: "SBI KCC processing rapidly", status: "high" },
      { id: 3, name: "East Hub", intensity: 0.6, x: 80, y: 30, value: "65% Approved", insight: "Normal approval rate", status: "medium" },
      { id: 4, name: "West Gate", intensity: 0.9, x: 30, y: 70, value: "91% Approved", insight: "Special cooperative scheme active here", status: "high" },
      { id: 5, name: "South Market", intensity: 0.2, x: 75, y: 75, value: "20% Approved", insight: "High default zone, strictly monitored", status: "low" },
    ],
    panelInsights: "West Gate and Central Mandi show very high KCC loan approval rates this week. Submit files there.",
    legend: { low: "Rejection Risk", high: "High Approval", gradient: "from-red-500 via-yellow-400 to-green-500" } // Prompt: Red -> Yellow -> Green
  },
  legal: {
    theme: "from-amber-950 via-orange-950 to-red-950",
    glowBase: "bg-red-500",
    gradientText: "bg-gradient-to-r from-yellow-400 to-orange-500",
    title: "Legal Dispute Index",
    icon: Scale,
    zones: [
      { id: 1, name: "North Sector", intensity: 0.8, x: 20, y: 20, value: "14 Cases", insight: "High volume of land border disputes", status: "high" },
      { id: 2, name: "Central Mandi", intensity: 0.3, x: 50, y: 45, value: "3 Cases", insight: "Minor vendor payment issues", status: "low" },
      { id: 3, name: "East Hub", intensity: 0.5, x: 80, y: 30, value: "7 Cases", insight: "Contract farming disputes", status: "medium" },
      { id: 4, name: "West Gate", intensity: 0.1, x: 30, y: 70, value: "1 Case", insight: "Peaceful zone", status: "low" },
      { id: 5, name: "South Market", intensity: 0.9, x: 75, y: 75, value: "21 Cases", insight: "Severe pending court litigations regarding MSP", status: "high" },
    ],
    panelInsights: "South and North sectors are burdened with severe disputes. Keep proper documentation if trading there.",
    legend: { low: "Minor Issues", high: "Severe Risk", gradient: "from-yellow-400 via-orange-500 to-red-600" } // Prompt: Yellow -> Orange -> Red
  }
};

const HeatmapIntelligence = ({ onBack }) => {
  const [layer, setLayer] = useState<Layer>("market");
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial load simulation
    const t = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(t);
  }, []);

  const data = zonesData[layer];
  const LayerIcon = data.icon;

  const getStatusColor = (status: string, opacity: string = "1") => {
    const baseColor = layer === "market" || layer === "loan" ? 
      (status === "high" ? `rgba(34, 197, 94, ${opacity})` : status === "medium" ? `rgba(234, 179, 8, ${opacity})` : `rgba(239, 68, 68, ${opacity})`)
      : 
      (status === "high" ? `rgba(239, 68, 68, ${opacity})` : status === "medium" ? `rgba(249, 115, 22, ${opacity})` : `rgba(34, 197, 94, ${opacity})`);
    
    // Quick translation for different layer meanings based on gradient mappings in Prompt
    if (layer === "market") return status === "high" ? `rgba(239, 68, 68, ${opacity})` : (status === "medium" ? `rgba(234, 179, 8, ${opacity})` : `rgba(34, 197, 94, ${opacity})`); // Market: Green->Yellow->Red
    if (layer === "fraud") return status === "high" ? `rgba(220, 38, 38, ${opacity})` : (status === "medium" ? `rgba(249, 115, 22, ${opacity})` : `rgba(34, 197, 94, ${opacity})`); // Fraud: Green->Orange->Red
    if (layer === "loan") return status === "high" ? `rgba(34, 197, 94, ${opacity})` : (status === "medium" ? `rgba(234, 179, 8, ${opacity})` : `rgba(239, 68, 68, ${opacity})`); // Loan: Red->Yellow->Green
    if (layer === "legal") return status === "high" ? `rgba(220, 38, 38, ${opacity})` : (status === "medium" ? `rgba(249, 115, 22, ${opacity})` : `rgba(250, 204, 21, ${opacity})`); // Legal: Yellow->Orange->Red
    return `rgba(255, 255, 255, ${opacity})`;
  };

  return (
    <div className={`min-h-screen relative overflow-hidden bg-transparent transition-colors duration-1000`}>
      {/* Grain texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0">
        <div className="w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      {loading ? (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-transparent backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
            className="w-16 h-16 rounded-none bg-[#2d5a27]/10 flex items-center justify-center mb-6"
          >
            <MapPin className="w-8 h-8 text-[#2d5a27]" />
          </motion.div>
          <p className="text-[#1a2f1c] font-mukta font-bold text-xl tracking-wide">Live data loading...</p>
          <p className="text-[#4a5d4e] font-hind text-sm mt-2">showing sample insights</p>
        </div>
      ) : null}

      {/* LAYER CONTROLS */}
      <div className="relative z-40 px-5 py-4 w-full max-w-lg mx-auto">
        {/* PILL-SHAPED LAYER TOGGLE */}
        <div className="bg-white/80 backdrop-blur-xl border border-[#e5e3d7] p-1.5 rounded-none flex shadow-sm relative">
          {(["market", "fraud", "loan", "legal"] as Layer[]).map((l, i) => {
            const isActive = layer === l;
            return (
              <button
                key={l}
                onClick={() => { setLayer(l); setSelectedZone(null); }}
                className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-none relative z-10 transition-all duration-300 ${isActive ? 'text-[#1a2f1c]' : 'text-[#4a5d4e]/60 hover:text-[#4a5d4e]'}`}
              >
                {l === "market" && <TrendingUp className="w-5 h-5 mb-1" />}
                {l === "fraud" && <ShieldAlert className="w-5 h-5 mb-1" />}
                {l === "loan" && <Landmark className="w-5 h-5 mb-1" />}
                {l === "legal" && <Scale className="w-5 h-5 mb-1" />}
                <span className="text-[10px] uppercase font-bold tracking-wider">{l}</span>
                {isActive && (
                  <motion.div
                    layoutId="pillIndicator"
                    className="absolute inset-0 bg-white/60 border border-[#2d5a27]/20 rounded-none -z-10 shadow-sm"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* HEATMAP RENDER AREA */}
      <div className="absolute inset-0 top-[20%] h-[70%] z-10 w-full overflow-hidden" 
           onClick={() => setSelectedZone(null)}> {/* Click outside to dismiss */}
        
        {/* Abstract Grid / Map Glows */}
        <AnimatePresence mode="wait">
          <motion.div
            key={layer}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative w-full h-full"
          >
            {data.zones.map((zone) => {
              const isSelected = selectedZone === zone.id;
              const bgColor = getStatusColor(zone.status, "0.15");
              const strokeColor = getStatusColor(zone.status, "0.6");
              const dotColor = getStatusColor(zone.status, "1");

              return (
                <div key={zone.id} className="absolute" style={{ left: `${zone.x}%`, top: `${zone.y}%`, transform: 'translate(-50%, -50%)' }}>
                  {/* Pulsing Aura */}
                  {zone.status === "high" && (
                    <motion.div
                      animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute w-32 h-32 rounded-none blur-xl pointer-events-none"
                      style={{ backgroundColor: dotColor, left: '-4rem', top: '-4rem' }}
                    />
                  )}
                  
                  {/* Zone Node */}
                  <div
                    onClick={(e) => { e.stopPropagation(); setSelectedZone(zone.id); }}
                    className={`relative cursor-pointer transition-all duration-300 ${isSelected ? 'scale-125 z-50' : 'hover:scale-110'}`}
                  >
                    <div 
                      className="w-16 h-16 rounded-none backdrop-blur-md flex items-center justify-center relative shadow-lg"
                      style={{ backgroundColor: bgColor, border: `1px solid ${strokeColor}` }}
                    >
                      <div className="w-3 h-3 rounded-none" style={{ backgroundColor: dotColor, boxShadow: `0 0 10px ${dotColor}` }} />
                    </div>
                  </div>

                  {/* Floating Glass Card (Hover/Tap Experience) */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="absolute top-1/2 left-1/2 -translate-y-1/2 ml-10 w-48 bg-white/80 backdrop-blur-xl border border-[#2d5a27]/20 rounded-none p-4 shadow-2xl z-50 pointer-events-none"
                      >
                        <h4 className="text-[#1a2f1c] font-mukta font-bold text-lg leading-tight">{zone.name}</h4>
                        <p className="text-[#4a5d4e] text-xs font-bold uppercase tracking-wider mt-1">{data.title}</p>
                        <p className="text-3xl font-mukta font-bold mt-2" style={{ color: dotColor }}>{zone.value}</p>
                        <p className="text-[#1a2f1c] font-bold text-xs font-hind mt-3 leading-snug">{zone.insight}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* FLOATING LEGEND */}
      <div className="absolute top-[35%] left-5 z-20 w-8 flex flex-col items-center gap-2">
        <span className="text-[10px] font-bold text-white/50 uppercase origin-left -rotate-90 whitespace-nowrap mb-6">{data.legend.high}</span>
        <div className={`w-3 h-32 rounded-none bg-gradient-to-b ${data.legend.gradient} shadow-[0_0_15px_rgba(255,255,255,0.1)]`} />
        <span className="text-[10px] font-bold text-white/50 uppercase origin-left -rotate-90 whitespace-nowrap mt-8">{data.legend.low}</span>
      </div>

      {/* INSIGHT ENGINE PANEL (BOTTOM) */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute bottom-0 left-0 w-full z-50 p-4"
          >
            <div className="bg-white/80 backdrop-blur-2xl border border-[#2d5a27]/20 rounded-none p-6 shadow-[0_-10px_40px_rgba(45,90,39,0.1)]">
              <div className="w-12 h-1 bg-[#2d5a27]/20 rounded-none mx-auto mb-5 cursor-pointer" onClick={() => setPanelOpen(false)} />
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-none bg-[#f4f1e1] flex items-center justify-center flex-shrink-0 text-[#2d5a27] shadow-inner">
                  <LayerIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-[#4a5d4e] text-xs uppercase font-bold tracking-widest mb-1">Smart Engine Insight</h3>
                  <p className="text-[#1a2f1c] text-base font-hind leading-relaxed font-bold">
                    {data.panelInsights}
                  </p>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!panelOpen && (
        <button 
          onClick={() => setPanelOpen(true)}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/80 backdrop-blur-xl border border-[#2d5a27]/20 rounded-none px-6 py-3 text-[#1a2f1c] font-bold text-sm shadow-xl flex items-center gap-2 active:scale-95 transition-transform"
        >
          <ChevronUp className="w-4 h-4" /> Expand Insights
        </button>
      )}

    </div>
  );
};

export default HeatmapIntelligence;
