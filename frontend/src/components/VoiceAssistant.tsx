import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, X, Play, Square, Loader2, MessageSquare, ChevronRight, Store, ShieldCheck, Scale, Landmark, Wallet } from "lucide-react";
import { theme } from "@/designSystem";
import { apiClient } from "@/lib/apiClient";
import { APIResponse, IntentResponse } from "@/lib/api";

type AssistantState = "idle" | "listening" | "thinking" | "responding";

interface VoiceAssistantProps {
  role: string;
  onNavigate: (screen: any) => void;
}

const VoiceAssistant = ({ role, onNavigate }: VoiceAssistantProps) => {
  const [state, setState] = useState<AssistantState>("idle");
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState<{ text: string; sub: string; screen?: any } | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const startListening = () => {
    setState("listening");
    setTranscript("");
    // Simulate speech detection
    setTimeout(() => {
      setTranscript("Aaj mandi mein gehun ka bhaav kya hai?");
      setTimeout(() => {
        setState("thinking");
        processInput("Aaj mandi mein gehun ka bhaav kya hai?");
      }, 1500);
    }, 2000);
  };

  const processInput = async (text: string) => {
    try {
      const resp = await apiClient.post<APIResponse<IntentResponse>>("/voice/intent", {
        transcript: text
      });
      const data = resp.data.data;
      
      setResponse({ text: data.text, sub: data.sub, screen: data.screen });
      setState("responding");
      speak(data.text);
    } catch (e) {
      console.error(e);
      const resText = "I couldn't process that right now. Please try again.";
      setResponse({ text: resText, sub: "Connection error", screen: null });
      setState("responding");
      speak(resText);
    }
  };

  const speak = (text: string) => {
    setIsSpeaking(true);
    if ("speechSynthesis" in window) {
      const utance = new SpeechSynthesisUtterance(text);
      utance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utance);
    } else {
      setTimeout(() => setIsSpeaking(false), 3000);
    }
  };

  const reset = () => {
    setState("idle");
    setTranscript("");
    setResponse(null);
    window.speechSynthesis.cancel();
  };

  if (role !== "farmer") return null;

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
      
      <AnimatePresence>
        {state === "responding" && response && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-6 w-[320px] bg-white/90 backdrop-blur-xl border border-[#e5e3d7] p-5 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-[#408447]" />
            <h4 className="font-mukta font-bold text-[#1a1a1a] mb-1 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#408447]" />
              AI Recommendation
            </h4>
            <p className="font-hind text-sm text-[#333333] font-bold leading-tight mb-2">
              {response.text}
            </p>
            <p className="font-hind text-xs text-[#666666] leading-relaxed mb-4">
              {response.sub}
            </p>
            
            <div className="flex gap-2">
               {response.screen && (
                 <button 
                   onClick={() => { onNavigate(response.screen); reset(); }}
                   className="flex-1 bg-[#408447] text-white py-2 font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 active:scale-95 transition-all"
                 >
                   Go to Feature <ChevronRight className="w-3 h-3" />
                 </button>
               )}
               <button 
                 onClick={reset}
                 className="px-3 bg-gray-100 text-gray-500 py-2 font-bold text-[11px] uppercase tracking-wider active:scale-95 transition-all"
               >
                 Close
               </button>
            </div>

            {isSpeaking && (
              <div className="mt-3 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-[#408447] animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-[#408447] animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-[#408447] animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-[10px] text-[#408447] font-bold ml-1 uppercase">Speaking...</span>
              </div>
            )}
          </motion.div>
        )}

        {(state === "listening" || state === "thinking") && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mb-4 bg-black/80 backdrop-blur-md text-white px-6 py-3 rounded-full flex items-center gap-4 shadow-xl border border-white/10"
          >
            {state === "listening" ? (
              <div className="flex items-center gap-3">
                <div className="flex items-end gap-1 h-4">
                  {[...Array(5)].map((_, i) => (
                    <motion.div 
                      key={i}
                      animate={{ height: [8, 16, 8] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                      className="w-1 bg-[#408447]" 
                    />
                  ))}
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#408447]">Listening...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-yellow-400">Thinking...</span>
              </div>
            )}
            {transcript && (
              <p className="text-sm font-hind italic text-white/80 border-l border-white/20 pl-4 border-dashed max-w-[200px] truncate">
                "{transcript}"
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={state === "idle" ? startListening : reset}
        className={`group relative w-16 h-16 flex items-center justify-center transition-all duration-500 rounded-none overflow-hidden ${
          state === "idle" ? "bg-[#408447] shadow-[0_8px_30px_rgba(64,132,71,0.4)]" : "bg-red-600 shadow-xl"
        }`}
      >
        {/* Animated Orbs for idle state */}
        {state === "idle" && (
          <div className="absolute inset-0 z-0">
             <div className="absolute inset-0 bg-gradient-to-tr from-green-600 to-green-400 opacity-80" />
             <motion.div 
               animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
               transition={{ duration: 3, repeat: Infinity }}
               className="absolute inset-0 bg-white/20 blur-xl"
             />
          </div>
        )}

        <div className="relative z-10 text-white">
          {state === "idle" ? (
            <div className="flex flex-col items-center">
              <Mic className="w-7 h-7" />
            </div>
          ) : (
            <X className="w-7 h-7" />
          )}
        </div>

        {/* Shimmer overlay for Thinking state */}
        {state === "thinking" && (
          <motion.div 
            animate={{ left: ["-100%", "200%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 bottom-0 w-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 z-20"
          />
        )}
      </button>
      
      {state === "idle" && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-[10px] font-bold uppercase text-[#408447] tracking-[0.2em] bg-white px-3 py-1 border border-[#408447]/20 shadow-sm mr-2"
        >
          Ask by Voice
        </motion.p>
      )}
    </div>
  );
};

export default VoiceAssistant;
