import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, ShieldAlert, Landmark, Scale,
  Mic, ZoomIn, ZoomOut
} from "lucide-react";

import IndiaMap from "./IndiaMap";

type Layer = "market" | "fraud" | "loan" | "legal";

const LAYER_META: Record<Layer, {
  label: string;
  icon: React.ElementType;
  accentColor: string;
  gradient: string;
  insight: string;
}> = {
  market: {
    label: "Market",   icon: TrendingUp,
    accentColor: "#22c55e",
    gradient: "linear-gradient(to right, #ef4444, #f97316, #eab308, #22c55e)",
    insight: "Significant price spikes in southern states. Redirect supply chains to capture 15% margin increase.",
  },
  fraud: {
    label: "Fraud",    icon: ShieldAlert,
    accentColor: "#ef4444",
    gradient: "linear-gradient(to right, #22c55e, #eab308, #ef4444)",
    insight: "High fraud risk in Central Mandi sector. Automated verification required for all bulk transactions.",
  },
  loan: {
    label: "Loan",     icon: Landmark,
    accentColor: "#3b82f6",
    gradient: "linear-gradient(to right, #ef4444, #60a5fa, #3b82f6)",
    insight: "KCC approval windows open for Kharif season. 85% of eligible applicants in Maharashtra processed.",
  },
  legal: {
    label: "Legal",    icon: Scale,
    accentColor: "#a855f7",
    gradient: "linear-gradient(to right, #22c55e, #c084fc, #a855f7)",
    insight: "Land title disputes rising in border districts. Multi-lingual legal aid nodes now deployed.",
  },
};

const HeatmapIntelligence = ({ onBack }: { onBack: () => void }) => {
  const [layer, setLayer]         = useState<Layer>("market");
  const [activeRegion, setActiveRegion] = useState<any>(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const handleLayerChange = useCallback((l: Layer) => {
    setLayer(l);
    setActiveRegion(null);
  }, []);

  const meta      = LAYER_META[layer];
  const LayerIcon = meta.icon;

  return (
    /**
     * Fills 100% of the content area AppLayout gives us.
     * AppLayout already has the top header — we just render body here.
     */
    <div style={{
      display: "flex",
      flexDirection: "column",
      width: "100%",
      height: "100%",
      background: "#050a05",
      fontFamily: "'Inter', sans-serif",
    }}>


      {/* ── BODY: MAP + RIGHT SIDEBAR ──────────────── */}

      <div style={{
        display: "flex",
        flex: 1,
        overflow: "hidden",     /* clip children, don't clip sidebar */
        position: "relative",
      }}>

        {/* ── LEFT: MAP CANVAS ───────────────────────── */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          {loading ? (
            <div style={{
              width: "100%", height: "100%",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              background: "#050a05",
            }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                style={{
                  width: 40, height: 40,
                  border: "2px solid rgba(255,255,255,0.08)",
                  borderTopColor: "#22c55e",
                  borderRadius: "50%",
                  marginBottom: 16,
                }}
              />
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 900,
                          textTransform: "uppercase", letterSpacing: "0.18em" }}>
                Synchronising Satellite Feeds…
              </p>
            </div>
          ) : (
            <IndiaMap layer={layer} onRegionHover={setActiveRegion} />
          )}

          {/* Bottom bar — AI insight (inside map canvas, above the fold) */}
          {!loading && (
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              background: "rgba(8,12,8,0.92)",
              backdropFilter: "blur(20px)",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              gap: 16,
              zIndex: 30,
            }}>
              <div style={{
                width: 36, height: 36, flexShrink: 0,
                background: `${meta.accentColor}18`,
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <LayerIcon size={16} style={{ color: meta.accentColor }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 8, fontWeight: 900, textTransform: "uppercase",
                            letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>
                  Global AI Analysis
                </p>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", lineHeight: 1.4 }}>
                  {meta.insight}
                </p>
              </div>

              {/* Voice Button — inside the bottom bar right side */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  flexShrink: 0,
                  width: 44, height: 44,
                  background: "#22c55e",
                  border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 0 20px rgba(34,197,94,0.35)",
                }}
                title="Ask by Voice"
              >
                <Mic size={18} style={{ color: "#000" }} />
              </motion.button>
            </div>
          )}
        </div>

        {/* ── RIGHT SIDEBAR (fixed width, never clips) ── */}
        <div style={{
          width: 220,
          flexShrink: 0,
          background: "#0a0f0a",
          borderLeft: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          flexDirection: "column",
          gap: 0,
          overflowY: "auto",
          zIndex: 40,
        }}>

          {/* ── Layer Toggle ── */}
          <div style={{ padding: "20px 16px 16px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <p style={{ fontSize: 8, fontWeight: 900, textTransform: "uppercase",
                        letterSpacing: "0.2em", color: "rgba(255,255,255,0.25)", marginBottom: 10 }}>
              Intelligence Layer
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {(Object.keys(LAYER_META) as Layer[]).map((l) => {
                const LIcon = LAYER_META[l].icon;
                const isActive = layer === l;
                return (
                  <button
                    key={l}
                    onClick={() => handleLayerChange(l)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "9px 12px",
                      background: isActive ? `${LAYER_META[l].accentColor}15` : "transparent",
                      border: isActive ? `1px solid ${LAYER_META[l].accentColor}40` : "1px solid transparent",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.2s ease",
                      borderRadius: 6,
                    }}
                  >
                    <LIcon size={14} style={{
                      color: isActive ? LAYER_META[l].accentColor : "rgba(255,255,255,0.3)",
                      flexShrink: 0,
                    }} />
                    <span style={{
                      fontSize: 12,
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? "#fff" : "rgba(255,255,255,0.4)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}>
                      {LAYER_META[l].label}
                    </span>
                    {isActive && (
                      <div style={{
                        marginLeft: "auto",
                        width: 6, height: 6, borderRadius: "50%",
                        background: LAYER_META[l].accentColor,
                        boxShadow: `0 0 6px ${LAYER_META[l].accentColor}`,
                      }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Active Region Insight ── */}
          <AnimatePresence mode="wait">
            {activeRegion ? (
              <motion.div
                key={activeRegion.district || activeRegion.state}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.2 }}
                style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                <p style={{ fontSize: 8, fontWeight: 900, textTransform: "uppercase",
                            letterSpacing: "0.18em", color: "rgba(255,255,255,0.25)", marginBottom: 8 }}>
                  Region Insight
                </p>
                <p style={{ fontSize: 14, fontWeight: 800, color: "#fff",
                            marginBottom: 2, letterSpacing: "-0.01em" }}>
                  {activeRegion.district || activeRegion.state}
                </p>
                <p style={{ fontSize: 20, fontWeight: 900, color: meta.accentColor,
                            marginBottom: 4, lineHeight: 1 }}>
                  {activeRegion.value}
                </p>
                <p style={{
                  fontSize: 11, fontWeight: 700, marginBottom: 10,
                  color: activeRegion.trend === "up"   ? "#22c55e"
                       : activeRegion.trend === "down" ? "#ef4444" : "#94a3b8",
                }}>
                  {activeRegion.comparison}
                </p>
                <div style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  padding: "10px 10px",
                  borderRadius: 4,
                }}>
                  <p style={{ fontSize: 8, fontWeight: 900, textTransform: "uppercase",
                              letterSpacing: "0.15em", color: "#facc15", marginBottom: 5 }}>
                    💡 AI Recommendation
                  </p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>
                    {activeRegion.recommendation}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ padding: "16px" }}
              >
                <p style={{ fontSize: 8, fontWeight: 900, textTransform: "uppercase",
                            letterSpacing: "0.18em", color: "rgba(255,255,255,0.2)", marginBottom: 8 }}>
                  Region Insight
                </p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", lineHeight: 1.5 }}>
                  Hover over a state or district to see detailed intelligence.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Intensity Legend ── */}
          <div style={{
            padding: "16px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            marginTop: "auto",
          }}>
            <p style={{ fontSize: 8, fontWeight: 900, textTransform: "uppercase",
                        letterSpacing: "0.2em", color: "rgba(255,255,255,0.25)", marginBottom: 10 }}>
              Intensity Scale
            </p>
            <div style={{
              height: 8,
              background: meta.gradient,
              transition: "background 0.7s ease",
              borderRadius: 4,
              marginBottom: 6,
            }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", fontWeight: 700 }}>Low</span>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", fontWeight: 700 }}>High</span>
            </div>
          </div>

          {/* ── Zoom Controls ── */}
          <div style={{
            padding: "12px 16px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            gap: 8,
          }}>
            <button style={{
              flex: 1, padding: "8px 0",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#fff", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 4,
            }}>
              <ZoomIn size={14} />
            </button>
            <button style={{
              flex: 1, padding: "8px 0",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#fff", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 4,
            }}>
              <ZoomOut size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapIntelligence;
