import { theme } from "@/designSystem";
import { 
  Users, AlertTriangle, FileText, IndianRupee, 
  Store, ShieldCheck, FileKey, Scale,
  ChevronRight, Activity, MapPin, 
  CheckCircle, XCircle, Clock, Landmark
} from "lucide-react";
import type { Lang } from "@/pages/Index";
import { Role } from "@/components/RoleLogin";

interface HomeDashboardProps {
  onNavigate: (screen: "mandi" | "fraud" | "loan" | "legal" | "heatmap") => void;
  lang: Lang;
  onToggleLang: () => void;
  role: Role;
}

// ----------------------------------------------------------------------
// ADMIN DASHBOARD (The massive Intelligence OS built previously)
// ----------------------------------------------------------------------
const AdminDashboard = ({ onNavigate }: { onNavigate: any }) => {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* 4 TOP STAT CARDS */}
      <div className={theme.classes.statGroup}>
        <div className={`${theme.classes.statCardWrap} ${theme.classes.borderTopGreen} flex items-center justify-between`}>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Users className="w-5 h-5 text-[#408447]" />
              <h3 className="text-2xl font-bold font-mukta text-[#1a1a1a]">14,832</h3>
            </div>
            <p className="text-xs text-[#666666] font-hind mt-1">Farmers Protected</p>
          </div>
        </div>

        <div className={`${theme.classes.statCardWrap} ${theme.classes.borderTopOrange} flex items-center justify-between`}>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <AlertTriangle className="w-5 h-5 text-[#e18b2c]" />
              <h3 className="text-2xl font-bold font-mukta text-[#1a1a1a]">2,347</h3>
            </div>
            <p className="text-xs text-[#666666] font-hind mt-1">Anomalies Detected</p>
          </div>
        </div>

        <div className={`${theme.classes.statCardWrap} ${theme.classes.borderTopBlue} flex items-center justify-between`}>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <FileText className="w-5 h-5 text-[#3174a1]" />
              <h3 className="text-2xl font-bold font-mukta text-[#1a1a1a]">891</h3>
            </div>
            <p className="text-xs text-[#666666] font-hind mt-1">Cases Filed</p>
          </div>
        </div>

        <div className={`${theme.classes.statCardWrap} ${theme.classes.borderTopYellow} flex items-center justify-between`}>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <IndianRupee className="w-5 h-5 text-[#d4cb7e]" />
              <h3 className="text-2xl font-bold font-mukta text-[#1a1a1a]">4.2 Cr</h3>
            </div>
            <p className="text-xs text-[#666666] font-hind mt-1">Farmer Losses Recovered</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Anomaly Feed */}
          <div className={`${theme.classes.card} h-[400px] flex flex-col`}>
            <div className="p-4 border-b border-[#e5e3d7] flex items-center justify-between bg-white">
              <h2 className={theme.classes.heading2}>System Wide Anomaly Feed</h2>
              <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" /> LIVE
              </span>
            </div>
            <div className="p-4 overflow-y-auto flex-1 space-y-5">
              <div className="flex gap-3">
                <div className="w-2.5 h-2.5 bg-[#c82b28] mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-hind text-[#1a1a1a]"><strong>Azadpur Mandi:</strong> Wheat at ₹1,840/qtl — Likely trader exploitation.</p>
                  <p className="text-xs text-gray-500 mt-1">12 min ago</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-2.5 h-2.5 bg-[#e18b2c] mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-hind text-[#1a1a1a]"><strong>Karnal Mandi:</strong> Wheat at ₹2,100/qtl — Below MSP.</p>
                  <p className="text-xs text-gray-500 mt-1">45 min ago</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-2.5 h-2.5 bg-[#c82b28] mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-hind text-[#1a1a1a]"><strong>Input Alert:</strong> Unregistered pesticide dealer in Nashik. 12 farmers at risk.</p>
                  <p className="text-xs text-gray-500 mt-1">1 hr ago</p>
                </div>
              </div>
            </div>
          </div>
          {/* Quick Actions */}
          <div className={theme.classes.card}>
            <div className="p-4 border-b border-[#e5e3d7]">
              <h2 className={theme.classes.heading2}>System Actions</h2>
            </div>
            <div className="grid grid-cols-2 gap-px bg-[#e5e3d7] p-[1px]">
               <button onClick={() => onNavigate("heatmap")} className="bg-white p-5 hover:bg-gray-50 flex items-center gap-4 transition-colors text-left text-sm font-bold"><MapPin className="w-5 h-5 text-[#3174a1]" /> Regional Map</button>
               <button onClick={() => onNavigate("fraud")} className="bg-white p-5 hover:bg-gray-50 flex items-center gap-4 transition-colors text-left text-sm font-bold"><ShieldCheck className="w-5 h-5 text-[#c82b28]" /> Audit Fraud Logs</button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* Chart Area */}
          <div className={theme.classes.card}>
             <div className="p-4 border-b border-[#e5e3d7]"><h2 className={theme.classes.heading2}>Wheat Price Trend</h2></div>
             <div className="p-4 h-[250px] relative">
               <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-x-12 inset-y-8 w-[calc(100%-3rem)] h-[calc(100%-3rem)] overflow-visible">
                 <polyline points="0,30 20,32 40,28 60,35 75,45 85,75 100,85" fill="none" stroke="#d4cb7e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
               </svg>
             </div>
          </div>
          {/* Recent Cases */}
          <div className={theme.classes.card}>
             <div className="p-4 border-b border-[#e5e3d7]"><h2 className={theme.classes.heading2}>Escalated Cases</h2></div>
             <div className="w-full overflow-x-auto">
               <table className="w-full text-left border-collapse text-sm">
                 <tbody className="text-sm">
                   <tr className="border-b hover:bg-gray-50 transition-colors">
                     <td className="p-3 font-bold">#CF-4872</td>
                     <td className="p-3 text-gray-600">Fake Seeds</td>
                     <td className="p-3"><span className="bg-red-100 text-red-700 font-bold text-[10px] px-2 py-0.5 uppercase">Escalated</span></td>
                   </tr>
                 </tbody>
               </table>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// ----------------------------------------------------------------------
// NGO DASHBOARD (Field operator focus)
// ----------------------------------------------------------------------
const NgoDashboard = ({ onNavigate }: { onNavigate: any }) => {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="bg-[#13311c] text-white p-6 border-l-4 border-[#e18b2c] shadow-sm mb-6 flex items-center justify-between">
         <div>
            <h2 className="font-mukta font-bold text-2xl mb-1">Field Operator Active</h2>
            <p className="font-hind text-white/80">You have <span className="text-[#d4cb7e] font-bold">12 pending verifications</span> in Nashik District.</p>
         </div>
         <button onClick={() => onNavigate("fraud")} className="bg-[#e18b2c] text-white px-4 py-2 font-bold text-sm tracking-wide">
            Start Verification Batch
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Verification Queue */}
        <div className={theme.classes.card}>
           <div className="p-4 border-b border-[#e5e3d7] bg-gray-50 flex justify-between items-center">
             <h2 className={theme.classes.heading2}>Pending Identity Verification</h2>
             <span className={theme.classes.badgeInfo}>AI Flagged</span>
           </div>
           <div>
             <table className="w-full text-left border-collapse">
               <tbody className="text-sm font-hind">
                 <tr className="border-b border-gray-100 hover:bg-gray-50">
                   <td className="p-4">
                     <p className="font-bold text-[#1a1a1a]">Ramesh Yadav</p>
                     <p className="text-xs text-gray-500">ID Verification #8821</p>
                   </td>
                   <td className="p-4 text-right">
                     <div className="flex gap-2 justify-end">
                       <button className="text-green-600 hover:bg-green-50 p-2"><CheckCircle className="w-5 h-5"/></button>
                       <button className="text-red-600 hover:bg-red-50 p-2"><XCircle className="w-5 h-5"/></button>
                     </div>
                   </td>
                 </tr>
                 <tr className="hover:bg-gray-50">
                   <td className="p-4">
                     <p className="font-bold text-[#1a1a1a]">Manish Kumar</p>
                     <p className="text-xs text-gray-500">Loan Rejection Review #7712</p>
                   </td>
                   <td className="p-4 text-right">
                     <button className="text-blue-600 text-xs font-bold uppercase underline">Review Case</button>
                   </td>
                 </tr>
               </tbody>
             </table>
           </div>
        </div>

        {/* AI Fraud Flags for Field Operator */}
        <div className={theme.classes.card}>
           <div className="p-4 border-b border-[#e5e3d7] bg-[#fdf2f2] flex justify-between items-center">
             <h2 className={theme.classes.heading2 + " text-[#c82b28]"}>High-Priority Field Alerts</h2>
             <span className={theme.classes.badgeError}>Requires Action</span>
           </div>
           <div className="p-0">
              <div className="p-4 border-b border-gray-100 flex gap-4 hover:bg-gray-50 cursor-pointer">
                 <div className="mt-1"><AlertTriangle className="w-5 h-5 text-[#c82b28]" /></div>
                 <div>
                    <p className="font-bold text-sm text-[#1a1a1a]">Pesticide Fraud Ring Detected</p>
                    <p className="text-xs text-gray-600 mt-1">AI flagged 3 similar fake pesticide scans from dealer "Bharat Krishi Kendra" in your sector.</p>
                 </div>
              </div>
              <div className="p-4 flex gap-4 hover:bg-gray-50 cursor-pointer">
                 <div className="mt-1"><Clock className="w-5 h-5 text-[#e18b2c]" /></div>
                 <div>
                    <p className="font-bold text-sm text-[#1a1a1a]">Urgent Legal Overdue</p>
                    <p className="text-xs text-gray-600 mt-1">Case #CF-4871 requires physical documentation collection from farmer.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};


// ----------------------------------------------------------------------
// FARMER DASHBOARD (Simple, actionable, no system data)
// ----------------------------------------------------------------------
const FarmerDashboard = ({ onNavigate }: { onNavigate: any }) => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* Friendly Greeting */}
      <div className="bg-[#408447] text-white p-6 shadow-sm border border-[#13311c]/20">
         <h2 className="font-mukta font-bold text-2xl">Good Morning, Suresh!</h2>
         <div className="mt-4 flex flex-wrap gap-4">
            <div className="bg-black/10 px-4 py-2 flex items-center gap-2">
               <Store className="w-4 h-4 text-[#d4cb7e]" />
               <span className="font-bold text-sm">Nashik Mandi (Open)</span>
            </div>
            <div className="bg-black/10 px-4 py-2 flex items-center gap-2">
               <Activity className="w-4 h-4 text-green-300" />
               <span className="font-bold text-sm">Verification: Approved</span>
            </div>
         </div>
      </div>

      {/* Primary Actions Grid */}
      <h3 className="font-bold text-xs uppercase text-gray-500 tracking-wider">What would you like to do?</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <button onClick={() => onNavigate("mandi")} className="bg-white border border-[#e5e3d7] p-6 hover:border-[#408447] flex flex-col justify-center gap-3 transition-colors shadow-sm">
            <div className="w-10 h-10 bg-[#f1f8f3] text-[#408447] flex items-center justify-center shrink-0 mx-auto"><Store className="w-5 h-5"/></div>
            <span className="font-bold text-[13px] text-center leading-tight">Check Crop Prices</span>
         </button>

         <button onClick={() => onNavigate("fraud")} className="bg-white border border-[#e5e3d7] p-6 hover:border-[#c82b28] flex flex-col justify-center gap-3 transition-colors shadow-sm">
            <div className="w-10 h-10 bg-[#fdf2f2] text-[#c82b28] flex items-center justify-center shrink-0 mx-auto"><ShieldCheck className="w-5 h-5"/></div>
            <span className="font-bold text-[13px] text-center leading-tight">Verify Pesticide</span>
         </button>

         <button onClick={() => onNavigate("loan")} className="bg-white border border-[#e5e3d7] p-6 hover:border-[#3174a1] flex flex-col justify-center gap-3 transition-colors shadow-sm">
            <div className="w-10 h-10 bg-[#eef6fc] text-[#3174a1] flex items-center justify-center shrink-0 mx-auto"><Landmark className="w-5 h-5"/></div>
            <span className="font-bold text-[13px] text-center leading-tight">Loan Guidance</span>
         </button>

         <button onClick={() => onNavigate("legal")} className="bg-white border border-[#e5e3d7] p-6 hover:border-[#e18b2c] flex flex-col justify-center gap-3 transition-colors shadow-sm">
            <div className="w-10 h-10 bg-[#fdf5e8] text-[#e18b2c] flex items-center justify-center shrink-0 mx-auto"><Scale className="w-5 h-5"/></div>
            <span className="font-bold text-[13px] text-center leading-tight">File Complaint</span>
         </button>
      </div>

      {/* AI Trust / Recent Decisions (Requirement 3 from output principle) */}
      <div className={theme.classes.card + " mt-8"}>
         <div className="p-4 border-b border-[#e5e3d7] bg-gray-50">
            <h2 className={theme.classes.heading2}>Recent System Decisions</h2>
         </div>
         <div className="p-5 space-y-4">
            
            {/* Example of the AI output principle requirement */}
            <div className="bg-[#f1f8f3] border-l-4 border-[#408447] p-4 flex gap-4">
              <CheckCircle className="w-5 h-5 text-[#408447] shrink-0" />
              <div>
                 <p className="font-bold text-sm text-[#1a1a1a]">Input Status: Verified</p>
                 <p className="text-sm font-hind text-gray-700 mt-1">The SuperGro fertilizer you scanned yesterday is authentic. You are good to use it.</p>
              </div>
            </div>

            <div className="bg-[#fdf5e8] border-l-4 border-[#e18b2c] p-4 flex gap-4">
              <Clock className="w-5 h-5 text-[#e18b2c] shrink-0" />
              <div>
                 <p className="font-bold text-sm text-[#1a1a1a]">Complaint Status: Pending NGO Review</p>
                 <p className="text-sm font-hind text-gray-700 mt-1">Your case (#CF-4871) regarding the loan rejection is waiting for a local field operator to verify the documents.</p>
              </div>
            </div>

         </div>
      </div>
    </div>
  );
};


// ----------------------------------------------------------------------
// MAIN EXPORT
// ----------------------------------------------------------------------
const HomeDashboard = ({ onNavigate, role }: HomeDashboardProps) => {
  if (role === "admin") return <AdminDashboard onNavigate={onNavigate} />;
  if (role === "ngo") return <NgoDashboard onNavigate={onNavigate} />;
  return <FarmerDashboard onNavigate={onNavigate} />;
};

export default HomeDashboard;