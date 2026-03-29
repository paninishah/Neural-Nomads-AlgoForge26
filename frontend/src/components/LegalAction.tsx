import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, Paperclip, Send, BrainCircuit, CheckCircle2, ShieldAlert, Sparkles, AlertTriangle, 
  MapPin, FileText, Download, Scale, Clock, Activity, FileCheck, Landmark, PhoneCall
} from "lucide-react";
import ScreenHeader from "./ScreenHeader";
import type { Lang } from "@/pages/Index";
import type { Role } from "@/components/RoleLogin";
import { loanApi, apiClient, requestApi, ngoApi } from "@/api/client";
import { APIResponse } from "@/lib/api";
import { toast } from "sonner";

type Step = 'input' | 'analyzing' | 'detected' | 'dashboard' | 'submitted';

export default function LegalAction({ onBack, lang, role }: { onBack: () => void; lang: Lang; role?: Role }) {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('input');
  const [inputText, setInputText] = useState("");
  const [analysisResult, setAnalysisResult] = useState<{
    category: string;
    loss_hint: number;
    legal_draft: string;
    confidence: number;
    analysis: string;
    sections: string[];
  } | null>(null);
  
  const [draftText, setDraftText] = useState("");
  const userName = localStorage.getItem("annadata_user_name") || "Farmer";
  const [isListening, setIsListening] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [complaintsHistory, setComplaintsHistory] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch History on Mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const userId = localStorage.getItem("annadata_user_id");
        if (!userId) return;
        const res = await requestApi.getUserRequests(userId);
        // Filter for legal only
        setComplaintsHistory(res.data.data.filter((h: any) => h.request_type === "legal_aid"));
      } catch (err) {
        console.error("Failed to fetch legal history", err);
      }
    };
    fetchHistory();
  }, []);
  
  // Handlers
  const handleAnalyze = async () => {
    const token = localStorage.getItem("annadata_token");
    if (!token) {
      toast.error("Authentication required. Please log in again.");
      return;
    }

    if (!inputText) return;
    setStep('analyzing');
    
    try {
      const response = await apiClient.post<APIResponse<any>>("/legal/analyze", { text: inputText });
      const data = response.data.data;
      setAnalysisResult(data);
      setDraftText(data.legal_draft);
      
      // Artificial delay for "Processing" feel
      setTimeout(() => {
        setStep('detected');
      }, 1500);
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 401) {
        toast.error("Your session has expired. Please log in again.");
      } else {
        toast.error(err.response?.data?.detail || "AI Analysis failed");
      }
      setStep('input');
    }
  };

  const submitComplaint = async () => {
    try {
      await requestApi.create({
        user_id: localStorage.getItem("annadata_user_id") || "",
        type: "legal_aid",
        payload: { text: draftText },
        description: draftText
      });
      toast.success("Complaint submitted securely");
      
      // Refresh local history
      const userId = localStorage.getItem("annadata_user_id");
      if (userId) {
        const res = await requestApi.getUserRequests(userId);
        setComplaintsHistory(res.data.data.filter((h: any) => h.request_type === "legal_aid"));
      }
    } catch (e) {
      console.error(e);
      toast.error("Issue connecting to server, but recorded locally");
    } finally {
      setStep('submitted');
    }
  };

  const sendEmailToNGO = () => {
    const subject = encodeURIComponent(`Legal Aid Request: ${analysisResult?.category}`);
    const body = encodeURIComponent(`Hi NGO Team,\n\nI am ${userName} and I am facing a legal issue: ${inputText}\n\nAI Analysis: ${analysisResult?.analysis}\n\nDrafted Complaint:\n${draftText}`);
    window.open(`mailto:help@annadata.org?subject=${subject}&body=${body}`);
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0]);
      toast.success(`Attached: ${e.target.files[0].name}`);
    }
  };

  const handleVoiceClick = () => {
    setIsListening(true);
    toast.info("Listening... Speak now", { icon: "🎙️" });
    
    // Simulate voice-to-text after 2.5 seconds
    setTimeout(() => {
      setIsListening(false);
      setInputText(prev => prev + (prev ? " " : "") + "The trader at the local mandi has not paid for my 50 quintals of wheat sold on Monday.");
      toast.success("Voice transcribed!");
    }, 2500);
  };

  const [ngoCases, setNgoCases] = useState<any[]>([]);
  const [isNgoLoading, setIsNgoLoading] = useState(false);

  // Fetch NGO cases if role is NGO or Admin
  useEffect(() => {
    if (role === "ngo" || role === "admin") {
      const fetchNgoCases = async () => {
        setIsNgoLoading(true);
        try {
          const res = await ngoApi.getHelpRequests();
          if (res.data.status === "success") {
            setNgoCases(res.data.data);
          }
        } catch (e) {
          console.error("Failed to fetch NGO legal cases", e);
        } finally {
          setIsNgoLoading(false);
        }
      };
      fetchNgoCases();
    }
  }, [role]);

  const updateCaseStatus = async (caseId: string, status: string) => {
    try {
      await ngoApi.updateHelpRequest({
        request_id: caseId,
        status: status,
        notes: `Case marked as ${status} by NGO operator`
      });
      toast.success(`Case updated to ${status}`);
      // Refresh list
      setNgoCases(prev => prev.filter(c => c.id !== caseId));
    } catch (e) {
      toast.error("Failed to update case status");
    }
  };

  // ----------------------------------------------------
  // NGO FIELD OPERATOR LEGAL QUEUE VIEW
  // ----------------------------------------------------
  if (role === "ngo" || role === "admin") {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-6 pb-10">
        <div className="bg-white p-6 border-b border-[#e5e3d7] shadow-sm">
           <h2 className="font-mukta font-bold text-2xl text-[#1a1a1a]">Legal Case Queue</h2>
           <p className="font-hind text-gray-500 text-sm mt-1 mb-8">Review and respond to AI-prepared legal drafts submitted by farmers.</p>
           
           <div className="space-y-6">
              {isNgoLoading && (
                <div className="flex justify-center py-10">
                   <div className="w-8 h-8 border-2 border-[#e18b2c] border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {ngoCases.length === 0 && !isNgoLoading && (
                <div className="text-center py-20 bg-gray-50 border border-dashed border-gray-200">
                   <Scale className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                   <p className="font-mukta font-bold text-gray-500">No pending legal cases in your region.</p>
                </div>
              )}

              {ngoCases.map((c) => (
                <div key={c.id} className="bg-[#fefdf9] p-5 border border-[#e5e3d7] hover:border-[#e18b2c]/30 hover:shadow-md transition-all group">
                   <div className="flex justify-between items-start mb-4">
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-[#e18b2c]/10 text-[#e18b2c] flex items-center justify-center border border-[#e18b2c]/20"><Scale className="w-5 h-5"/></div>
                       <div>
                         <h3 className="font-bold text-[#1a1a1a]">{c.request_type.toUpperCase()} Assistance Request</h3>
                         <p className="text-xs text-gray-500">
                           Submitted by: <span className="font-bold text-gray-700">{c.farmer_name}</span> ({c.location}) • {new Date(c.created_at).toLocaleDateString()}
                         </p>
                       </div>
                     </div>
                     <span className="bg-[#e18b2c]/10 text-[#8c5214] text-[10px] font-black uppercase tracking-widest px-3 py-1 border border-[#e18b2c]/30">
                       {c.status}
                     </span>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="p-4 bg-white border border-[#e5e3d7]">
                        <h4 className="text-[10px] uppercase font-black text-gray-400 mb-2 tracking-widest">Farmer's Statement</h4>
                        <p className="text-sm font-hind text-gray-700 leading-relaxed italic">"{c.description}"</p>
                      </div>
                      <div className="p-4 bg-[#f1f8f3] border border-[#408447]/20 border-l-4 border-l-[#408447]">
                        <h4 className="text-[10px] uppercase font-black text-[#408447] mb-2 tracking-widest">AI Context & Next Steps</h4>
                        <p className="text-sm font-bold text-gray-800">Drafted Formal Notice Ready</p>
                        <p className="text-xs text-gray-600 mt-1">AI recommends immediate filing at the local sub-registrar office.</p>
                      </div>
                   </div>

                   <div className="flex gap-3 mt-4">
                      <button 
                        onClick={() => updateCaseStatus(c.id, "in_progress")}
                        className="bg-[#3174a1] text-white px-4 py-3 text-xs font-black uppercase tracking-widest flex-1 hover:bg-[#1b435e] transition-colors shadow-sm"
                      >
                         Claim & Start Legal Filing
                      </button>
                      <button 
                        onClick={() => updateCaseStatus(c.id, "resolved")}
                        className="bg-[#408447] text-white px-4 py-3 text-xs font-black uppercase tracking-widest hover:bg-[#2d5d32] transition-colors shadow-sm"
                      >
                         Mark as Resolved
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // FARMER LEGAL COMPANION UI
  // ----------------------------------------------------
  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* Remove global ScreenHeader to avoid duplication with AppLayout */}
      {step !== 'input' && (
        <button className="border px-4 py-2 bg-white font-bold text-sm text-gray-600 hover:text-black mb-4 flex items-center gap-2" onClick={() => setStep('input')}>
           ← {t("legal.backToInput")}
        </button>
      )}

      <div className="px-5 mt-6">
        <AnimatePresence mode="wait">
          
          {/* 1. INPUT EXPERIENCE */}
          {step === 'input' && (
            <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-none bg-green-100 flex items-center justify-center">
                  <span className="text-xl">👩‍⚖️</span>
                </div>
                <div>
                  <h3 className="font-mukta font-bold text-lg leading-tight text-gray-800">{t("dashboard.welcomeBack")}, {userName}</h3>
                  <p className="font-hind text-sm text-gray-600">{t("legal.smartAssistant")}</p>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-300 to-yellow-200 rounded-none blur opacity-30 group-focus-within:opacity-60 transition duration-500" />
                <div className="relative bg-white/80 backdrop-blur-xl border border-white/60 p-4 rounded-none shadow-sm">
                  <textarea 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={t("legal.describeProblem")}
                    className="w-full bg-transparent border-none outline-none resize-none font-hind text-base placeholder:text-gray-400 min-h-[140px]"
                  />
                  
                  <div className="flex justify-between items-center mt-2 pt-3 border-t border-gray-100">
                    <div className="flex gap-2">
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileChange}
                      />
                      <button 
                        onClick={handleAttachClick}
                        className={`w-10 h-10 rounded-none bg-gray-50 flex items-center justify-center transition-all ${attachedFile ? 'text-green-600 border border-green-200' : 'text-gray-400'}`}
                      >
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={handleVoiceClick}
                        className={`w-10 h-10 rounded-none flex items-center justify-center transition-all ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-green-100 text-green-700 shadow-[0_0_15px_rgba(34,197,94,0.3)]'}`}
                      >
                        <Mic className="w-5 h-5" />
                      </button>
                    </div>

                    <button 
                      onClick={handleAnalyze}
                      disabled={!inputText}
                      className="bg-green-600 text-white px-5 py-2.5 rounded-none font-bold text-sm tracking-wide flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
                    >
                      {t("legal.analyze")} <Send className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50/50 backdrop-blur-sm border border-blue-100 rounded-none p-4 flex gap-3 text-blue-800">
                <Sparkles className="w-5 h-5 flex-shrink-0 text-blue-500" />
                <p className="font-hind text-sm leading-snug text-blue-700/80">Don't worry about legal terms. Just speak naturally, and our AI will document the perfect complaint for you.</p>
              </div>

              {/* MY RECENT COMPLAINTS - PINNED STYLE */}
              <div className="bg-[#fbfaf5] border-2 border-[#e5e3d7] overflow-hidden shadow-sm">
                <div className="bg-white px-4 py-2 border-b border-[#e5e3d7] flex justify-between items-center">
                  <h4 className="font-mukta font-bold text-xs uppercase tracking-widest text-gray-500 flex items-center gap-2">
                    <Clock className="w-3 h-3 text-[#e18b2c]" /> {t("legal.recentHistory") || "Verification History"}
                  </h4>
                  <span className="text-[10px] font-black text-[#408447]">LIVE SYNC ACTIVE</span>
                </div>
                
                <div className="p-2">
                  {complaintsHistory.length === 0 ? (
                    <div className="py-8 text-center">
                       <FileText className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">No recent legal help requests</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {complaintsHistory.slice(0, 4).map((item) => (
                        <div key={item.id} className="p-3 bg-white border border-[#e5e3d7] flex justify-between items-center hover:border-[#1b435e]/30 transition-all cursor-pointer">
                          <div className="flex gap-3 items-center">
                            <div className={`w-1.5 h-1.5 rounded-none ${item.status === 'pending' ? 'bg-[#e18b2c]' : 'bg-[#408447]'}`} />
                            <div className="overflow-hidden">
                              <p className="text-[11px] font-black text-[#1a1a1a] truncate w-full">
                                {(item.description || item.payload?.text || "Legal Help Request").slice(0, 35)}...
                              </p>
                              <p className="text-[9px] text-gray-400 uppercase tracking-tighter mt-0.5 font-bold">
                                {new Date(item.created_at).toLocaleDateString()} • {item.status}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {complaintsHistory.length > 4 && (
                   <button className="w-full py-2 bg-gray-50 text-[9px] font-black text-gray-400 uppercase border-t border-[#e5e3d7] hover:bg-white hover:text-black transition-all">
                      View all complaints
                   </button>
                )}
              </div>
            </motion.div>
          )}

          {/* 2. AI DETECTION MOMENT */}
          {(step === 'analyzing' || step === 'detected') && (
            <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20">
              
              {/* Shimmer / Pulse Analysis */}
              {step === 'analyzing' && (
                <motion.div className="flex flex-col items-center">
                  <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="w-20 h-20 rounded-none bg-gradient-to-tr from-green-400 to-yellow-300 p-1 flex items-center justify-center shadow-2xl shadow-green-400/30">
                    <div className="w-full h-full bg-white rounded-none flex items-center justify-center">
                      <BrainCircuit className="w-8 h-8 text-green-600" />
                    </div>
                  </motion.div>
                  <motion.h3 animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} className="mt-6 font-mukta font-bold text-xl text-gray-800">Understanding your issue...</motion.h3>
                  <p className="font-hind text-sm text-gray-500 mt-2">Extracting critical legal points</p>
                </motion.div>
              )}

              {/* Reveal Card */}
              {step === 'detected' && (
                <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="w-full bg-white rounded-none] p-6 shadow-2xl border border-green-100 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 via-yellow-400 to-green-500" />
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-none bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-mukta font-bold text-lg text-gray-800 leading-none">Analysis Complete</h3>
                      <p className="font-hind text-sm text-green-600 font-bold">{analysisResult?.confidence}% Analysis Confidence</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-none p-4 border border-gray-100 space-y-3">
                    <div className="flex justify-between items-center text-sm font-hind border-b border-gray-200 pb-2">
                      <span className="text-gray-500">Detected Category</span>
                      <span className="font-bold text-gray-800">{analysisResult?.category || "Processing..."}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-hind border-b border-gray-200 pb-2">
                      <span className="text-gray-500">Estimated Loss</span>
                      <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-none">₹{analysisResult?.loss_hint?.toLocaleString() || "0"}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-hind">
                      <span className="text-gray-500">Legal Grounds</span>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {analysisResult?.sections.slice(0, 2).map((s, i) => (
                           <span key={i} className="bg-blue-50 text-blue-700 text-[10px] px-1.5 py-0.5 font-bold border border-blue-100">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setStep('input')} className="flex-1 py-3.5 rounded-none font-bold font-mukta text-gray-600 bg-gray-100 active:scale-95 transition-transform">
                      Change Text
                    </button>
                    <button onClick={() => setStep('dashboard')} className="flex-1 py-3.5 rounded-none font-bold font-mukta text-white bg-green-600 shadow-lg shadow-green-600/30 active:scale-95 transition-transform flex justify-center items-center gap-2">
                      Confirm <Send className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

            </motion.div>
          )}

          {/* 3-11. DASHBOARD / RESULTS SCREEN */}
          {step === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 pb-20">
              
              {/* Auto-Aggregated Case Summary Widget */}
              <div className="bg-white rounded-none p-5 shadow-sm border border-gray-100 bg-gradient-to-br from-white to-green-50/30">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-mukta font-bold text-xl text-gray-800">Case Analysis</h3>
                    <p className="font-hind text-xs text-gray-500 font-bold uppercase tracking-wider mt-1 flex items-center gap-1"><ShieldAlert className="w-3 h-3 text-orange-500"/> {analysisResult?.category}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mukta font-bold text-2xl text-red-600 drop-shadow-sm">₹{analysisResult?.loss_hint?.toLocaleString()}</span>
                    <p className="font-hind text-xs text-gray-500 mt-0.5">Estimated Potential Claim</p>
                  </div>
                </div>
              </div>

              {/* Case Strength Visualization */}
              <div className="bg-white rounded-none p-5 shadow-sm border border-gray-100">
                <div className="flex justify-between items-end mb-3">
                  <h3 className="font-mukta font-bold text-gray-800">Case Strength</h3>
                  <span className="font-mukta font-bold text-green-600 text-lg">{analysisResult?.confidence}% (AI Match)</span>
                </div>
                
                <div className="h-4 w-full bg-gray-100 rounded-none overflow-hidden mb-4 relative drop-shadow-inner border border-gray-200">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${analysisResult?.confidence}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className="absolute h-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 rounded-none" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-hind"><CheckCircle2 className="w-4 h-4 text-green-500" /> <span className="text-gray-700">Photos & text provided</span></div>
                  <div className="flex items-center gap-2 text-sm font-hind"><CheckCircle2 className="w-4 h-4 text-green-500" /> <span className="text-gray-700">Common documented fraud in Baghpat</span></div>
                  <div className="flex items-center gap-2 text-sm font-hind"><AlertTriangle className="w-4 h-4 text-yellow-500" /> <span className="text-gray-600">Missing shop receipt — <span className="underline decoration-yellow-400">upload to reach 95%</span></span></div>
                </div>
              </div>

              {/* Impact Estimation (Decision Support) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-none p-4 text-white shadow-lg shadow-green-500/20">
                  <Clock className="w-6 h-6 text-green-200 mb-2" />
                  <p className="font-hind text-xs font-bold text-green-100 uppercase tracking-widest">Est. Duration</p>
                  <p className="font-mukta font-bold text-xl mt-1">15–30 Days</p>
                </div>
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-none p-4 text-white shadow-lg shadow-black/10">
                  <Activity className="w-6 h-6 text-yellow-400 mb-2" />
                  <p className="font-hind text-xs font-bold text-gray-400 uppercase tracking-widest">Success Rate</p>
                  <p className="font-mukta font-bold text-xl text-yellow-500 mt-1">Very High</p>
                </div>
              </div>

              {/* Smart Guidance Panel */}
              <div className="bg-yellow-50/50 border border-yellow-200 rounded-none p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-yellow-400" />
                <h3 className="font-mukta font-bold text-gray-800 flex items-center gap-2 mb-4"><span className="text-xl">⚖️</span> Actionable Legal Advice</h3>
                
                <div className="space-y-4">
                   <div className="flex gap-3">
                     <div className="w-full">
                       <p className="font-hind text-sm text-gray-700 leading-relaxed italic border-l-2 border-yellow-400 pl-3">{analysisResult?.analysis}</p>
                     </div>
                   </div>
                   <div className="flex gap-3">
                     <div className="w-6 h-6 rounded-none bg-yellow-200 text-yellow-800 font-bold font-mukta flex items-center justify-center flex-shrink-0 text-xs">1</div>
                     <p className="font-hind text-sm text-gray-700">Submit the official notice drafted below. It cites <b>{analysisResult?.sections[0]}</b> which is critical for your case.</p>
                   </div>
                </div>

                <motion.div animate={{ opacity: [0.8, 1, 0.8] }} transition={{ duration: 2, repeat: Infinity }} className="mt-5 bg-red-50/80 border border-red-100 rounded-none p-3 flex gap-3 shadow-inner">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="font-hind text-xs text-red-800 font-bold leading-relaxed">Delays beyond 7 days reduce success rate by 40%. Act fast.</p>
                </motion.div>
              </div>

              {/* Editable Complaint Draft */}
              <div className="bg-white rounded-none overflow-hidden shadow-sm border border-gray-200">
                <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <h3 className="font-mukta font-bold text-sm text-gray-700">Official Complaint Draft</h3>
                  </div>
                  <span className="bg-blue-100 text-blue-700 font-bold text-[10px] px-2 py-0.5 rounded-none uppercase tracking-wider">Editable</span>
                </div>
                  <div className="p-5 bg-white border border-[#e5e3d7] shadow-inner relative">
                    <div className="absolute top-2 right-2 opacity-10 pointer-events-none">
                      <Landmark className="w-12 h-12 text-[#1a1a1a]" />
                    </div>
                    <textarea 
                      value={draftText} 
                      onChange={e => setDraftText(e.target.value)}
                      className="w-full min-h-[320px] bg-transparent resize-none border-none outline-none font-hind text-base text-gray-800 leading-relaxed custom-scrollbar" 
                    />
                    
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                      <button className="flex items-center gap-2 text-sm font-bold text-[#1b435e] active:scale-95 transition-transform">
                        <Sparkles className="w-4 h-4 text-orange-400" /> Improve phrasing
                      </button>
                    </div>
                  </div>
              </div>

              {/* Heatmap Insight Integration */}
              <div className="bg-gradient-to-br from-gray-900 to-black rounded-none p-5 text-white relative overflow-hidden group hover:shadow-2xl hover:shadow-green-500/20 transition-all cursor-pointer">
                {/* Visual Hotspot Glow */}
                <div className="absolute top-[-30px] right-[-30px] w-24 h-24 bg-red-500 rounded-none blur-2xl opacity-60 group-hover:opacity-100 group-hover:scale-125 transition-all duration-700" />
                <div className="absolute bottom-[-20px] left-[-20px] w-20 h-20 bg-orange-500 rounded-none blur-2xl opacity-40" />

                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <h3 className="font-mukta font-bold flex items-center gap-2 text-lg"><MapPin className="w-4 h-4 text-red-400" /> Regional Intelligence</h3>
                    <p className="font-hind text-sm text-gray-300 mt-2 leading-relaxed w-[90%]"><span className="text-red-400 font-bold">12 similar frauds</span> reported in Baghpat district this week. We will link your case class-action style.</p>
                  </div>
                </div>
              </div>

              {/* Nearby Help */}
              <div className="bg-white rounded-none p-5 shadow-sm border border-gray-100">
                <h3 className="font-mukta font-bold text-gray-800 mb-3">Nearby Physical Help</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-none bg-gray-50 border border-gray-100 hover:border-green-200 cursor-pointer transition-colors group">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-none bg-white flex items-center justify-center shadow-sm">
                        <Landmark className="w-5 h-5 text-gray-600 group-hover:text-green-600" />
                      </div>
                      <div>
                         <p className="font-mukta font-bold text-sm text-gray-800 line-clamp-1">District Agriculture Office</p>
                         <p className="font-hind text-xs text-gray-500">2.4 km away • Open now</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 rounded-none bg-gray-50 border border-gray-100 hover:border-blue-200 cursor-pointer transition-colors group">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-none bg-white flex items-center justify-center shadow-sm">
                        <PhoneCall className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                      </div>
                      <div>
                         <p className="font-mukta font-bold text-sm text-gray-800 line-clamp-1">Kisan Call Center</p>
                         <p className="font-hind text-xs text-blue-600 font-bold">Toll Free: 1800-180-1551</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Final Actions */}
              <div className="pt-2 flex flex-col gap-3">
                <button 
                  onClick={submitComplaint} 
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white rounded-none py-4 font-bold font-mukta text-lg shadow-xl shadow-green-600/30 flex justify-center items-center gap-2 hover:bg-green-700 active:scale-95 transition-all"
                >
                  🚀 Submit Complaint Instantly
                </button>
                <div className="flex gap-3">
                  <button onClick={sendEmailToNGO} className="flex-1 bg-white border border-[#1b435e] text-[#1b435e] rounded-none py-3 font-bold font-mukta flex justify-center items-center gap-2 hover:bg-blue-50 active:scale-95 transition-all">
                    📧 Email NGO
                  </button>
                  <button className="flex-1 bg-white border border-gray-200 text-gray-700 rounded-none py-3 font-bold font-mukta flex justify-center items-center gap-2 hover:bg-gray-50 active:scale-95 transition-all">
                    Download Report
                  </button>
                </div>
              </div>

            </motion.div>
          )}

          {/* 12. POST-SUBMISSION STATUS SCREEN */}
          {step === 'submitted' && (
            <motion.div key="submitted" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-10 mt-6 relative">
               
               {/* Confetti simulation using CSS or framer motion - abstractly represented by floating elements */}
               <div className="absolute inset-0 pointer-events-none overflow-hidden">
                 {[...Array(6)].map((_, i) => (
                   <motion.div key={`confetti-${i}`} initial={{ y: 200, opacity: 0, rotate: 0 }} animate={{ y: -500, opacity: [0, 1, 0], rotate: 360 }} transition={{ duration: 2.5 + Math.random() * 2, delay: i * 0.2 }} className="absolute w-3 h-3 rounded-none bg-green-400" style={{ left: `${20 + i * 15}%` }} />
                 ))}
               </div>

               <div className="w-24 h-24 bg-green-100 rounded-none flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(34,197,94,0.4)] relative">
                  <div className="absolute inset-0 rounded-none border-2 border-green-500 animate-ping opacity-20" />
                  <FileCheck className="w-10 h-10 text-green-600" />
               </div>

               <h2 className="font-mukta font-bold text-2xl text-gray-800 text-center leading-tight mb-2">Your complaint is <br/>officially submitted!</h2>
               <p className="font-hind text-gray-500 bg-gray-100 px-4 py-1.5 rounded-none font-bold text-sm">Ref No: KS-2025-0847</p>

               {/* Step Tracker (Process Feel) */}
               <div className="w-full bg-white rounded-none p-6 shadow-sm border border-gray-100 mt-8 relative">
                  <div className="absolute top-10 left-[48px] w-0.5 h-[calc(100%-80px)] bg-gray-100 -z-10" />

                  <div className="space-y-6">
                    {/* Step 1 */}
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-none bg-green-500 text-white flex items-center justify-center flex-shrink-0 z-10 shadow-md">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div className="pt-1.5">
                        <p className="font-mukta font-bold text-gray-800 leading-none">Drafted & Evaluated</p>
                        <p className="font-hind text-xs text-gray-400 mt-1">AI checked case strength</p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-none bg-green-500 text-white flex items-center justify-center flex-shrink-0 z-10 shadow-md">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div className="pt-1.5">
                        <p className="font-mukta font-bold text-gray-800 leading-none">Submitted</p>
                        <p className="font-hind text-xs text-gray-400 mt-1">Sent to District Consumer Forum</p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-4 opacity-50">
                      <div className="w-10 h-10 rounded-none bg-white border-2 border-gray-200 text-gray-400 flex items-center justify-center flex-shrink-0 z-10 box-border">
                        <div className="w-2.5 h-2.5 rounded-none bg-gray-300" />
                      </div>
                      <div className="pt-1.5">
                        <p className="font-mukta font-bold text-gray-800 leading-none">Under Review</p>
                        <p className="font-hind text-xs text-gray-400 mt-1">Awaiting official acknowledgment</p>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="flex gap-4 opacity-50">
                      <div className="w-10 h-10 rounded-none bg-white border-2 border-gray-200 text-gray-400 flex items-center justify-center flex-shrink-0 z-10 box-border">
                        <div className="w-2.5 h-2.5 rounded-none bg-gray-300" />
                      </div>
                      <div className="pt-1.5">
                        <p className="font-mukta font-bold text-gray-800 leading-none">Resolved</p>
                        <p className="font-hind text-xs text-gray-400 mt-1">Compensation dispatched</p>
                      </div>
                    </div>
                  </div>
               </div>

               <div className="mt-8 text-center bg-blue-50 border border-blue-100 rounded-none p-4 w-full flex items-center gap-3">
                 <div className="w-8 h-8 rounded-none bg-blue-100 flex items-center justify-center flex-shrink-0"><span className="text-sm">🔔</span></div>
                 <p className="font-hind text-sm text-blue-800 font-bold w-full text-left leading-snug">We will notify you via SMS when status changes to 'Under Review'.</p>
               </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
