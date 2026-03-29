import { useState, useEffect, useCallback } from "react";
import { 
  Users, Search, ShieldCheck, ShieldAlert,
  AlertTriangle, Filter, RotateCcw,
  Shield, MapPin, Globe, CheckCircle, XCircle, Clock,
  Activity
} from "lucide-react";
import { adminApi, ngoApi, profileApi, requestApi } from "@/api/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface AdminUser {
  id: string;
  phone: string;
  email: string | null;
  role: "farmer" | "ngo" | "admin";
  verification_status: string;
  phone_verified: boolean;
  ngo_verified: boolean;
  profile?: any;
  created_at: string;
}

const AdminDashboard = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [allRequests, setAllRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<"users" | "intelligence">("users");
  
  // Assignment Modal State
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [ngos, setNgos] = useState<AdminUser[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [uRes, rRes] = await Promise.all([
        adminApi.getUsers(),
        requestApi.getAllRequests()
      ]);
      
      const userList = uRes.data.data;
      setUsers(userList);
      setAllRequests(rRes.data.data);
      setNgos(userList.filter((u: any) => u.role === 'ngo'));
    } catch (e) {
      toast.error("Cloud synchronization failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleVerifyNGO = async (userId: string, approve: boolean) => {
    try {
      await adminApi.verifyNGO({ user_id: userId, approve });
      toast.success(approve ? "NGO credentials approved" : "NGO credentials rejected");
      fetchData();
    } catch (e) {
      toast.error("Transaction failed");
    }
  };

  const assignNGO = async (ngoId: string) => {
    if (!selectedReq) return;
    try {
      await requestApi.updateStatus(selectedReq.id, {
        status: "open",
        assigned_ngo_id: ngoId
      } as any);
      toast.success("NGO linked to request successfully");
      setIsAssignOpen(false);
      setSelectedReq(null);
      fetchData();
    } catch (e) {
      toast.error("Assignment failed");
    }
  };

  const filteredUsers = users.filter(u => 
    u.phone?.includes(searchTerm) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-20">
      
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 border border-[#e5e3d7] shadow-sm mt-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#3174a1]/5 rounded-none rotate-45 -mr-16 -mt-16" />
        <div className="relative z-10">
          <h1 className="font-mukta font-black text-4xl text-[#1a1a1a] tracking-tight">Master Control Center</h1>
          <p className="font-hind text-gray-400 text-sm uppercase font-black tracking-widest mt-1">Level 4 Administrative Privilege Active</p>
        </div>
        <div className="flex items-center gap-2 bg-[#fbfaf5] p-1 border border-[#e5e3d7]">
           <button 
             onClick={() => setView("users")}
             className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${view === 'users' ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}
           >
             User Control
           </button>
           <button 
             onClick={() => setView("intelligence")}
             className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${view === 'intelligence' ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}
           >
             Global Intel
           </button>
        </div>
      </div>

      {/* ── View: User Control ── */}
      {view === "users" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3 relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
               <input 
                 type="text" 
                 placeholder="Search identities (phone, ID, email)..."
                 className="w-full pl-12 pr-4 py-4 bg-white border-2 border-[#e5e3d7] font-hind font-bold focus:border-[#3174a1] outline-none transition-all"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            <div className="bg-[#1a1a1a] text-white p-4 flex flex-col justify-center border-b-4 border-[#3174a1]">
               <p className="text-[10px] font-black uppercase tracking-widest text-[#3174a1]">Active Count</p>
               <p className="text-3xl font-mukta font-black mt-1">{filteredUsers.length}</p>
            </div>
          </div>

          <div className="bg-white border border-[#e5e3d7] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-[#e5e3d7]">
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Identity</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 italic">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                       <span className={`inline-block w-2 h-2 rounded-full mr-2 ${user.role === 'admin' ? 'bg-black' : user.role === 'ngo' ? 'bg-[#e18b2c]' : 'bg-[#408447]'}`} />
                       <span className="font-bold text-sm text-gray-800">{user.email || user.phone}</span>
                       <span className="ml-2 text-[9px] font-black uppercase text-gray-300">{user.role}</span>
                    </td>
                    <td className="p-4">
                       <span className={`text-[10px] font-black uppercase px-2 py-0.5 border ${
                         user.verification_status === 'verified' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                       }`}>
                         {user.verification_status}
                       </span>
                    </td>
                    <td className="p-4">
                       {user.role === 'ngo' && !user.ngo_verified && (
                         <div className="flex gap-2">
                            <button onClick={() => handleVerifyNGO(user.id, true)} className="text-green-600 hover:scale-110 active:scale-95"><CheckCircle className="w-5 h-5"/></button>
                            <button onClick={() => handleVerifyNGO(user.id, false)} className="text-red-500 hover:scale-110 active:scale-95"><XCircle className="w-5 h-5"/></button>
                         </div>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── View: Global Intel ── */}
      {view === "intelligence" && (
        <div className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-[#e5e3d7] p-6 shadow-sm">
                 <h3 className="font-mukta font-black text-xl uppercase tracking-tight mb-6 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" /> Platform Transaction Log
                 </h3>
                 <div className="space-y-3">
                    {allRequests.slice(0, 10).map((r, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-[#fbfaf5] border border-[#e5e3d7] hover:border-[#3174a1]/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 ${r.request_type.includes('fraud') ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-[#3174a1]'}`}>
                            <Activity className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase text-gray-400">{r.request_type.replace('_', ' ')}</p>
                            <p className="font-bold text-xs text-gray-800">{new Date(r.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                           {r.assigned_ngo_id ? (
                             <span className="text-[9px] font-black text-green-600 uppercase">Assigned</span>
                           ) : (
                             <button 
                               onClick={() => { setSelectedReq(r); setIsAssignOpen(true); }}
                               className="text-[9px] font-black text-[#3174a1] uppercase border border-[#3174a1] px-2 py-1 hover:bg-[#3174a1] hover:text-white transition-all"
                             >
                               Link NGO
                             </button>
                           )}
                           <span className={`text-[9px] font-black uppercase text-gray-400`}>{r.status}</span>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="bg-white border border-[#e5e3d7] p-6 shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-full h-1 bg-[#408447]" />
                 <h3 className="font-mukta font-black text-xl uppercase tracking-tight mb-6 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#408447]" /> Verification Monitoring
                 </h3>
                 <div className="p-8 text-center text-gray-300 font-bold italic border-2 border-dashed">
                    Deep analysis mode initializing...
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* ── NGO Assignment Modal ── */}
      {isAssignOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <div className="bg-white max-w-md w-full border-t-8 border-[#3174a1] shadow-2xl p-6">
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <h2 className="font-mukta font-black text-2xl text-[#1a1a1a]">Link NGO Provider</h2>
                    <p className="text-xs font-bold text-gray-500 mt-1 uppercase">Request: {selectedReq?.request_type} - {selectedReq?.id.slice(0,8)}</p>
                 </div>
                 <XCircle onClick={() => setIsAssignOpen(false)} className="w-6 h-6 text-gray-300 cursor-pointer hover:text-black" />
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                 {ngos.map(ngo => (
                   <button 
                     key={ngo.id}
                     onClick={() => assignNGO(ngo.id)}
                     className="w-full p-4 flex items-center justify-between border border-[#e5e3d7] hover:border-black transition-all group"
                   >
                     <div className="text-left font-mukta font-bold">
                        <p className="text-sm">{ngo.email}</p>
                        <p className="text-[10px] text-gray-400 font-black uppercase">{ngo.id.slice(0,8)}</p>
                     </div>
                     <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-black" />
                   </button>
                 ))}
              </div>
              
              <button 
                onClick={() => setIsAssignOpen(false)}
                className="w-full py-3 mt-6 text-xs font-black uppercase border border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

const ChevronRight = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="9 5l7 7-7 7" />
  </svg>
);

export default AdminDashboard;
