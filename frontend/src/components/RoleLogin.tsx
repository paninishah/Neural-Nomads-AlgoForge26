import { useState } from "react";
import { theme } from "@/designSystem";
import { Shield, Sprout, Briefcase, ArrowRight, UserPlus, LogIn } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import { APIResponse, LoginResponse } from "@/lib/api";

export type Role = "farmer" | "ngo" | "admin";
type AuthMode = "login" | "register";

interface RoleLoginProps {
  onLogin: (role: Role) => void;
}

const RoleLogin = ({ onLogin }: RoleLoginProps) => {
  const [selectedRole, setSelectedRole] = useState<Role>("farmer");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);

  // Form states
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [stateName, setStateName] = useState("");
  const [district, setDistrict] = useState("");
  
  const [email, setEmail] = useState("");
  const [operatorName, setOperatorName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [adminId, setAdminId] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (selectedRole === "farmer") {
        if (authMode === "login") {
          res = await apiClient.post<APIResponse<LoginResponse>>("/auth/login", { phone, password });
        } else {
          res = await apiClient.post<APIResponse<LoginResponse>>("/auth/register", { name, phone, password, state: stateName, district, role: "farmer" });
        }
      } else if (selectedRole === "ngo") {
        if (authMode === "login") {
          res = await apiClient.post<APIResponse<LoginResponse>>("/auth/ngo/login", { email, password });
        } else {
          res = await apiClient.post<APIResponse<LoginResponse>>("/auth/ngo/register", { email, password, operator_full_name: operatorName, organization_name: orgName });
        }
      } else if (selectedRole === "admin") {
        // Mock admin phone is usually used here (e.g. 9999999001 for "SYS-ADMIN-XX")
        const loginPhone = adminId.includes("SYS") ? "9999999001" : adminId; 
        res = await apiClient.post<APIResponse<LoginResponse>>("/auth/login", { phone: loginPhone, password });
      }

      if (res?.data.status === "success" || res?.data.token) {
        const d = res.data.data;
        if (d.token)   localStorage.setItem("annadata_token", d.token);
        if (d.user_id) localStorage.setItem("annadata_user_id", d.user_id);
        if (d.role)    localStorage.setItem("annadata_role", d.role);
        // Store registration form location immediately (available even before profile is created)
        if (stateName) localStorage.setItem("annadata_user_state", stateName);
        if (district)  localStorage.setItem("annadata_user_district", district);

        // Fetch full user details from /auth/me now that token is set
        try {
          const meRes = await apiClient.get("/auth/me");
          const me = meRes.data.data;
          // display_name is always populated (full_name for NGO, name for farmer/admin)
          if (me.display_name) localStorage.setItem("annadata_user_name", me.display_name);
          if (me.organization_name) localStorage.setItem("annadata_user_org", me.organization_name);
          if (me.phone)             localStorage.setItem("annadata_user_phone", me.phone);
          if (me.email)             localStorage.setItem("annadata_user_email", me.email);
          if (me.verification_status) localStorage.setItem("annadata_verification_status", me.verification_status);

          // Fetch profile to get state/district for mandi location filtering
          if (d.user_id) {
            try {
              const profileRes = await apiClient.get(`/profile/${d.user_id}`);
              const prof = profileRes.data.data;
              if (prof?.state)    localStorage.setItem("annadata_user_state", prof.state);
              if (prof?.district) localStorage.setItem("annadata_user_district", prof.district);
            } catch { /* profile may not exist yet for new users */ }
          }
        } catch (meErr) {
          console.warn("Could not fetch user details from /auth/me", meErr);
        }

        toast.success(res.data.message_text || "Success");
        onLogin(selectedRole);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || "Failed to authenticate");
    } finally {
      setLoading(false);
    }
  };

  // If user switches to Admin, force mode to login (admins can't self-register)
  const handleRoleSwitch = (role: Role) => {
     setSelectedRole(role);
     if (role === 'admin') setAuthMode('login');
  };

  return (
    <div className="min-h-screen bg-[#fbfaf5] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background motif */}
      <div className="absolute inset-0 z-0 opacity-5 flex items-center justify-center pointer-events-none">
         <Shield className="w-[800px] h-[800px] text-[#13311c]" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-white border border-[#e5e3d7] shadow-sm">
        
        {/* Header */}
        <div className="text-center pt-8 pb-6 border-b border-[#e5e3d7] bg-[#fbfaf5]">
          <h1 className="font-mukta font-black text-3xl text-[#1a1a1a] tracking-tight">Annadata <span className="text-[#13311c]">OS</span></h1>
          <p className="font-hind text-[#666666] text-xs mt-1 uppercase font-bold tracking-widest">Enterprise Gateway</p>
        </div>

        <div className="p-8">
          
          {/* Role Tabs */}
          <div className="grid grid-cols-3 gap-2 mb-8 bg-gray-50 border border-[#e5e3d7] p-1">
            <button 
              onClick={() => handleRoleSwitch("farmer")}
              className={`flex flex-col items-center py-3 transition-colors ${selectedRole === "farmer" ? "bg-white border border-[#e5e3d7] shadow-sm text-[#408447]" : "text-gray-500 hover:bg-gray-100"}`}
            >
              <Sprout className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Farmer</span>
            </button>
            <button 
              onClick={() => handleRoleSwitch("ngo")}
              className={`flex flex-col items-center py-3 transition-colors ${selectedRole === "ngo" ? "bg-white border border-[#e5e3d7] shadow-sm text-[#e18b2c]" : "text-gray-500 hover:bg-gray-100"}`}
            >
              <Briefcase className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-widest">NGO</span>
            </button>
            <button 
              onClick={() => handleRoleSwitch("admin")}
              className={`flex flex-col items-center py-3 transition-colors ${selectedRole === "admin" ? "bg-white border border-[#e5e3d7] shadow-sm text-[#3174a1]" : "text-gray-500 hover:bg-gray-100"}`}
            >
              <Shield className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Admin</span>
            </button>
          </div>

          {/* Contextual Header */}
          <div className="mb-6 flex justify-between items-end">
             <div>
               <h2 className="font-mukta font-bold text-xl text-[#1a1a1a]">
                 {selectedRole === "farmer" && (authMode === "login" ? "Farmer Login" : "Farmer Registration")}
                 {selectedRole === "ngo" && (authMode === "login" ? "NGO / Operator Login" : "NGO Registration")}
                 {selectedRole === "admin" && "Secure Admin Login"}
               </h2>
               <p className="text-xs text-[#666666] font-hind font-bold mt-1">
                 {selectedRole === "admin" ? "Restricted Access Only" : "Enter your credentials below"}
               </p>
             </div>
             
             {/* Auth Mode Toggle (Hidden for Admin) */}
             {selectedRole !== "admin" && (
               <div className="flex bg-gray-100 border border-[#e5e3d7] p-0.5">
                  <button 
                    onClick={() => setAuthMode("login")}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all ${authMode === "login" ? "bg-white shadow-sm text-[#1a1a1a]" : "text-gray-500"}`}
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => setAuthMode("register")}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all ${authMode === "register" ? "bg-white shadow-sm text-[#1a1a1a]" : "text-gray-500"}`}
                  >
                    Register
                  </button>
               </div>
             )}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* -------------------- FARMER FLOW -------------------- */}
            {selectedRole === "farmer" && (
              <>
                 {authMode === "register" && (
                   <>
                     <div>
                       <label className="block text-xs font-bold uppercase text-[#666666] mb-1">Full Name</label>
                       <div className={theme.classes.inputWrapper}>
                         <input type="text" placeholder="e.g. Ramesh Kumar" required className={theme.classes.inputText} value={name} onChange={(e) => setName(e.target.value)} />
                       </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                       <div>
                         <label className="block text-xs font-bold uppercase text-[#666666] mb-1">State</label>
                         <div className={theme.classes.inputWrapper}>
                           <input type="text" placeholder="e.g. Punjab" required className={theme.classes.inputText} value={stateName} onChange={(e) => setStateName(e.target.value)} />
                         </div>
                       </div>
                       <div>
                         <label className="block text-xs font-bold uppercase text-[#666666] mb-1">District</label>
                         <div className={theme.classes.inputWrapper}>
                           <input type="text" placeholder="e.g. Ludhiana" required className={theme.classes.inputText} value={district} onChange={(e) => setDistrict(e.target.value)} />
                         </div>
                       </div>
                     </div>
                   </>
                 )}
                 <div>
                   <label className="block text-xs font-bold uppercase text-[#666666] mb-1">Phone Number</label>
                   <div className={theme.classes.inputWrapper}>
                     <span className="pl-3 text-sm text-gray-500 font-bold border-r border-[#e5e3d7] pr-2">+91</span>
                     <input type="tel" pattern="[0-9]{10}" placeholder="10-digit mobile number" required className={theme.classes.inputText} value={phone} onChange={(e) => setPhone(e.target.value)} />
                   </div>
                 </div>
                 
                 <div>
                   <label className="block text-xs font-bold uppercase text-[#666666] mb-1">{authMode === 'register' ? 'Create Password' : 'Password'}</label>
                   <div className={theme.classes.inputWrapper}>
                     <input type="password" placeholder="••••••••" required className={theme.classes.inputText} value={password} onChange={(e) => setPassword(e.target.value)} />
                   </div>
                   {authMode === "register" && <p className="text-[10px] text-[#666666] mt-1 italic">Used to secure your wallet and legal records.</p>}
                 </div>
              </>
            )}

            {/* -------------------- NGO FLOW -------------------- */}
            {selectedRole === "ngo" && (
              <>
                 {authMode === "register" && (
                   <>
                     <div>
                       <label className="block text-xs font-bold uppercase text-[#666666] mb-1">Operator Full Name</label>
                       <div className={theme.classes.inputWrapper}>
                         <input type="text" placeholder="e.g. Amit Sharma" required className={theme.classes.inputText} value={operatorName} onChange={(e) => setOperatorName(e.target.value)} />
                       </div>
                     </div>
                     <div>
                       <label className="block text-xs font-bold uppercase text-[#666666] mb-1">Organization Name / ID</label>
                       <div className={theme.classes.inputWrapper}>
                         <input type="text" placeholder="e.g. Kisan Seva Kendra" required className={theme.classes.inputText} value={orgName} onChange={(e) => setOrgName(e.target.value)} />
                       </div>
                     </div>
                   </>
                 )}
                 <div>
                   <label className="block text-xs font-bold uppercase text-[#666666] mb-1">Email Address</label>
                   <div className={theme.classes.inputWrapper}>
                     <input type="email" placeholder="operator@ngo.org" required className={theme.classes.inputText} value={email} onChange={(e) => setEmail(e.target.value)} />
                   </div>
                 </div>
                 <div>
                   <label className="block text-xs font-bold uppercase text-[#666666] mb-1">{authMode === 'register' ? 'Create Password' : 'Password'}</label>
                   <div className={theme.classes.inputWrapper}>
                     <input type="password" placeholder="••••••••" required className={theme.classes.inputText} value={password} onChange={(e) => setPassword(e.target.value)} />
                   </div>
                 </div>
              </>
            )}

            {/* -------------------- ADMIN FLOW -------------------- */}
            {selectedRole === "admin" && (
               <>
                 <div>
                   <label className="block text-xs font-bold uppercase text-[#666666] mb-1">Secure Admin ID</label>
                   <div className={theme.classes.inputWrapper}>
                     <input type="text" placeholder="SYS-ADMIN-XX" required className={theme.classes.inputText} value={adminId} onChange={(e) => setAdminId(e.target.value)} />
                   </div>
                 </div>
                 <div>
                   <label className="block text-xs font-bold uppercase text-[#666666] mb-1">Master Password</label>
                   <div className={theme.classes.inputWrapper}>
                     <input type="password" placeholder="••••••••" required className={theme.classes.inputText} value={password} onChange={(e) => setPassword(e.target.value)} />
                   </div>
                 </div>
               </>
            )}

            <button 
              type="submit"
              disabled={loading}
              className={`${theme.classes.btnPrimary} w-full py-4 mt-6 font-bold text-base flex justify-center items-center gap-2`}
              style={{
                backgroundColor: selectedRole === "farmer" ? "#408447" : selectedRole === "ngo" ? "#e18b2c" : "#13311c",
                borderColor: selectedRole === "farmer" ? "#2a5a2f" : selectedRole === "ngo" ? "#a6630f" : "#000000"
              }}
            >
              {loading ? (
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                 <>
                   {authMode === "login" ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                   {authMode === "login" ? `Authenticate as ${selectedRole.toUpperCase()}` : `Complete Registration`}
                 </>
              )}
            </button>
          </form>

        </div>
        
        <div className="bg-[#fbfaf5] border-t border-[#e5e3d7] p-4 text-center">
           <p className="text-[#666666] text-[10px] uppercase font-bold tracking-widest">Annadata Secure Gateway v3.1</p>
        </div>
      </div>

    </div>
  );
};

export default RoleLogin;
