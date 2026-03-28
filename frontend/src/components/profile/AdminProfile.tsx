import { theme } from "@/designSystem";
import { Shield, Users, AlertTriangle, Landmark } from "lucide-react";
import type { Role } from "@/components/RoleLogin";
import { useProfile } from "@/hooks/useProfile";

const MOCK_ADMIN_STATS = {
  totalFarmers: 48230,
  totalNGOs: 312,
  activeFraudAlerts: 194,
  pendingVerifications: 27,
};

interface AdminProfileProps {
  role: Role;
}

const AdminProfile = ({ role }: AdminProfileProps) => {
  const { profile } = useProfile(role);
  
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">

      {/* ── Hero ── */}
      <div className="bg-[#13311c] text-white p-6 flex items-center gap-4">
        <div className="w-14 h-14 bg-[#254d31] border border-[#d4cb7e] flex items-center justify-center">
          <Shield className="w-7 h-7 text-[#d4cb7e]" />
        </div>
        <div>
          <h1 className="font-mukta font-black text-xl">{profile.name}</h1>
          <p className="text-[#d4cb7e] text-xs font-bold uppercase tracking-widest">Admin · Annadata OS</p>
          <p className="text-white/50 text-xs mt-1">Full platform access · Restricted</p>
        </div>
        <div className="ml-auto">
          <span className={`${theme.classes.badgeInfo} text-xs px-3 py-1`}>ADMIN</span>
        </div>
      </div>

      {/* ── System Overview ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Farmers",         value: MOCK_ADMIN_STATS.totalFarmers.toLocaleString(),     icon: Users,         color: "#408447" },
          { label: "Partner NGOs",           value: MOCK_ADMIN_STATS.totalNGOs,                         icon: Landmark,      color: "#3174a1" },
          { label: "Fraud Alerts (Active)",  value: MOCK_ADMIN_STATS.activeFraudAlerts,                 icon: AlertTriangle, color: "#c82b28" },
          { label: "Pending Verifications",  value: MOCK_ADMIN_STATS.pendingVerifications,              icon: Shield,        color: "#e18b2c" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`${theme.classes.statCardWrap} border-t-[3px]`} style={{ borderTopColor: color }}>
            <Icon className="w-4 h-4 mb-2" style={{ color }} />
            <p className="text-xs font-bold uppercase text-[#666666] mb-1">{label}</p>
            <p className="font-mukta font-black text-2xl" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Admin Details ── */}
      <div className={`${theme.classes.card} p-6`}>
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#e5e3d7]">
          <Shield className="w-4 h-4 text-[#3174a1]" />
          <h2 className="font-mukta font-bold text-base text-[#1a1a1a] uppercase tracking-wide">Admin Identity</h2>
        </div>

        <div className="space-y-4">
          {[
            { label: "Display Name",  value: profile.name },
            { label: "Admin ID",      value: profile.adminId },
            { label: "Access Level",  value: "Full Platform Access" },
            { label: "Last Login",    value: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-[#e5e3d7] last:border-0">
              <span className="text-xs font-bold uppercase text-[#666666]">{label}</span>
              <span className="text-sm font-semibold text-[#1a1a1a]">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Security Notice ── */}
      <div className="bg-[#c82b28]/5 border border-[#c82b28]/20 p-4 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-[#c82b28] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold uppercase text-[#c82b28] mb-1">Restricted Access</p>
          <p className="text-xs text-[#666666] leading-relaxed">
            This admin profile is read-only. All changes to platform configuration are made through the backend system panel. Contact your system operator for modifications.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
