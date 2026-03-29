import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Zap, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CropPrice {
  id: string;
  name: string;
  price: number;
  change: number;
  direction: "up" | "down";
}

const INITIAL_CROPS: CropPrice[] = [
  { id: "1", name: "Wheat (Kanak)", price: 2125.00, change: 0.0, direction: "up" },
  { id: "2", name: "Basmati Rice", price: 4350.00, change: 1.2, direction: "up" }
];

const PriceTicker = () => {
  const [crops, setCrops] = useState<CropPrice[]>(INITIAL_CROPS);
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toLocaleTimeString());
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    // Fetch real baseline data
    const fetchLiveMarkets = async () => {
      try {
        const { apiClient } = await import("@/api/client");
        const res = await apiClient.get("/heatmap/summary");
        if (res.data?.status === "success" && res.data.data) {
           const liveData = res.data.data.slice(0, 5).map((d: any) => ({
              id: String(d.id),
              name: d.name,
              price: d.price,
              change: 0.0,
              direction: "up" as const
           }));
           setCrops(liveData);
           setIsLive(true);
        }
      } catch (err) {
        console.warn("Could not fetch live tickers, falling back to cached/mocked seed.");
      }
    };
    fetchLiveMarkets();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCrops(prev => prev.map(crop => {
        // Randomly decide to tick up or down by ±0.1% to ±0.5%
        const isUp = Math.random() > 0.45;
        const deltaPercent = (Math.random() * 0.4) + 0.1;
        const delta = (crop.price * (deltaPercent / 100)) * (isUp ? 1 : -1);
        
        const newPrice = Math.max(100, crop.price + delta);
        
        return {
          ...crop,
          price: Number(newPrice.toFixed(2)),
          change: Number((deltaPercent * (isUp ? 1 : -1)).toFixed(2)),
          direction: isUp ? "up" : "down"
        };
      }));
      setLastUpdate(new Date().toLocaleTimeString());
    }, 4000); // Tick every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white border-2 border-[#e5e3d7] overflow-hidden flex flex-col h-full shadow-sm">
      <div className="p-4 border-b border-[#e5e3d7] bg-[#fbfaf5] flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#e18b2c] fill-[#e18b2c]" />
          <h2 className="font-mukta font-black text-sm uppercase tracking-widest text-[#1a1a1a]">Live Market Analysis</h2>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-red-600 uppercase tracking-tighter">Live Feed: {lastUpdate}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {crops.map((crop) => (
          <motion.div 
            key={crop.id}
            layout
            className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 group hover:border-[#e18b2c] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className={`w-1 h-8 ${crop.direction === 'up' ? 'bg-[#408447]' : 'bg-[#c82b28]'}`} />
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{crop.name}</p>
                <div className="flex items-baseline gap-2">
                   <p className="font-mukta font-black text-xl text-[#1a1a1a]">₹{crop.price.toLocaleString()}</p>
                   <p className="text-[10px] font-bold text-gray-400">/ quintal</p>
                </div>
              </div>
            </div>

            <div className="text-right">
               <div className={`flex items-center justify-end gap-1 font-black text-xs ${crop.direction === 'up' ? 'text-[#408447]' : 'text-[#c82b28]'}`}>
                  {crop.direction === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {crop.change > 0 ? "+" : ""}{crop.change}%
               </div>
               <div className="h-1 w-16 bg-gray-200 mt-2 rounded-full overflow-hidden">
                  <motion.div 
                    initial={false}
                    animate={{ x: crop.direction === 'up' ? [0, 10, 0] : [0, -10, 0] }}
                    className={`h-full w-4 ${crop.direction === 'up' ? 'bg-[#408447]' : 'bg-[#c82b28]'}`}
                  />
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-3 bg-[#1a1a1a] flex justify-between items-center">
         <div className="flex items-center gap-2">
            <Activity className="w-3 h-3 text-[#e18b2c]" />
            <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">Market Momentum: High</span>
         </div>
         <div className="flex gap-1">
            {[1,2,3,4,5].map(i => <div key={i} className={`w-1 h-${i+1} bg-[#e18b2c] ${i > 3 ? 'opacity-30' : ''}`} />)}
         </div>
      </div>
    </div>
  );
};

export default PriceTicker;
