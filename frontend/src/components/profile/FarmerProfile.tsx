import { useState, useEffect } from "react";
import { theme } from "@/designSystem";
import { useProfile } from "@/hooks/useProfile";
import {
  Sprout, Phone, MapPin, Globe, AlertTriangle,
  Users, ChevronRight, Save, RotateCcw, Edit2
} from "lucide-react";
import type { Role } from "@/components/RoleLogin";

import { apiClient } from "@/lib/apiClient";

const CROPS       = ["Wheat", "Rice", "Soybean", "Cotton", "Maize", "Sugarcane", "Mustard", "Groundnut", "Pulses", "Vegetables"];
const IRRIGATIONS = ["Borewell", "Canal", "Rainwater", "Drip", "Sprinkler", "Pond / Tank"];
const LANGUAGES   = ["Hindi", "English", "Marathi", "Punjabi", "Telugu", "Tamil", "Gujarati", "Kannada", "Odia"];

function Chip({ label, active, onToggle }: { label: string; active: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`px-3 py-1 text-xs font-bold uppercase tracking-wide border transition-colors ${
        active
          ? "bg-[#408447] text-white border-[#2a5a2f]"
          : "bg-white text-[#666666] border-[#e5e3d7] hover:border-[#408447] hover:text-[#408447]"
      }`}
    >
      {label}
    </button>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#e5e3d7]">
      <Icon className="w-4 h-4 text-[#408447]" />
      <h2 className="font-mukta font-bold text-base text-[#1a1a1a] uppercase tracking-wide">{title}</h2>
    </div>
  );
}

function StatCard({ label, value, color = "#408447" }: { label: string; value: string | number; color?: string }) {
  return (
    <div className={`${theme.classes.statCardWrap} border-t-[3px]`} style={{ borderTopColor: color }}>
      <p className="text-xs font-bold uppercase text-[#666666] mb-1">{label}</p>
      <p className="font-mukta font-black text-2xl" style={{ color }}>{value}</p>
    </div>
  );
}

interface FarmerProfileProps {
  role: Role;
}

const FarmerProfile = ({ role }: FarmerProfileProps) => {
  const { profile, updateProfile, resetProfile } = useProfile(role);
  const [editing, setEditing]   = useState(false);
  const [saved, setSaved]       = useState(false);
  const [riskData, setRiskData] = useState({ fraudAlerts: 0, zone: "Calculating..." });

  // Phone is on the User model, not FarmerProfile — read from localStorage
  const phone = localStorage.getItem("annadata_user_phone") || profile.phone;
  const userId = localStorage.getItem("annadata_user_id");

  useEffect(() => {
    const fetchRisk = async () => {
      if (!userId) {
        setRiskData({ fraudAlerts: 0, zone: "Unknown" });
        return;
      }
      try {
        const res = await apiClient.get(`/trust-score/${userId}`);
        if (res.data?.status === "success") {
          const score = res.data.data.score;
          setRiskData({
            fraudAlerts: res.data.data.factors?.find((f: any) => f.name === 'NGO Verification' && !f.passed) ? 1 : 0,
            zone: score >= 80 ? "Safe" : score >= 50 ? "Moderate Risk" : "High Risk"
          });
        }
      } catch {
        setRiskData({ fraudAlerts: 0, zone: "Unavailable" });
      }
    };
    fetchRisk();
  }, [userId]);

  const toggleCrop = (crop: string) => {
    const crops = profile.crops || [];
    updateProfile({
      crops: crops.includes(crop) ? crops.filter((c: string) => c !== crop) : [...crops, crop],
    });
  };

  const handleSave = () => {
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">

      {/* ── Hero Banner ── */}
      <div className="bg-[#13311c] text-white p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#408447] flex items-center justify-center text-2xl font-mukta font-black">
            {(profile.name || "?")[0]}
          </div>
          <div>
            <h1 className="font-mukta font-black text-xl">{profile.name}</h1>
            <p className="text-[#d4cb7e] text-xs font-bold uppercase tracking-widest">Farmer · Annadata OS</p>
            <p className="text-white/60 text-xs mt-1">{profile.village}, {profile.district}, {profile.state}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!editing ? (
            <button onClick={() => setEditing(true)} className={`${theme.classes.btnOutline} bg-transparent text-white border-white/30 hover:border-white`}>
              <Edit2 className="w-4 h-4" /> Edit
            </button>
          ) : (
            <>
              <button onClick={handleSave} className="bg-[#408447] text-white px-4 py-2 text-sm font-bold border border-[#2a5a2f] flex items-center gap-2">
                <Save className="w-4 h-4" />
                {saved ? "Saved!" : "Save"}
              </button>
              <button onClick={() => setEditing(false)} className="bg-white/10 text-white px-3 py-2 text-xs font-bold border border-white/10">
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Risk Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Fraud Alerts" value={riskData.fraudAlerts} color={riskData.fraudAlerts > 0 ? "#c82b28" : "#408447"} />
        <StatCard label="Risk Zone"    value={riskData.zone}         color={riskData.zone === "Safe" ? "#408447" : (riskData.zone === "High Risk" ? "#c82b28" : "#e18b2c")} />
        <StatCard label="Nearby NGO"   value="Available"              color="#3174a1" />
      </div>

      {/* ── Basic Info ── */}
      <div className={`${theme.classes.card} p-6`}>
        <SectionHeader icon={Sprout} title="Basic Information" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Full Name",   field: "name",     type: "text" },
            { label: "Village",     field: "village",  type: "text" },
            { label: "District",    field: "district", type: "text" },
            { label: "State",       field: "state",    type: "text" },
          ].map(({ label, field, type }) => (
            <div key={field}>
              <label className="block text-xs font-bold uppercase text-[#666666] mb-1">{label}</label>
              <div className={theme.classes.inputWrapper}>
                <input
                  type={type}
                  value={profile[field] || ""}
                  readOnly={!editing}
                  onChange={e => updateProfile({ [field]: e.target.value })}
                  className={`${theme.classes.inputText} ${!editing ? "text-[#666666]" : ""}`}
                />
              </div>
            </div>
          ))}

          {/* Phone — always read-only */}
          <div>
            <label className="block text-xs font-bold uppercase text-[#666666] mb-1">Phone (Read-only)</label>
            <div className="flex items-center gap-2 bg-gray-50 border border-[#e5e3d7] px-3 py-2">
              <Phone className="w-3.5 h-3.5 text-[#666666]" />
              <span className="text-sm font-hind text-[#666666]">{phone}</span>
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-xs font-bold uppercase text-[#666666] mb-1">Language</label>
            <div className={theme.classes.inputWrapper}>
              <select
                value={profile.language || "Hindi"}
                disabled={!editing}
                onChange={e => updateProfile({ language: e.target.value })}
                className={`${theme.classes.inputText} ${!editing ? "text-[#666666]" : ""}`}
              >
                {LANGUAGES.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Farming Info ── */}
      <div className={`${theme.classes.card} p-6`}>
        <SectionHeader icon={MapPin} title="Farming Details" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-xs font-bold uppercase text-[#666666] mb-1">Farm Size (acres)</label>
            <div className={theme.classes.inputWrapper}>
              <input
                type="number"
                value={profile.farmSize || ""}
                readOnly={!editing}
                onChange={e => updateProfile({ farmSize: e.target.value })}
                className={theme.classes.inputText}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-[#666666] mb-1">Irrigation Type</label>
            <div className={theme.classes.inputWrapper}>
              <select
                value={profile.irrigation || "Borewell"}
                disabled={!editing}
                onChange={e => updateProfile({ irrigation: e.target.value })}
                className={theme.classes.inputText}
              >
                {IRRIGATIONS.map(i => <option key={i}>{i}</option>)}
              </select>
            </div>
          </div>
        </div>

        <label className="block text-xs font-bold uppercase text-[#666666] mb-2">Crops Grown</label>
        <div className="flex flex-wrap gap-2">
          {CROPS.map(crop => (
            <Chip
              key={crop}
              label={crop}
              active={(profile.crops || []).includes(crop)}
              onToggle={() => editing && toggleCrop(crop)}
            />
          ))}
        </div>
        {!editing && (
          <p className="text-[10px] text-[#999] mt-2">Click Edit to change crop selection.</p>
        )}
      </div>

      {/* ── Nearby NGO ── */}
      <div className={`${theme.classes.card} p-6`}>
        <SectionHeader icon={Users} title="NGO Support Near You" />
        <div className="flex items-center justify-between py-3 border-b border-[#e5e3d7] last:border-0">
          <div>
            <p className="font-bold text-sm text-[#1a1a1a]">Kisan Seva Kendra</p>
            <p className="text-xs text-[#666666]">12 km · Fraud Awareness, Legal Aid, Loans</p>
          </div>
          <span className={theme.classes.badgeSuccess}>Active</span>
        </div>
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="font-bold text-sm text-[#1a1a1a]">PM Kisan Helpline</p>
            <p className="text-xs text-[#666666]">State-level · All services</p>
          </div>
          <span className={theme.classes.badgeInfo}>Govt</span>
        </div>
      </div>

      {/* Reset */}
      <div className="flex justify-end">
        <button onClick={resetProfile} className={`${theme.classes.btnOutline} text-xs`}>
          <RotateCcw className="w-3 h-3" /> Reset to Defaults
        </button>
      </div>
    </div>
  );
};

export default FarmerProfile;
