import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  MapPin, TrendingUp, TrendingDown, Loader2,
  IndianRupee, Sparkles, AlertTriangle, CheckCircle2, Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/apiClient";
import { APIResponse, PriceCheckResponse } from "@/lib/api";

interface Recommendation { crop: string; avg_price: number; data_points: number; }

export default function MandiPage({ onBack }: any) {
  const { t } = useTranslation();
  // --- State ---
  const [crops, setCrops]               = useState<string[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string>("");
  const [cropSearch, setCropSearch]     = useState<string>("");
  const [userPrice, setUserPrice]       = useState<string>("");
  const [data, setData]                 = useState<PriceCheckResponse | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [recScope, setRecScope]         = useState<string>("");
  const [loading, setLoading]           = useState(false);
  const [loadingCrops, setLoadingCrops] = useState(true);
  const [loadingRec, setLoadingRec]     = useState(true);
  const [error, setError]               = useState<string | null>(null);

  // Read user's registered location from localStorage (set at login from /auth/me)
  const userLocation = localStorage.getItem("annadata_user_state") ||
                       localStorage.getItem("annadata_user_district") || "";

  // --- Load crops from dataset on mount ---
  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const res = await apiClient.get("/check-price/crops");
        const list: string[] = res.data.data.crops || [];
        setCrops(list);
        if (list.length > 0) setSelectedCrop(list[0]);
      } catch {
        setCrops(["Wheat", "Rice", "Mustard", "Cotton", "Maize"]);
        setSelectedCrop("Wheat");
      } finally {
        setLoadingCrops(false);
      }
    };
    fetchCrops();
  }, []);

  // --- Load AI recommendations based on user's location ---
  useEffect(() => {
    const fetchRec = async () => {
      setLoadingRec(true);
      try {
        const res = await apiClient.get("/check-price/recommend", {
          params: { location: userLocation }
        });
        setRecommendations(res.data.data.recommendations || []);
        setRecScope(res.data.data.scope || "National");
      } catch {
        setRecommendations([]);
      } finally {
        setLoadingRec(false);
      }
    };
    fetchRec();
  }, [userLocation]);

  // --- Submit: user enters their price, we fetch market price from dataset ---
  const handleCheck = async () => {
    if (!selectedCrop || !userPrice) return;
    const price = parseFloat(userPrice);
    if (isNaN(price) || price <= 0) { setError("Please enter a valid price."); return; }
    setError(null);
    setLoading(true);
    setData(null);
    try {
      const userId = localStorage.getItem("annadata_user_id") || undefined;
      const resp = await apiClient.post<APIResponse<PriceCheckResponse>>("/check-price", {
        crop: selectedCrop,
        location: userLocation || "India",
        user_price: price,
        user_id: userId,
        report_fraud: false,
      });
      setData(resp.data.data);
    } catch (e: any) {
      setError(e.response?.data?.detail || "No market data found for this crop/location combination.");
    } finally {
      setLoading(false);
    }
  };

  const filteredCrops = crops.filter(c =>
    c.toLowerCase().includes(cropSearch.toLowerCase())
  );

  const statusColor = data?.status === "underpaid" ? "#c82b28"
                    : data?.status === "overpaid"  ? "#408447"
                    : "#3174a1";

  const statusIcon = data?.status === "underpaid" ? <TrendingDown className="w-5 h-5" />
                   : data?.status === "overpaid"  ? <TrendingUp className="w-5 h-5" />
                   : <CheckCircle2 className="w-5 h-5" />;

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto pb-12">
      <div className="px-5 mt-4 space-y-6">

        {/* ── AI Recommendations ── */}
        <div className="bg-white border border-[#e5e3d7] shadow-sm">
          <div className="p-4 border-b border-[#e5e3d7] bg-[#fbfaf5] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#e18b2c]" />
            <h3 className="font-mukta font-bold text-sm uppercase tracking-widest text-[#1a1a1a]">
              {t("mandi.aiRecommendations")}
            </h3>
            {recScope && (
              <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-100 px-2 py-0.5">
                {recScope} Market
              </span>
            )}
          </div>
          <div className="p-4">
            {loadingRec ? (
              <div className="flex items-center gap-2 text-gray-400 py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading real-time recommendations...</span>
              </div>
            ) : recommendations.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">No recommendations available.</p>
            ) : (
              <div className="space-y-2">
                {recommendations.map((r, i) => (
                  <motion.div
                    key={r.crop}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-3 border border-[#e5e3d7] hover:bg-[#fbfaf5] cursor-pointer transition-colors"
                    onClick={() => { setSelectedCrop(r.crop); setCropSearch(""); }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-[#408447] text-white text-[10px] font-black flex items-center justify-center">
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-bold text-sm text-[#1a1a1a]">{r.crop}</p>
                        <p className="text-[10px] text-gray-400">{r.data_points} market records</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-[#408447] font-mukta">₹{r.avg_price.toLocaleString()}</p>
                      <p className="text-[10px] text-gray-400">avg/quintal</p>
                    </div>
                  </motion.div>
                ))}
                <p className="text-[10px] text-gray-400 mt-2 font-hind">
                  Based on real market data from your region. Click a crop to select it.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Price Check Form ── */}
        <div className="bg-white border border-[#e5e3d7] shadow-sm">
          <div className="p-4 border-b border-[#e5e3d7] bg-[#fbfaf5]">
            <h3 className="font-mukta font-bold text-sm uppercase tracking-widest text-[#1a1a1a]">
              {t("mandi.checkPrice")}
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5 font-hind">
              Select a crop, enter what the trader is offering you, and we'll compare it against live market data.
            </p>
          </div>
          <div className="p-5 space-y-4">

            {/* Crop search + select */}
            <div>
              <label className="block text-xs font-bold uppercase text-[#666666] mb-1">Select Crop</label>
              {loadingCrops ? (
                <div className="flex items-center gap-2 text-gray-400 py-3">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading crops from dataset...
                </div>
              ) : (
                <>
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search crops..."
                      value={cropSearch}
                      onChange={e => setCropSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-[#e5e3d7] text-sm font-hind outline-none focus:border-[#408447]"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                    {filteredCrops.map(crop => (
                      <button
                        key={crop}
                        onClick={() => setSelectedCrop(crop)}
                        className={`px-3 py-1 text-xs font-bold uppercase tracking-wide border transition-colors ${
                          selectedCrop === crop
                            ? "bg-[#408447] text-white border-[#2a5a2f]"
                            : "bg-white text-[#666666] border-[#e5e3d7] hover:border-[#408447]"
                        }`}
                      >
                        {crop}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Location display (from registration) */}
            {userLocation && (
              <div className="flex items-center gap-2 bg-[#fbfaf5] border border-[#e5e3d7] px-3 py-2">
                <MapPin className="w-3.5 h-3.5 text-[#3174a1]" />
                <span className="text-xs font-bold text-[#3174a1]">Your Location: {userLocation}</span>
                <span className="text-[10px] text-gray-400 ml-auto">Market data filtered by this</span>
              </div>
            )}

            {/* User price input */}
            <div>
              <label className="block text-xs font-bold uppercase text-[#666666] mb-1">
                Your Offered Price (₹ per quintal)
              </label>
              <div className="flex items-center border border-[#e5e3d7] focus-within:border-[#408447] transition-colors">
                <span className="px-3 py-2.5 bg-[#fbfaf5] border-r border-[#e5e3d7] text-gray-500 font-bold text-sm">₹</span>
                <input
                  type="number"
                  placeholder="e.g. 1950"
                  value={userPrice}
                  onChange={e => setUserPrice(e.target.value)}
                  className="flex-1 px-3 py-2.5 text-sm font-hind outline-none bg-white"
                />
                <span className="px-3 py-2.5 text-[10px] text-gray-400 font-bold">/quintal</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Market price will be fetched from real dataset for <strong>{selectedCrop || "selected crop"}</strong>.</p>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 p-3">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 font-hind">{error}</p>
              </div>
            )}

            <button
              onClick={handleCheck}
              disabled={loading || !selectedCrop || !userPrice}
              className="w-full bg-[#408447] text-white py-3 font-bold uppercase tracking-widest text-sm hover:bg-[#2a5a2f] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <IndianRupee className="w-4 h-4" />}
              {loading ? t("common.loading") : t("mandi.compareButton")}
            </button>
          </div>
        </div>

        {/* ── Results ── */}
        <AnimatePresence>
          {data && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Decision banner */}
              <div
                className="p-5 border-l-4 text-white"
                style={{ backgroundColor: statusColor, borderLeftColor: "rgba(0,0,0,0.2)" }}
              >
                <div className="flex items-center gap-2 mb-1">
                  {statusIcon}
                  <p className="text-xs font-bold uppercase tracking-widest opacity-80">Market Verdict</p>
                </div>
                <h2 className="font-mukta font-black text-xl">
                  {data.status === "underpaid"
                    ? `You're being underpaid by ₹${Math.abs(data.difference).toFixed(0)} per quintal`
                    : data.status === "overpaid"
                    ? `You got ₹${Math.abs(data.difference).toFixed(0)} more than market average!`
                    : "You're getting a fair market rate"}
                </h2>
                <p className="text-sm opacity-90 mt-1">{data.message_text}</p>
              </div>

              {/* Price comparison */}
              <div className="bg-white border border-[#e5e3d7] p-5">
                <h3 className="font-mukta font-bold text-sm uppercase tracking-widest mb-4 text-[#1a1a1a]">Price Comparison</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-bold text-[#666666]">Your Price</span>
                      <span className="font-black font-mukta text-[#1a1a1a]">₹{data.user_price.toLocaleString()}</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 border border-[#e5e3d7]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((data.user_price / (data.average_price * 1.2)) * 100, 100)}%` }}
                        transition={{ duration: 0.8 }}
                        className="h-full bg-[#e18b2c]"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-bold text-[#666666]">Market Average ({data.data_points} records)</span>
                      <span className="font-black font-mukta text-[#408447]">₹{data.average_price.toLocaleString()}</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 border border-[#e5e3d7]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 0.8 }}
                        className="h-full bg-[#408447]"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-[#e5e3d7] flex items-center gap-2">
                  {data.status === "underpaid"
                    ? <TrendingDown className="w-4 h-4 text-[#c82b28]" />
                    : <TrendingUp className="w-4 h-4 text-[#408447]" />}
                  <span className="text-sm font-bold" style={{ color: statusColor }}>
                    Difference: ₹{Math.abs(data.difference).toFixed(2)} ({Math.abs(data.difference_pct ?? 0).toFixed(1)}%)
                  </span>
                </div>
              </div>

              {/* Nearby mandis from dataset */}
              <div className="bg-white border border-[#e5e3d7]">
                <div className="p-4 border-b border-[#e5e3d7] bg-[#fbfaf5] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#3174a1]" />
                  <h3 className="font-mukta font-bold text-sm uppercase tracking-widest text-[#1a1a1a]">
                    {t("mandi.datasetMandis")}
                  </h3>
                  <span className="ml-auto text-[10px] text-gray-400">{data.all_mandis?.length} mandis found</span>
                </div>
                <div className="divide-y divide-[#e5e3d7]">
                  {data.all_mandis?.slice(0, 10).map((m, i) => {
                    const isBest = m.name === data.best_mandi?.name;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className={`p-4 flex justify-between items-center ${isBest ? "bg-green-50 border-l-4 border-l-[#408447]" : "hover:bg-[#fbfaf5]"}`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm text-[#1a1a1a]">{m.name}</p>
                            {isBest && (
                              <span className="text-[9px] bg-[#408447] text-white font-black px-1.5 py-0.5 uppercase tracking-widest">
                                BEST
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">{m.state}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black font-mukta text-[#1a1a1a]">₹{m.price.toLocaleString()}</p>
                          {isBest && data.status === "underpaid" && (
                            <p className="text-[11px] text-[#408447] font-bold">
                              +₹{(m.price - data.user_price).toFixed(0)} more
                            </p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}