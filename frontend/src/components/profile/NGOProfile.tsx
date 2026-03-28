import { useState } from "react";
import { theme } from "@/designSystem";
import { useProfile } from "@/hooks/useProfile";
import {
  Briefcase, Globe, MapPin, CheckCircle, Clock,
  Users, Scale, Landmark, ShieldAlert, Save, Edit2, RotateCcw
} from "lucide-react";
import type { Role } from "@/components/RoleLogin";

const INDIA_STATES  = ["Maharashtra", "Punjab", "Madhya Pradesh", "Uttar Pradesh", "Bihar", "Rajasthan", "Gujarat", "Karnataka", "Tamil Nadu", "West Bengal"];
const FOCUS_OPTIONS = ["Fraud Awareness", "Legal Aid", "Loans", "Insurance", "Crop Advisory", "Water Rights", "Market Access"];

const MOCK_STATS = {
  farmersHelped: 1240,
  activeCases: 87,
  resolutionRate: "78%",
  districtsCovered: 14,
};

function Chip({ label, active, onToggle }: { label: string; active: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`px-3 py-1 text-xs font-bold uppercase tracking-wide border transition-colors ${
        active
          ? "bg-[#e18b2c] text-white border-[#a6630f]"
          : "bg-white text-[#666666] border-[#e5e3d7] hover:border-[#e18b2c] hover:text-[#e18b2c]"
      }`}
    >
      {label}
    </button>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#e5e3d7]">
      <Icon className="w-4 h-4 text-[#e18b2c]" />
      <h2 className="font-mukta font-bold text-base text-[#1a1a1a] uppercase tracking-wide">{title}</h2>
    </div>
  );
}

interface NGOProfileProps {
  role: Role;
}

const NGOProfile = ({ role }: NGOProfileProps) => {
  const { profile, updateProfile, resetProfile } = useProfile(role);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved]     = useState(false);

  const toggleFocus = (f: string) => {
    const areas = profile.focusAreas || [];
    updateProfile({
      focusAreas: areas.includes(f) ? areas.filter((x: string) => x !== f) : [...areas, f],
    });
  };

  const toggleState = (s: string) => {
    const states = profile.states || [];
    updateProfile({
      states: states.includes(s) ? states.filter((x: string) => x !== s) : [...states, s],
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
      <div className="bg-[#4a2600] text-white p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#e18b2c] flex items-center justify-center text-2xl font-mukta font-black">
            {(profile.org || "N")[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-mukta font-black text-xl">{profile.org}</h1>
              {profile.verified && (
                <span className="bg-[#408447] text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-widest flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Verified
                </span>
              )}
              {!profile.verified && (
                <span className="bg-[#e18b2c] text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-widest flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Pending
                </span>
              )}
            </div>
            <p className="text-[#e18b2c] text-xs font-bold uppercase tracking-widest mt-0.5">NGO · Annadata Partner</p>
            <p className="text-white/60 text-xs mt-1">Reg: {profile.regNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!editing ? (
            <button onClick={() => setEditing(true)} className="bg-white/10 text-white px-4 py-2 text-sm font-bold border border-white/20 flex items-center gap-2 hover:bg-white/20 transition-colors">
              <Edit2 className="w-4 h-4" /> Edit
            </button>
          ) : (
            <>
              <button onClick={handleSave} className="bg-[#e18b2c] text-white px-4 py-2 text-sm font-bold border border-[#a6630f] flex items-center gap-2">
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

      {/* ── Impact Metrics (Mock) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Farmers Helped", value: MOCK_STATS.farmersHelped.toLocaleString(), color: "#408447" },
          { label: "Active Cases",   value: MOCK_STATS.activeCases,                    color: "#e18b2c" },
          { label: "Resolution Rate",value: MOCK_STATS.resolutionRate,                 color: "#3174a1" },
          { label: "Districts",       value: MOCK_STATS.districtsCovered,              color: "#c82b28" },
        ].map(({ label, value, color }) => (
          <div key={label} className={`${theme.classes.statCardWrap} border-t-[3px]`} style={{ borderTopColor: color }}>
            <p className="text-xs font-bold uppercase text-[#666666] mb-1">{label}</p>
            <p className="font-mukta font-black text-2xl" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Organisation Info ── */}
      <div className={`${theme.classes.card} p-6`}>
        <SectionHeader icon={Briefcase} title="Organisation Details" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Operator Name",    field: "name",      type: "text" },
            { label: "Organisation",     field: "org",       type: "text" },
            { label: "Reg. Number",      field: "regNumber", type: "text" },
            { label: "Website",          field: "website",   type: "text" },
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
        </div>
      </div>

      {/* ── Coverage ── */}
      <div className={`${theme.classes.card} p-6`}>
        <SectionHeader icon={MapPin} title="Coverage Area" />
        <label className="block text-xs font-bold uppercase text-[#666666] mb-2">States Covered</label>
        <div className="flex flex-wrap gap-2 mb-4">
          {INDIA_STATES.map(s => (
            <Chip
              key={s}
              label={s}
              active={(profile.states || []).includes(s)}
              onToggle={() => editing && toggleState(s)}
            />
          ))}
        </div>
        {!editing && (
          <p className="text-[10px] text-[#999] mb-4">Click Edit to change coverage.</p>
        )}
        <label className="block text-xs font-bold uppercase text-[#666666] mb-1">Districts (comma-separated)</label>
        <div className={theme.classes.inputWrapper}>
          <input
            type="text"
            value={(profile.districts || []).join(", ")}
            readOnly={!editing}
            onChange={e => updateProfile({ districts: e.target.value.split(",").map((d: string) => d.trim()) })}
            className={`${theme.classes.inputText} ${!editing ? "text-[#666666]" : ""}`}
            placeholder="e.g. Pune, Nashik, Nagpur"
          />
        </div>
      </div>

      {/* ── Focus Areas ── */}
      <div className={`${theme.classes.card} p-6`}>
        <SectionHeader icon={Scale} title="Focus Areas" />
        <div className="flex flex-wrap gap-2">
          {FOCUS_OPTIONS.map(f => (
            <Chip
              key={f}
              label={f}
              active={(profile.focusAreas || []).includes(f)}
              onToggle={() => editing && toggleFocus(f)}
            />
          ))}
        </div>
      </div>

      {/* ── Verification Status ── */}
      <div className={`${theme.classes.card} p-6`}>
        <SectionHeader icon={ShieldAlert} title="Verification Status" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-[#1a1a1a]">
              {profile.verified ? "Organisation Verified" : "Verification Pending"}
            </p>
            <p className="text-xs text-[#666666] mt-0.5">
              {profile.verified
                ? "Your NGO is cleared for all platform integrations."
                : "Submit documents to complete NGO verification."}
            </p>
          </div>
          {profile.verified
            ? <span className={theme.classes.badgeSuccess}>Verified</span>
            : <span className={theme.classes.badgeWarning}>Pending</span>}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={resetProfile} className={`${theme.classes.btnOutline} text-xs`}>
          <RotateCcw className="w-3 h-3" /> Reset to Defaults
        </button>
      </div>
    </div>
  );
};

export default NGOProfile;
