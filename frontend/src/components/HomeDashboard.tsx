import { theme } from "@/designSystem";
import { 
  Users, AlertTriangle, FileText, IndianRupee, 
  Store, ShieldCheck, FileKey, Scale,
  ChevronRight
} from "lucide-react";
import type { Lang } from "@/pages/Index";

interface HomeDashboardProps {
  onNavigate: (screen: "mandi" | "fraud" | "loan" | "legal" | "heatmap") => void;
  lang: Lang;
  onToggleLang: () => void;
}

const HomeDashboard = ({ onNavigate }: HomeDashboardProps) => {

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

      {/* DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Live Anomaly Feed */}
          <div className={`${theme.classes.card} h-[400px] flex flex-col`}>
            <div className="p-4 border-b border-[#e5e3d7] flex items-center justify-between bg-white">
              <h2 className={theme.classes.heading2}>Live Anomaly Feed</h2>
              <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" /> LIVE
              </span>
            </div>
            <div className="p-4 overflow-y-auto flex-1 space-y-5">
              
              <div className="flex gap-3">
                <div className="w-2.5 h-2.5 bg-[#c82b28] mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-hind text-[#1a1a1a]">
                    <strong>Azadpur Mandi:</strong> Wheat at ₹1,840/qtl — 38% below average. Likely trader exploitation.
                  </p>
                  <p className="text-xs text-gray-500 mt-1">12 min ago</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-2.5 h-2.5 bg-[#e18b2c] mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-hind text-[#1a1a1a]">
                    <strong>Karnal Mandi:</strong> Wheat at ₹2,100/qtl — 22.8% below average. Below MSP.
                  </p>
                  <p className="text-xs text-gray-500 mt-1">45 min ago</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-2.5 h-2.5 bg-[#c82b28] mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-hind text-[#1a1a1a]">
                    <strong>Input Alert:</strong> Unregistered pesticide dealer detected in Nashik. 12 farmers at risk.
                  </p>
                  <p className="text-xs text-gray-500 mt-1">1 hr ago</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-2.5 h-2.5 bg-[#3174a1] mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-hind text-[#1a1a1a]">
                    <strong>Loan Appeal:</strong> Ramesh Yadav's KCC appeal generated. SBI Nashik violated RBI §4.2(b).
                  </p>
                  <p className="text-xs text-gray-500 mt-1">3 hrs ago</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-2.5 h-2.5 bg-[#408447] mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-hind text-[#1a1a1a]">
                    <strong>Case Resolved:</strong> Meena Devi vs. Karnal Mandi — ₹34,200 compensation awarded.
                  </p>
                  <p className="text-xs text-gray-500 mt-1">5 hrs ago</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-2.5 h-2.5 bg-[#e18b2c] mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-hind text-[#1a1a1a]">
                    <strong>Nagpur Mandi:</strong> Wheat at ₹1,950/qtl — 27.2% below average.
                  </p>
                  <p className="text-xs text-gray-500 mt-1">6 hrs ago</p>
                </div>
              </div>

            </div>
          </div>

          {/* Quick Actions */}
          <div className={theme.classes.card}>
            <div className="p-4 border-b border-[#e5e3d7]">
              <h2 className={theme.classes.heading2}>Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 gap-px bg-[#e5e3d7] p-[1px]">
              <button 
                onClick={() => onNavigate("mandi")}
                className="bg-white p-5 hover:bg-gray-50 flex items-center gap-4 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-[#eef4f0] text-[#408447] flex items-center justify-center flex-shrink-0">
                  <Store className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm text-[#1a1a1a]">Check Mandi Prices</span>
              </button>
              
              <button 
                onClick={() => onNavigate("fraud")}
                className="bg-white p-5 hover:bg-gray-50 flex items-center gap-4 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-[#fde9eb] text-[#c82b28] flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm text-[#1a1a1a]">Verify Product</span>
              </button>
              
              <button 
                onClick={() => onNavigate("loan")}
                className="bg-white p-5 hover:bg-gray-50 flex items-center gap-4 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-[#eef6fc] text-[#3174a1] flex items-center justify-center flex-shrink-0">
                  <FileKey className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm text-[#1a1a1a]">Decode Rejection</span>
              </button>
              
              <button 
                onClick={() => onNavigate("legal")}
                className="bg-white p-5 hover:bg-gray-50 flex items-center gap-4 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-[#fdf5e8] text-[#e18b2c] flex items-center justify-center flex-shrink-0">
                  <Scale className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm text-[#1a1a1a]">File Complaint</span>
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (Span 1) */}
        <div className="space-y-6">
          
          {/* Chart Area */}
          <div className={theme.classes.card}>
             <div className="p-4 border-b border-[#e5e3d7] flex items-center justify-between">
                <h2 className={theme.classes.heading2}>Wheat Price Trend — 7 Days</h2>
                <select className="text-xs border border-gray-200 px-2 py-1 outline-none">
                  <option>Wheat</option>
                  <option>Rice</option>
                </select>
             </div>
             <div className="p-4 h-[250px] relative">
               {/* Mock Grid Lines */}
               <div className="absolute inset-x-4 top-4 bottom-8 flex flex-col justify-between">
                  {['₹3,186', '₹2,887', '₹2,589', '₹2,290', '₹1,991', '₹1,693'].map(label => (
                    <div key={label} className="flex items-center gap-3">
                      <span className="text-[10px] text-gray-400 w-8">{label}</span>
                      <div className="h-px bg-gray-100 flex-1 relative">
                        {label === '₹2,290' && <div className="absolute inset-0 border-t border-dashed border-green-400" />}
                      </div>
                    </div>
                  ))}
               </div>
               
               {/* Mock Line Chart SVG matching reference */}
               <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-x-12 inset-y-8 w-[calc(100%-3rem)] h-[calc(100%-3rem)] overflow-visible">
                 <polyline 
                   points="0,30 20,32 40,28 60,35 75,45 85,75 100,85" 
                   fill="none" 
                   stroke="#d4cb7e" 
                   strokeWidth="2" 
                   strokeLinecap="round" 
                   strokeLinejoin="round" 
                 />
                 {[
                   {x:0, y:30}, {x:20, y:32}, {x:40, y:28}, {x:60, y:35}, {x:75, y:45}, {x:85, y:75}, {x:100, y:85}
                 ].map((pt, i) => (
                   <circle key={i} cx={pt.x} cy={pt.y} r="1.5" fill="#d4cb7e" stroke="white" strokeWidth="0.5" />
                 ))}
               </svg>
             </div>
          </div>

          {/* Recent Cases */}
          <div className={theme.classes.card}>
             <div className="p-4 border-b border-[#e5e3d7] flex items-center justify-between">
                <h2 className={theme.classes.heading2}>Recent Cases</h2>
                <button className="text-xs text-[#13311c] hover:underline flex items-center gap-1 font-bold">
                  View All <ChevronRight className="w-3 h-3" />
                </button>
             </div>
             <div className="w-full overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-[#fbfaf5]">
                     <th className="py-3 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-[#e5e3d7]">Case ID</th>
                     <th className="py-3 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-[#e5e3d7]">Farmer</th>
                     <th className="py-3 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-[#e5e3d7]">Type</th>
                     <th className="py-3 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-[#e5e3d7]">Status</th>
                   </tr>
                 </thead>
                 <tbody className="text-sm">
                   <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                     <td className="py-3 px-4 font-bold text-[#1a1a1a]">#CF-4872</td>
                     <td className="py-3 px-4 text-gray-700">Suresh Patil</td>
                     <td className="py-3 px-4 text-gray-600">Fake Seeds</td>
                     <td className="py-3 px-4">
                       <span className="bg-green-100 text-green-700 font-bold text-[10px] px-2 py-0.5 uppercase">Filed</span>
                     </td>
                   </tr>
                   <tr className="hover:bg-gray-50 transition-colors">
                     <td className="py-3 px-4 font-bold text-[#1a1a1a]">#CF-4871</td>
                     <td className="py-3 px-4 text-gray-700">Ramesh Yadav</td>
                     <td className="py-3 px-4 text-gray-600">Loan Rejection</td>
                     <td className="py-3 px-4">
                       <span className="bg-blue-100 text-blue-700 font-bold text-[10px] px-2 py-0.5 uppercase">In Progress</span>
                     </td>
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

export default HomeDashboard;