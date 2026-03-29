import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { theme } from "@/designSystem";
import { Shield, Sprout, Briefcase, UserPlus, LogIn, Globe } from "lucide-react";
import { authApi, profileApi } from "@/api/client";
import { toast } from "sonner";
import { APIResponse, LoginResponse } from "@/lib/api";

export type Role = "farmer" | "ngo" | "admin";
type AuthMode = "login" | "register";

const LANGUAGES = [
  { code: "en", native: "English" },
  { code: "hi", native: "हिंदी" },
  { code: "mr", native: "मराठी" },
  { code: "te", native: "తెలుగు" },
];

const LanguageSelectorLogin = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="absolute top-4 right-4 z-30">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#e5e3d7] shadow-sm text-xs font-bold uppercase tracking-widest text-[#13311c] hover:bg-[#f5f4ee] transition-colors"
      >
        <Globe className="w-3.5 h-3.5" />
        <span>{current.native}</span>
        <span className="text-[#999] text-[10px]">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 w-40 bg-white border border-[#e5e3d7] shadow-lg overflow-hidden">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                i18n.changeLanguage(lang.code);
                localStorage.setItem("annadata_lang", lang.code);
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold transition-colors ${
                lang.code === i18n.language
                  ? "bg-[#f0f8f1] text-[#13311c]"
                  : "text-[#444] hover:bg-[#f9f8f3]"
              }`}
            >
              <span>{lang.native}</span>
              <span className="text-[#bbb] font-mono uppercase text-[10px]">{lang.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface RoleLoginProps {
  onLogin: (role: Role) => void;
}

const RoleLogin = ({ onLogin }: RoleLoginProps) => {
  const { t } = useTranslation();
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
          res = await authApi.login({ phone, password });
        } else {
          res = await authApi.register({ name, phone, password, state: stateName, district, role: "farmer" });
        }
      } else if (selectedRole === "ngo") {
        if (authMode === "login") {
          res = await authApi.ngoLogin({ email, password });
        } else {
          res = await authApi.ngoRegister({ email, password, operator_full_name: operatorName, organization_name: orgName });
        }
      } else if (selectedRole === "admin") {
        const loginPhone = adminId.includes("SYS") ? "9999999001" : adminId; 
        res = await authApi.login({ phone: loginPhone, password });
      }

      if (res?.data.status === "success" || res?.data.token) {
        const d = res.data.data;
        if (d.token)   localStorage.setItem("annadata_token", d.token);
        if (d.user_id) localStorage.setItem("annadata_user_id", d.user_id);
        if (d.role)    localStorage.setItem("annadata_role", d.role);
        
        // Store registration info immediately
        if (stateName) localStorage.setItem("annadata_user_state", stateName);
        if (district)  localStorage.setItem("annadata_user_district", district);

        // Fetch user profile info
        try {
          const meRes = await authApi.getMe();
          const me = meRes.data.data;
          if (me.display_name) localStorage.setItem("annadata_user_name", me.display_name);
          if (me.verification_status) localStorage.setItem("annadata_verification_status", me.verification_status);
          
          if (d.user_id) {
            const profileRes = await profileApi.getProfile(d.user_id);
            const prof = profileRes.data.data;
            if (prof?.state)    localStorage.setItem("annadata_user_state", prof.state);
            if (prof?.district) localStorage.setItem("annadata_user_district", prof.district);
          }
        } catch (meErr) {
          console.warn("User context hydration failed", meErr);
        }

        toast.success(res.data.message_text || "Success");
        onLogin(selectedRole);
      }
    } catch (err: any) {
      console.error("Auth Failure:", err);
      const msg = err.response?.data?.detail || err.message || "Failed to authenticate";
      toast.error(msg);
      
      // Specifically for "cannot restart" complaint: 
      // Ensure everything is unlocked and password is cleared on 401
      if (err.response?.status === 401) {
        setPassword("");
      }
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

      {/* Language Switcher — top right, always visible */}
      <LanguageSelectorLogin />

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
              <span className="text-[10px] font-bold uppercase tracking-widest">{t("auth.farmer")}</span>
            </button>
            <button 
              onClick={() => handleRoleSwitch("ngo")}
              className={`flex flex-col items-center py-3 transition-colors ${selectedRole === "ngo" ? "bg-white border border-[#e5e3d7] shadow-sm text-[#e18b2c]" : "text-gray-500 hover:bg-gray-100"}`}
            >
              <Briefcase className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-widest">{t("auth.ngo")}</span>
            </button>
            <button 
              onClick={() => handleRoleSwitch("admin")}
              className={`flex flex-col items-center py-3 transition-colors ${selectedRole === "admin" ? "bg-white border border-[#e5e3d7] shadow-sm text-[#3174a1]" : "text-gray-500 hover:bg-gray-100"}`}
            >
              <Shield className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-widest">{t("auth.admin")}</span>
            </button>
          </div>

          {/* Contextual Header */}
          <div className="mb-6 flex justify-between items-end">
             <div>
               <h2 className="font-mukta font-bold text-xl text-[#1a1a1a]">
                 {selectedRole === "farmer" && (authMode === "login" ? t("auth.farmerLogin") : t("auth.farmerRegister"))}
                 {selectedRole === "ngo" && (authMode === "login" ? t("auth.ngoLogin") : t("auth.ngoRegister"))}
                 {selectedRole === "admin" && t("auth.adminLogin")}
               </h2>
               <p className="text-xs text-[#666666] font-hind font-bold mt-1">
                 {selectedRole === "admin" ? t("auth.restrictedAccess") : t("auth.enterCredentials")}
               </p>
             </div>
             
             {/* Auth Mode Toggle (Hidden for Admin) */}
             {selectedRole !== "admin" && (
               <div className="flex bg-gray-100 border border-[#e5e3d7] p-0.5">
                  <button 
                    onClick={() => setAuthMode("login")}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all ${authMode === "login" ? "bg-white shadow-sm text-[#1a1a1a]" : "text-gray-500"}`}
                  >
                    {t("auth.login")}
                  </button>
                  <button 
                    onClick={() => setAuthMode("register")}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all ${authMode === "register" ? "bg-white shadow-sm text-[#1a1a1a]" : "text-gray-500"}`}
                  >
                    {t("auth.register")}
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
                       <label className="block text-xs font-bold uppercase text-[#666666] mb-1">{t("auth.fullName")}</label>
                       <div className={theme.classes.inputWrapper}>
                         <input type="text" placeholder="e.g. Ramesh Kumar" required className={theme.classes.inputText} value={name} onChange={(e) => setName(e.target.value)} />
                       </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                       <div>
                         <label className="block text-xs font-bold uppercase text-[#666666] mb-1">{t("auth.state")}</label>
                         <div className={theme.classes.inputWrapper}>
                           <input type="text" placeholder="e.g. Punjab" required className={theme.classes.inputText} value={stateName} onChange={(e) => setStateName(e.target.value)} />
                         </div>
                       </div>
                       <div>
                         <label className="block text-xs font-bold uppercase text-[#666666] mb-1">{t("auth.district")}</label>
                         <div className={theme.classes.inputWrapper}>
                           <input type="text" placeholder="e.g. Ludhiana" required className={theme.classes.inputText} value={district} onChange={(e) => setDistrict(e.target.value)} />
                         </div>
                       </div>
                     </div>
                   </>
                 )}
                 <div>
                   <label className="block text-xs font-bold uppercase text-[#666666] mb-1">{t("auth.phone")}</label>
                   <div className={theme.classes.inputWrapper}>
                     <span className="pl-3 text-sm text-gray-500 font-bold border-r border-[#e5e3d7] pr-2">+91</span>
                     <input type="tel" pattern="[0-9]{10}" placeholder="10-digit mobile number" required className={theme.classes.inputText} value={phone} onChange={(e) => setPhone(e.target.value)} />
                   </div>
                 </div>
                 
                 <div>
                   <label className="block text-xs font-bold uppercase text-[#666666] mb-1">{authMode === 'register' ? t("auth.createPassword") : t("auth.password")}</label>
                   <div className={theme.classes.inputWrapper}>
                     <input type="password" placeholder="••••••••" required className={theme.classes.inputText} value={password} onChange={(e) => setPassword(e.target.value)} />
                   </div>
                   {authMode === "register" && <p className="text-[10px] text-[#666666] mt-1 italic">{t("auth.passwordHint")}</p>}
                 </div>
              </>
            )}

            {/* -------------------- NGO FLOW -------------------- */}
            {selectedRole === "ngo" && (
              <>
                 {authMode === "register" && (
                   <>
                     <div>
                       <label className="block text-xs font-bold uppercase text-[#666666] mb-1">{t("auth.operatorName")}</label>
                       <div className={theme.classes.inputWrapper}>
                         <input type="text" placeholder="e.g. Amit Sharma" required className={theme.classes.inputText} value={operatorName} onChange={(e) => setOperatorName(e.target.value)} />
                       </div>
                     </div>
                     <div>
                       <label className="block text-xs font-bold uppercase text-[#666666] mb-1">{t("auth.orgName")}</label>
                       <div className={theme.classes.inputWrapper}>
                         <input type="text" placeholder="e.g. Kisan Seva Kendra" required className={theme.classes.inputText} value={orgName} onChange={(e) => setOrgName(e.target.value)} />
                       </div>
                     </div>
                   </>
                 )}
                 <div>
                   <label className="block text-xs font-bold uppercase text-[#666666] mb-1">{t("auth.email")}</label>
                   <div className={theme.classes.inputWrapper}>
                     <input type="email" placeholder="operator@ngo.org" required className={theme.classes.inputText} value={email} onChange={(e) => setEmail(e.target.value)} />
                   </div>
                 </div>
                 <div>
                   <label className="block text-xs font-bold uppercase text-[#666666] mb-1">{authMode === 'register' ? t("auth.createPassword") : t("auth.password")}</label>
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
                   <label className="block text-xs font-bold uppercase text-[#666666] mb-1">{t("auth.adminId")}</label>
                   <div className={theme.classes.inputWrapper}>
                     <input type="text" placeholder="SYS-ADMIN-XX" required className={theme.classes.inputText} value={adminId} onChange={(e) => setAdminId(e.target.value)} />
                   </div>
                 </div>
                 <div>
                   <label className="block text-xs font-bold uppercase text-[#666666] mb-1">{t("auth.masterPassword")}</label>
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
                   {authMode === "login" ? t("auth.authenticateAs", { role: selectedRole.toUpperCase() }) : t("auth.completeRegistration")}
                 </>
              )}
            </button>
          </form>

        </div>
        
        <div className="bg-[#fbfaf5] border-t border-[#e5e3d7] p-4 text-center">
           <p className="text-[#666666] text-[10px] uppercase font-bold tracking-widest">{t("auth.gateway")}</p>
        </div>
      </div>

    </div>
  );
};

export default RoleLogin;
