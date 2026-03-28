import { memo } from "react";
import { TrendingUp, Shield, Landmark, Scale, MapPin } from "lucide-react";
import VoiceButton from "./VoiceButton";
import LanguageSwitcher from "./LanguageSwitcher";
import type { Lang } from "@/pages/Index";
import { motion } from "framer-motion";

interface HomeDashboardProps {
  onNavigate: (screen: string) => void;
  lang: Lang;
  onToggleLang: () => void;
}

const content = {
  en: {
    greeting: "Good morning 🌅",
    name: "Namaste, Ramesh ji",
    location: "📍 Baghpat, Uttar Pradesh",
    services: "Services",
    voiceCta: "Ask Annadata",
    trustTitle: "🤝 Trust Network",
    complaints: "complaints",
    trusted: "Trusted",
    stats: [
      { label: "Gehun Rate", value: "₹2,180" },
      { label: "Fraud Alerts", value: "3" },
      { label: "Loan Status", value: "Pending" },
    ],
    cards: [
      { id: "mandi", title: "Market Intelligence", subtitle: "Best mandi available", badge: "Live" },
      { id: "fraud", title: "Input Verification", subtitle: "2 alerts in your area", badge: "Alert" },
      { id: "loan", title: "Loan Guidance", subtitle: "Action needed", badge: "Pending" },
      { id: "legal", title: "Legal Assistance", subtitle: "File complaint easily" },
    ],
  },
};

const cardMeta = [
  { icon: TrendingUp, color: "bg-green-500" },
  { icon: Shield, color: "bg-red-500" },
  { icon: Landmark, color: "bg-yellow-500" },
  { icon: Scale, color: "bg-green-600" },
];

const StatCard = ({ stat, index }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    viewport={{ once: true }}
    className="bg-white/80 backdrop-blur-md rounded-xl p-4 shadow-md border border-white/40 text-center"
  >
    <p className="text-lg font-bold">{stat.value}</p>
    <p className="text-xs text-gray-600">{stat.label}</p>
  </motion.div>
);

const DashboardCard = ({ card, meta, index, onNavigate }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    viewport={{ once: true }}
  >
    <button
      onClick={() => onNavigate(card.id)}
      className="w-full bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-md border border-white/40 hover:shadow-lg hover:bg-white/90 transition-all text-left"
    >
      <div className={`h-1 w-full rounded-full ${meta.color} mb-3`} />

      <div className="flex items-center gap-4">
        <meta.icon className="w-6 h-6 text-gray-700" />

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold">{card.title}</h3>
            {card.badge && (
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                {card.badge}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">{card.subtitle}</p>
        </div>
      </div>
    </button>
  </motion.div>
);

const HomeDashboard = ({ onNavigate, lang, onToggleLang }: HomeDashboardProps) => {
  const t = content.en;

  return (
    <div className="min-h-screen pb-32 relative overflow-hidden bg-gradient-to-b from-[#f5f7f4] via-[#eef3ef] to-[#e8efe9]">

      {/* 🌿 Glow Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-green-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-100px] w-[300px] h-[300px] bg-yellow-300/20 rounded-full blur-3xl" />
      </div>

      {/* 🌾 Grain Texture */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none -z-10">
        <div className="w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      {/* HEADER */}
      <div className="px-5 pt-8 pb-10 bg-gradient-to-r from-green-700 to-green-600 text-white">
        <div className="flex justify-between">
          <p className="text-sm opacity-80">{t.greeting}</p>
          <LanguageSwitcher lang={lang} onToggle={onToggleLang} />
        </div>
        <h2 className="text-2xl font-bold mt-1">{t.name}</h2>
        <p className="text-xs opacity-70">{t.location}</p>
      </div>

      {/* HERO */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-5 -mt-8 bg-gradient-to-r from-green-600 to-green-700 text-white p-5 rounded-2xl shadow-xl"
      >
        <p className="text-sm opacity-80">Today’s Insight</p>
        <h3 className="text-lg font-bold mt-1">
          You are getting ₹250 less for wheat
        </h3>
        <p className="text-xs opacity-70 mt-1">
          Sell in Azadpur mandi to earn more
        </p>
      </motion.div>

      {/* HEATMAP ENTRY POINT */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        onClick={() => onNavigate("heatmap")}
        className="mx-5 mt-6 relative rounded-3xl overflow-hidden shadow-lg cursor-pointer active:scale-[0.98] transition-transform"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-emerald-800 to-green-900" />
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-400 rounded-full blur-3xl opacity-40 pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-yellow-400 rounded-full blur-3xl opacity-30 pointer-events-none" />
        
        <div className="relative p-6 flex flex-col items-center text-center">
           <MapPin className="w-8 h-8 text-green-300 mb-2" />
           <h3 className="font-mukta font-bold text-xl text-white">Your Region Intelligence</h3>
           <p className="font-hind text-green-100/80 text-xs mt-1">Understand risks & opportunities around you instantly</p>
           <div className="mt-4 px-6 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white font-bold text-xs uppercase tracking-wider transition-colors inline-block">
             View Live Map
           </div>
        </div>
      </motion.div>

      {/* STATS */}
      <div className="px-5 mt-6 grid grid-cols-3 gap-3">
        {t.stats.map((stat, i) => (
          <StatCard key={i} stat={stat} index={i} />
        ))}
      </div>

      {/* SERVICES */}
      <div className="px-5 mt-6 space-y-3">
        <h3 className="text-sm font-semibold text-gray-500 uppercase">{t.services}</h3>
        {t.cards.map((card, i) => (
          <DashboardCard key={card.id} card={card} meta={cardMeta[i]} index={i} onNavigate={onNavigate} />
        ))}
      </div>

      {/* SMART SUGGESTION */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="mx-5 mt-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-4"
      >
        <p className="text-sm font-semibold text-yellow-800">💡 Smart Suggestion</p>
        <p className="text-sm text-yellow-700 mt-1">
          Wait 2 days — wheat price expected to increase by 8%
        </p>
      </motion.div>

      {/* TRUST */}
      <div className="px-5 mt-6">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-md border border-white/40">
          <h3 className="text-sm font-bold mb-3">{t.trustTitle}</h3>

          <div className="flex justify-between py-2">
            <span>Rajesh Traders</span>
            <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
              ⚠️ 22 complaints
            </span>
          </div>

          <div className="flex justify-between py-2">
            <span>Sharma Seeds</span>
            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
              ✅ Trusted
            </span>
          </div>
        </div>
      </div>

      {/* VOICE BUTTON */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
        <div className="bg-green-600 text-white rounded-full px-6 py-3 shadow-lg shadow-green-300/40 flex items-center gap-3">
          <VoiceButton size="sm" />
          <span>{t.voiceCta}</span>
        </div>
      </div>

    </div>
  );
};

export default memo(HomeDashboard);