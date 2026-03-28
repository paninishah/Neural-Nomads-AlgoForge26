import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, Paperclip, Send, BrainCircuit, CheckCircle2, ShieldAlert, Sparkles, AlertTriangle, 
  MapPin, FileText, Download, Scale, Clock, Activity, FileCheck, Landmark, PhoneCall
} from "lucide-react";
import ScreenHeader from "./ScreenHeader";
import type { Lang } from "@/pages/Index";
import type { Role } from "@/components/RoleLogin";

type Step = 'input' | 'analyzing' | 'detected' | 'dashboard' | 'submitted';

export default function LegalAction({ onBack, lang, role }: { onBack: () => void; lang: Lang; role?: Role }) {
  const [step, setStep] = useState<Step>('input');
  const [inputText, setInputText] = useState("");
  const [draftText, setDraftText] = useState("I am filing this complaint against Rajesh Traders for selling unverified pesticide batches on 21/03/2026. The product caused severe damage to 2 acres of my wheat crop, resulting in a loss of ₹14,500. I request immediate compensation as per the district mandate.");
  
  // Handlers
  const handleAnalyze = () => {
    if (!inputText) return;
    setStep('analyzing');
    setTimeout(() => {
      setStep('detected');
    }, 2500);
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
           
           <div className="space-y-4">
              {/* Active Pending Case */}
              <div className="bg-[#fefdf9] p-5 border border-[#e5e3d7] hover:border-[#e18b2c]/30 hover:shadow-md transition-all group">
                 <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-[#e18b2c]/10 text-[#e18b2c] flex items-center justify-center border border-[#e18b2c]/20"><Scale className="w-5 h-5"/></div>
                     <div>
                       <h3 className="font-bold text-[#1a1a1a]">Trader Refusal to Pay MSP</h3>
                       <p className="text-xs text-gray-500">Submitted by: Farmer #2841 (Karnal) • 2 hrs ago</p>
                     </div>
                   </div>
                   <span className="bg-[#e18b2c]/10 text-[#8c5214] text-xs font-bold uppercase tracking-widest px-3 py-1 border border-[#e18b2c]/30">Pending Review</span>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-4 bg-white border border-[#e5e3d7]">
                      <h4 className="text-xs uppercase font-bold text-gray-500 mb-2">Farmer's Statement</h4>
                      <p className="text-sm font-hind text-gray-700">"The trader at the local mandi bought 50 quintals of wheat but didn't pay the agreed MSP. Now he is ignoring my calls."</p>
                    </div>
                    <div className="p-4 bg-[#f1f8f3] border border-[#408447]/20 border-l-4 border-l-[#408447]">
                      <h4 className="text-xs uppercase font-bold text-[#408447] mb-2">AI Drafted Action</h4>
                      <p className="text-sm font-bold text-gray-800">Formal Legal Notice (Section 420)</p>
                      <p className="text-xs text-gray-600 mt-1">Draft ready. Recommends escalating to Sub-Divisional Magistrate.</p>
                    </div>
                 </div>

                 <div className="flex gap-3 mt-4">
                    <button className="bg-[#3174a1] text-white px-4 py-2 text-sm font-bold flex-1 hover:bg-[#1b435e] transition-colors shadow-sm">
                       Review & File on behalf of Farmer
                    </button>
                    <button className="bg-[#c82b28] text-white px-4 py-2 text-sm font-bold hover:bg-[#8f1e1c] transition-colors shadow-sm">
                       Reject
                    </button>
                 </div>
              </div>
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
           ← Back to Input
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
                  <h3 className="font-mukta font-bold text-lg leading-tight text-gray-800">Hi Ramesh ji,</h3>
                  <p className="font-hind text-sm text-gray-600">I am your smart legal assistant.</p>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-300 to-yellow-200 rounded-none blur opacity-30 group-focus-within:opacity-60 transition duration-500" />
                <div className="relative bg-white/80 backdrop-blur-xl border border-white/60 p-4 rounded-none shadow-sm">
                  <textarea 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Describe your problem in your own words..."
                    className="w-full bg-transparent border-none outline-none resize-none font-hind text-base placeholder:text-gray-400 min-h-[140px]"
                  />
                  
                  <div className="flex justify-between items-center mt-2 pt-3 border-t border-gray-100">
                    <div className="flex gap-2">
                      <button className="w-10 h-10 rounded-none bg-gray-50 flex items-center justify-center text-gray-400 hover:text-green-600 hover:bg-green-50 active:scale-95 transition-all">
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <button className="w-10 h-10 rounded-none bg-green-100 flex items-center justify-center text-green-700 hover:bg-green-200 active:scale-95 transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                        <Mic className="w-5 h-5" />
                      </button>
                    </div>

                    <button 
                      onClick={handleAnalyze}
                      disabled={!inputText}
                      className="bg-green-600 text-white px-5 py-2.5 rounded-none font-bold text-sm tracking-wide flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
                    >
                      Analyze <Send className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50/50 backdrop-blur-sm border border-blue-100 rounded-none p-4 flex gap-3 text-blue-800">
                <Sparkles className="w-5 h-5 flex-shrink-0 text-blue-500" />
                <p className="font-hind text-sm leading-snug text-blue-700/80">Don't worry about legal terms. Just speak naturally, and our AI will document the perfect complaint for you.</p>
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
                      <h3 className="font-mukta font-bold text-lg text-gray-800 leading-none">We got it!</h3>
                      <p className="font-hind text-sm text-green-600 font-bold">96% Analysis Confidence</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-none p-4 border border-gray-100 space-y-3">
                    <div className="flex justify-between items-center text-sm font-hind border-b border-gray-200 pb-2">
                      <span className="text-gray-500">Detected Category</span>
                      <span className="font-bold text-gray-800">Fraudulent Vendor (Pesticide)</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-hind border-b border-gray-200 pb-2">
                      <span className="text-gray-500">Loss Amount</span>
                      <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-none">₹14,500</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-hind">
                      <span className="text-gray-500">Key Evidence Info</span>
                      <span className="font-bold text-gray-800">Purchase Date present</span>
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
                    <h3 className="font-mukta font-bold text-xl text-gray-800">Case #KS-0847</h3>
                    <p className="font-hind text-xs text-gray-500 font-bold uppercase tracking-wider mt-1 flex items-center gap-1"><ShieldAlert className="w-3 h-3 text-orange-500"/> Fraudulent Input Case</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mukta font-bold text-2xl text-red-600 drop-shadow-sm">₹14,500</span>
                    <p className="font-hind text-xs text-gray-500 mt-0.5">Estimated Loss</p>
                  </div>
                </div>
              </div>

              {/* Case Strength Visualization */}
              <div className="bg-white rounded-none p-5 shadow-sm border border-gray-100">
                <div className="flex justify-between items-end mb-3">
                  <h3 className="font-mukta font-bold text-gray-800">Case Strength</h3>
                  <span className="font-mukta font-bold text-green-600 text-lg">72% (Strong)</span>
                </div>
                
                <div className="h-4 w-full bg-gray-100 rounded-none overflow-hidden mb-4 relative drop-shadow-inner border border-gray-200">
                  <motion.div initial={{ width: 0 }} animate={{ width: "72%" }} transition={{ duration: 1.5, ease: "easeOut" }} className="absolute h-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 rounded-none" />
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
                <h3 className="font-mukta font-bold text-gray-800 flex items-center gap-2 mb-4"><span className="text-xl">💡</span> What you should do now</h3>
                
                <div className="space-y-4">
                   <div className="flex gap-3">
                     <div className="w-6 h-6 rounded-none bg-yellow-200 text-yellow-800 font-bold font-mukta flex items-center justify-center flex-shrink-0 text-xs">1</div>
                     <p className="font-hind text-sm text-gray-700">Submit this drafted complaint below to the District Consumer Portal instantly.</p>
                   </div>
                   <div className="flex gap-3">
                     <div className="w-6 h-6 rounded-none bg-yellow-200 text-yellow-800 font-bold font-mukta flex items-center justify-center flex-shrink-0 text-xs">2</div>
                     <p className="font-hind text-sm text-gray-700">Do not throw away the remaining pesticide bottles as evidence.</p>
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
                <div className="p-5 bg-[#fafbf9]">
                  <textarea 
                    value={draftText} 
                    onChange={e => setDraftText(e.target.value)}
                    className="w-full min-h-[120px] bg-transparent resize-none border-none outline-none font-hind text-sm text-gray-800 leading-relaxed custom-scrollbar" 
                  />
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                    <button className="flex items-center gap-2 text-sm font-bold text-indigo-600 active:scale-95 transition-transform">
                      <Sparkles className="w-4 h-4" /> Improve phrasing
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
                  onClick={() => setStep('submitted')} 
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white rounded-none py-4 font-bold font-mukta text-lg shadow-xl shadow-green-600/30 flex justify-center items-center gap-2 hover:bg-green-700 active:scale-95 transition-all"
                >
                  🚀 Submit Complaint Instantly
                </button>
                <div className="flex gap-3">
                  <button className="flex-1 bg-white border border-gray-200 text-gray-700 rounded-none py-3 font-bold font-mukta flex justify-center items-center gap-2 hover:bg-gray-50 active:scale-95 transition-all">
                    <Download className="w-4 h-4 text-gray-500" /> Save PDF
                  </button>
                  <button className="flex-1 bg-white border border-gray-200 text-gray-700 rounded-none py-3 font-bold font-mukta flex justify-center items-center gap-2 hover:bg-gray-50 active:scale-95 transition-all">
                    Link Portal
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
