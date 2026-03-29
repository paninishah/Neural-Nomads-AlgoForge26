import { useState, useEffect, useMemo } from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from "recharts";
import { TrendingUp, TrendingDown, Activity, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface PricePoint {
  time: string;
  price: number;
}

interface CropData {
  name: string;
  currentPrice: number;
  history: PricePoint[];
  color: string;
}

const INITIAL_DATA: CropData[] = [
  {
    name: "Wheat (Kanak)",
    currentPrice: 2125,
    color: "#408447",
    history: Array.from({ length: 12 }, (_, i) => ({
      time: `${i}:00`,
      price: 2100 + Math.random() * 50
    }))
  },
  {
    name: "Basmati Rice",
    currentPrice: 4350,
    color: "#3174a1",
    history: Array.from({ length: 12 }, (_, i) => ({
      time: `${i}:00`,
      price: 4300 + Math.random() * 100
    }))
  }
];

export default function PriceChart() {
  const [data, setData] = useState<CropData[]>(INITIAL_DATA);
  const [activeCrop, setActiveCrop] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => prev.map((crop, idx) => {
        const volatility = idx === 0 ? 5 : 15;
        const change = (Math.random() - 0.48) * volatility;
        const newPrice = Math.max(100, crop.currentPrice + change);
        
        const newHistory = [...crop.history.slice(1), {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          price: Number(newPrice.toFixed(2))
        }];

        return {
          ...crop,
          currentPrice: Number(newPrice.toFixed(2)),
          history: newHistory
        };
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const currentCrop = data[activeCrop];
  const priceChange = currentCrop.currentPrice - currentCrop.history[0].price;
  const isUp = priceChange >= 0;

  return (
    <div className="bg-white border-2 border-[#e5e3d7] shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-[#e5e3d7] bg-[#fbfaf5] flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#408447]" />
          <h2 className="font-mukta font-black text-sm uppercase tracking-widest text-[#1a1a1a]">
            Live Market Momentum
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-red-600 uppercase tracking-tighter">Live Dataset Feed</span>
        </div>
      </div>

      {/* Selector & Stats */}
      <div className="p-4 flex flex-wrap gap-4 items-end border-b border-gray-50">
        <div className="flex gap-1 bg-gray-100 p-1 border border-gray-200">
          {data.map((crop, i) => (
            <button
              key={crop.name}
              onClick={() => setActiveCrop(i)}
              className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                activeCrop === i ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {crop.name.split(' ')[0]}
            </button>
          ))}
        </div>

        <div className="ml-auto text-right">
          <div className="flex items-center justify-end gap-2">
            <span className={`text-xs font-black flex items-center gap-1 ${isUp ? "text-[#408447]" : "text-[#c82b28]"}`}>
              {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isUp ? "+" : ""}{((priceChange / currentCrop.history[0].price) * 100).toFixed(2)}%
            </span>
            <p className="font-mukta font-black text-2xl text-[#1a1a1a]">
              ₹{currentCrop.currentPrice.toLocaleString()}
            </p>
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Current Per Quintal</p>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[200px] p-4 pt-6 relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%">
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={currentCrop.history}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentCrop.color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={currentCrop.color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis 
              dataKey="time" 
              hide 
            />
            <YAxis 
              domain={['auto', 'auto']} 
              orientation="right"
              tick={{ fontSize: 10, fontWeight: 'bold', fill: '#999' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => `₹${val}`}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '0', 
                border: '2px solid #e5e3d7',
                fontSize: '12px',
                fontWeight: 'bold',
                fontFamily: 'Hind, sans-serif'
              }}
              labelStyle={{ color: '#999', fontSize: '10px', marginBottom: '4px' }}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke={currentCrop.color} 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorPrice)" 
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="p-3 bg-[#1a1a1a] flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Zap className="w-3 h-3 text-[#d4cb7e] fill-[#d4cb7e]" />
          <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">
            Market Volatility: {activeCrop === 0 ? "Low" : "Moderate"}
          </span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(i => (
            <div 
              key={i} 
              className={`w-1 h-${i + 1} bg-[#d4cb7e] ${i > (activeCrop === 0 ? 2 : 4) ? 'opacity-20' : ''}`} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
