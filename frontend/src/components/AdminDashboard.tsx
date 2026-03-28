import { useState, useEffect, useCallback } from "react";
import { 
  Users, Search, ShieldCheck, ShieldAlert,
  AlertTriangle, Filter, MoreVertical,
  CheckCircle, XCircle, RotateCcw,
  UserCheck, Shield, MapPin, Globe
} from "lucide-react";
import { theme } from "@/designSystem";
import { apiClient } from "@/lib/apiClient";
import { APIResponse } from "@/lib/api";
import { toast } from "sonner";

interface AdminUser {
  id: string;
  phone: string;
  email: string | null;
  role: "farmer" | "ngo" | "admin";
  verification_status: string;
  phone_verified: boolean;
  ngo_verified: boolean;
  profile: any;
  created_at: string;
}

const AdminDashboard = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [overrideStatus, setOverrideStatus] = useState("");
  const [overrideReason, setOverrideReason] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const roleParam = roleFilter === "all" ? "" : `&role=${roleFilter}`;
      const res = await apiClient.get<APIResponse<AdminUser[]>>(`/admin/users?limit=200${roleParam}`);
      if (res.data.status === "success") {
        setUsers(res.data.data);
      }
    } catch (e) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleVerifyNGO = async (userId: string, approve: boolean) => {
    try {
      await apiClient.post("/admin/verify-ngo", { user_id: userId, approve });
      toast.success(approve ? "NGO Approved" : "NGO Rejected");
      fetchUsers();
    } catch (e) {
      toast.error("Process failed");
    }
  };

  const handleOverride = async () => {
    if (!selectedUser || !overrideStatus) return;
    try {
      await apiClient.post("/admin/override-verification", {
        user_id: selectedUser.id,
        status: overrideStatus,
        reason: overrideReason || "Manual Admin Override"
      });
      toast.success("Status Overridden");
      setIsOverrideOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (e) {
      toast.error("Override failed");
    }
  };

  const filteredUsers = users.filter(u => 
    u.phone?.includes(searchTerm) || 
    u.profile?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.profile?.org_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-20">
      
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 border-b border-[#e5e3d7] shadow-sm">
        <div>
          <h1 className="font-mukta font-black text-3xl text-[#1a1a1a]">Master Control Center</h1>
          <p className="font-hind text-gray-500 text-sm italic">Administrative access level 4 active.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 border border-[#e5e3d7] px-3 py-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select 
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent text-xs font-bold uppercase tracking-wider outline-none"
            >
              <option value="all">All Roles</option>
              <option value="farmer">Farmers</option>
              <option value="ngo">NGOs</option>
              <option value="admin">Admins</option>
            </select>
          </div>
          <button onClick={fetchUsers} className="p-2 border border-[#e5e3d7] hover:bg-gray-50">
             <RotateCcw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Search & Metrics ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 relative">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
           <input 
             type="text" 
             placeholder="Search by name, organization or phone..."
             className="w-full pl-12 pr-4 py-4 bg-white border-2 border-[#e5e3d7] font-hind font-bold focus:border-[#e18b2c] outline-none transition-all placeholder:text-gray-300"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
        <div className="bg-[#1a1a1a] text-white p-4 flex flex-col justify-center border-b-4 border-[#e18b2c]">
           <p className="text-[10px] font-black uppercase tracking-widest text-[#e18b2c]">Live Count</p>
           <p className="text-3xl font-mukta font-black leading-none mt-1">{filteredUsers.length}</p>
        </div>
      </div>

      {/* ── User Table ── */}
      <div className="bg-white border border-[#e5e3d7] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-[#e5e3d7]">
                <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">User / Identity</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Location / Stats</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Verification Lifecycle</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Access Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-20 text-center">
                    <div className="w-8 h-8 border-2 border-[#e18b2c] border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-[#fefdf9] transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 flex items-center justify-center font-bold text-xs ${
                        user.role === 'admin' ? 'bg-black text-white' : 
                        user.role === 'ngo' ? 'bg-[#e18b2c] text-white' : 
                        'bg-[#408447] text-white'
                      }`}>
                        {user.role === 'ngo' ? 'NG' : user.role === 'admin' ? 'AD' : 'FR'}
                      </div>
                      <div>
                        <p className="font-mukta font-bold text-sm text-[#1a1a1a]">
                           {user.role === 'ngo' ? user.profile?.org_name : user.profile?.name || user.phone}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 mt-0.5">{user.id.slice(0,8).toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                     {user.role === 'farmer' ? (
                       <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                          <MapPin className="w-3 h-3" /> {user.profile?.village || 'Not Set'}, {user.profile?.district || '-'}
                       </div>
                     ) : user.role === 'ngo' ? (
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                           <Globe className="w-3 h-3" /> {user.profile?.website || 'No website'}
                        </div>
                     ) : (
                        <span className="text-[10px] font-black text-gray-300 italic">SYSTEM_ACCOUNT</span>
                     )}
                  </td>
                  <td className="p-4">
                     <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border ${
                          user.verification_status === 'verified' ? 'bg-[#f1f8f3] text-[#408447] border-[#408447]/20' :
                          user.verification_status === 'rejected' ? 'bg-[#fdf2f2] text-[#c82b28] border-[#c82b28]/20' :
                          'bg-[#fdf5e8] text-[#e18b2c] border-[#e18b2c]/20'
                        }`}>
                          {user.verification_status}
                        </span>
                        {user.role === 'ngo' && !user.ngo_verified && (
                           <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleVerifyNGO(user.id, true)} className="text-green-600 hover:scale-110"><CheckCircle className="w-4 h-4"/></button>
                              <button onClick={() => handleVerifyNGO(user.id, false)} className="text-red-600 hover:scale-110"><XCircle className="w-4 h-4"/></button>
                           </div>
                        )}
                     </div>
                  </td>
                  <td className="p-4">
                     <button 
                       onClick={() => { setSelectedUser(user); setIsOverrideOpen(true); }}
                       className="text-[10px] font-black uppercase tracking-widest text-[#3174a1] hover:underline flex items-center gap-1"
                     >
                        <Shield className="w-3 h-3" /> Override
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Override Modal ── */}
      {isOverrideOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <div className="bg-white max-w-md w-full border-t-8 border-[#e18b2c] shadow-2xl p-6" style={{ animation: 'slide-up-fade 0.3s ease-out' }}>
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <h2 className="font-mukta font-black text-2xl text-[#1a1a1a]">Security Override</h2>
                    <p className="text-xs font-bold text-gray-500 mt-1 uppercase">User: {selectedUser.phone}</p>
                 </div>
                 <ShieldAlert className="w-8 h-8 text-[#c82b28]" />
              </div>

              <div className="space-y-4">
                 <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">New Verification Status</label>
                    <div className="grid grid-cols-3 gap-2">
                       {['unverified', 'verified', 'rejected'].map(s => (
                         <button 
                           key={s}
                           onClick={() => setOverrideStatus(s)}
                           className={`py-3 text-[10px] font-black uppercase tracking-widest border transition-all ${
                             overrideStatus === s ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'bg-white text-gray-400 border-gray-200 hover:border-black hover:text-black'
                           }`}
                         >
                           {s}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Override Reason (Required)</label>
                    <textarea 
                      className="w-full h-24 p-4 border-2 border-[#e5e3d7] font-hind font-bold text-sm outline-none focus:border-[#e18b2c]"
                      placeholder="Explain why this manual status change is required..."
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                    />
                 </div>

                 <div className="flex gap-3 pt-4">
                    <button 
                      onClick={() => { setIsOverrideOpen(false); setSelectedUser(null); }}
                      className="flex-1 py-3 text-xs font-black uppercase border border-gray-200 hover:bg-gray-50 bg-white"
                    >
                       Cancel
                    </button>
                    <button 
                      onClick={handleOverride}
                      disabled={!overrideStatus || !overrideReason}
                      className="flex-1 py-3 text-xs font-black uppercase bg-[#c82b28] text-white hover:bg-[#8f1e1c] disabled:opacity-30 transition-all"
                    >
                       Execute Override
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
