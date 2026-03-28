import { useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  Camera,
  Star,
  TrendingDown,
  MapPin,
  Package,
  Brain,
} from "lucide-react";
import ScreenHeader from "./ScreenHeader";
import VoiceButton from "./VoiceButton";

const FraudDetection = ({ onBack }) => {
  const [scanned, setScanned] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleScan = () => {
    setScanned(true);
    setTimeout(() => setShowResult(true), 600);
  };

  const riskScore = 25;

  return (
    <div className="min-h-screen pb-28 bg-gradient-to-b from-[#f7f5ef] via-[#f3efe6] to-[#ede7db]">
      <ScreenHeader
        onBack={onBack}
        title="Input Verification"
        icon="🛡️"
        subtitle="Scan products to detect fraud & risk"
      />

      <div className="px-5 space-y-5 mt-4">
        {!scanned ? (
          <div className="bg-white rounded-3xl p-8 border shadow-sm flex flex-col items-center gap-5">
            <div className="w-40 h-40 border-2 border-dashed border-green-400 rounded-2xl flex items-center justify-center bg-green-50">
              <Camera className="w-10 h-10 text-green-600" />
            </div>

            <button
              onClick={handleScan}
              className="w-full max-w-xs py-3.5 rounded-xl bg-green-700 text-white font-bold shadow-md hover:scale-[1.02] transition"
            >
              Scan Product 🔍
            </button>
          </div>
        ) : (
          <>
            {/* PRODUCT */}
            <div className="bg-white rounded-3xl p-5 border shadow-sm">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-2xl">
                  🧴
                </div>

                <div>
                  <h2 className="font-bold text-lg">
                    XYZ Pesticide 500ml
                  </h2>
                  <p className="text-xs text-gray-500">
                    Manufacturer: XYZ Agrochem Ltd
                  </p>
                  <p className="text-xs text-gray-500">
                    Batch: #AZ2025-0483
                  </p>
                  <p className="text-xs text-gray-500">
                    Expiry: Dec 2026
                  </p>
                </div>
              </div>
            </div>

            {/* RISK */}
            {showResult && (
              <div className="bg-white rounded-3xl p-5 border shadow-sm">
                <h3 className="font-bold mb-3">AI Risk Analysis</h3>

                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600 transition-all duration-1000"
                    style={{ width: `${riskScore}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Safe</span>
                  <span>Risky</span>
                </div>

                <div className="mt-4 bg-green-50 p-4 rounded-xl flex gap-3">
                  <ShieldCheck className="text-green-600" />
                  <div>
                    <p className="font-bold">Risk Score: 25 — Low Risk</p>
                    <p className="text-sm text-gray-600">
                      Product appears genuine
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* AI REASONING */}
            {showResult && (
              <div className="bg-white rounded-3xl p-5 border shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="text-purple-600" />
                  <h3 className="font-bold">AI Reasoning</h3>
                </div>

                <ul className="text-sm space-y-2">
                  <li>• Product matches verified database</li>
                  <li>• Price slightly below normal</li>
                  <li>• Dealer has moderate complaints</li>
                </ul>
              </div>
            )}

            {/* PRICE INTELLIGENCE */}
            {showResult && (
              <div className="bg-white rounded-3xl p-5 border shadow-sm">
                <h3 className="font-bold mb-2">Price Intelligence</h3>
                <p className="text-sm">You paid ₹70</p>
                <p className="text-sm text-gray-500">
                  Market avg ₹95
                </p>
                <p className="text-red-600 text-sm font-bold mt-1">
                  25% lower than normal (Risk Signal)
                </p>
              </div>
            )}

            {/* AREA RISK */}
            {showResult && (
              <div className="bg-white rounded-3xl p-5 border shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin />
                  <h3 className="font-bold">Area Risk</h3>
                </div>

                <p className="text-yellow-600 font-bold">
                  Medium Fraud Zone
                </p>
                <p className="text-xs text-gray-500">
                  12 reports within 5km
                </p>
              </div>
            )}

            {/* BATCH ANALYSIS */}
            {showResult && (
              <div className="bg-white rounded-3xl p-5 border shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Package />
                  <h3 className="font-bold">Batch Analysis</h3>
                </div>

                <p className="text-sm">
                  This batch has 2 previous complaints
                </p>
                <p className="text-xs text-gray-500">
                  No manufacturer anomaly detected
                </p>
              </div>
            )}

            {/* DEALER TRUST */}
            {showResult && (
              <div className="bg-white rounded-3xl p-5 border shadow-sm">
                <h3 className="font-bold mb-3">
                  Community Trust
                </h3>

                <div className="flex gap-4 items-center">
                  <div className="bg-green-100 rounded-xl px-4 py-2 font-bold">
                    4.2
                  </div>

                  <div>
                    <p className="font-bold">
                      Gupta Agri Store
                    </p>

                    <div className="flex">
                      {[1, 2, 3, 4].map((i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 text-yellow-500 fill-yellow-500"
                        />
                      ))}
                      <Star className="w-4 h-4 text-gray-300" />
                    </div>

                    <p className="text-xs text-gray-500">
                      3 complaints • 128 verified sales
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* BETTER OPTION */}
            {showResult && (
              <div className="bg-white rounded-3xl p-5 border shadow-sm">
                <h3 className="font-bold mb-2">
                  Better Option Nearby
                </h3>

                <p className="text-sm">
                  Sharma Agro Store — ₹95
                </p>
                <span className="text-green-600 text-xs">
                  Trusted Seller
                </span>
              </div>
            )}

            {/* FINAL RECOMMENDATION */}
            {showResult && (
              <div className="bg-green-50 border border-green-200 rounded-3xl p-5">
                <h3 className="font-bold mb-2">
                  AI Recommendation
                </h3>

                <p className="text-sm">
                  Safe to purchase, but verify dealer credibility.
                  Prefer trusted sellers nearby.
                </p>
              </div>
            )}

            {/* ACTION */}
            {showResult && (
              <div className="space-y-3">
                <button className="w-full py-3 rounded-xl bg-green-700 text-white font-bold">
                  Scan Another Product
                </button>

                <button className="w-full py-3 rounded-xl border font-bold">
                  Report Issue
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* VOICE */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
        <div className="bg-white rounded-full px-5 py-3 shadow-lg flex items-center gap-3">
          <VoiceButton size="sm" />
          <span className="text-sm text-gray-500">
            Ask by voice
          </span>
        </div>
      </div>
    </div>
  );
};

export default FraudDetection;