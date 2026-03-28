import { useState } from "react";
import { MapPin, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import ScreenHeader from "./ScreenHeader";
import VoiceButton from "./VoiceButton";

const nearbyMandis = [
  { name: "Azadpur Mandi", distance: 12, price: 2220, best: true },
  { name: "Ghazipur Mandi", distance: 18, price: 2190 },
  { name: "Tikri Mandi", distance: 25, price: 2150 },
];

const crops = [
  { name: "Wheat", your: 1930, market: 2180 },
  { name: "Rice", your: 2100, market: 2350 },
  { name: "Mustard", your: 4800, market: 5200 },
];

const trend = [1950, 2020, 1980, 2050, 2120, 2080, 2180];

export default function MandiPage({ onBack }: any) {
  const [selected, setSelected] = useState(0);
  const crop = crops[selected];
  const diff = crop.market - crop.your;

  return (
    <div className="min-h-screen pb-32 relative bg-gradient-to-b from-[#f5f7f4] via-[#eef3ef] to-[#e8efe9]">

      {/* 🌿 Glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-green-300/20 blur-3xl rounded-full" />
        <div className="absolute bottom-[-120px] right-[-100px] w-[300px] h-[300px] bg-yellow-300/20 blur-3xl rounded-full" />
      </div>

      <ScreenHeader onBack={onBack} title="Market Intelligence" icon="📊" />

      <div className="px-5 mt-4 space-y-5">

        {/* 🌟 HERO DECISION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-600 to-green-700 text-white p-5 rounded-2xl shadow-xl"
        >
          <p className="text-sm opacity-80">Smart Insight</p>
          <h2 className="text-xl font-bold mt-1">
            Earn ₹{diff} more per quintal
          </h2>
          <p className="text-xs opacity-80 mt-1">
            Sell in Azadpur mandi
          </p>
        </motion.div>

        {/* 🌾 CROP SELECTOR */}
        <div className="flex gap-2">
          {crops.map((c, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`flex-1 py-2 rounded-xl font-semibold ${
                selected === i
                  ? "bg-green-700 text-white"
                  : "bg-white/80 backdrop-blur border"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* 📍 MANDIS */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Nearby Mandis</h3>
          <div className="space-y-2">
            {nearbyMandis.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-4 rounded-2xl flex justify-between items-center ${
                  m.best
                    ? "bg-green-100 border-2 border-green-500 scale-[1.02]"
                    : "bg-white/80 border"
                }`}
              >
                <div>
                  <p className="font-bold">{m.name}</p>
                  <p className="text-xs text-gray-500">{m.distance} km away</p>
                </div>

                <div className="text-right">
                  <p className="font-bold">₹{m.price}</p>
                  {m.best && (
                    <p className="text-xs text-green-600 font-semibold">
                      BEST +₹{m.price - crop.your}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 📊 PRICE COMPARISON */}
        <div className="bg-white/80 backdrop-blur rounded-2xl p-4 border">
          <h3 className="font-semibold mb-3">Your Price vs Market</h3>

          {/* Your */}
          <div className="mb-3">
            <div className="flex justify-between text-sm">
              <span>You</span>
              <span>₹{crop.your}</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 transition-all duration-700"
                style={{ width: `${(crop.your / crop.market) * 100}%` }}
              />
            </div>
          </div>

          {/* Market */}
          <div>
            <div className="flex justify-between text-sm">
              <span>Market</span>
              <span>₹{crop.market}</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full">
              <div className="h-full bg-green-600 w-full" />
            </div>
          </div>

          <div className="mt-3 text-red-600 font-semibold flex items-center gap-2">
            <TrendingDown className="w-4 h-4" />
            You are losing ₹{diff}
          </div>
        </div>

        {/* 📈 TREND */}
        <div className="bg-white/80 rounded-2xl p-4 border">
          <h3 className="font-semibold mb-3">7-Day Trend</h3>

          <div className="flex items-end gap-1 h-24">
            {trend.map((v, i) => {
              const min = Math.min(...trend);
              const max = Math.max(...trend);
              const h = ((v - min) / (max - min)) * 80 + 20;

              return (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  className={`flex-1 rounded-t ${
                    i === trend.length - 1
                      ? "bg-green-600"
                      : "bg-green-300"
                  }`}
                />
              );
            })}
          </div>

          <div className="mt-3 flex items-center gap-2 text-green-600 font-semibold">
            <TrendingUp className="w-4 h-4" />
            +₹{trend[trend.length - 1] - trend[0]} in 7 days
          </div>
        </div>

        {/* 🤖 AI */}
        <div className="bg-green-50 border-l-4 border-green-600 rounded-2xl p-4">
          <h3 className="font-bold text-green-800">AI Recommendation</h3>
          <p className="mt-1 text-sm">
            <span className="font-bold">WAIT 2 DAYS</span> — price expected ₹2250
          </p>
        </div>

        {/* 💬 NEGOTIATION */}
        <div className="bg-yellow-50 border rounded-2xl p-4">
          <h3 className="font-semibold mb-2">Negotiation Script</h3>
          <p className="italic text-sm">
            "Bhaiya mandi mein ₹2180 chal raha hai, aap kam de rahe ho."
          </p>
        </div>
      </div>

      {/* 🎤 VOICE */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
        <div className="bg-green-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
          <VoiceButton size="sm" />
          Ask by voice
        </div>
      </div>
    </div>
  );
}