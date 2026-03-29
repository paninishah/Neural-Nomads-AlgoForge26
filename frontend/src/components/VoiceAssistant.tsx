import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, X, Play, Square, Loader2, MessageSquare, ChevronRight, Store, ShieldCheck, Scale, Landmark, Wallet } from "lucide-react";
import { theme } from "@/designSystem";
import { chatbotApi, voiceApi } from "@/api/client";
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
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setState("listening");
      setTranscript("Recording...");
    } catch (err) {
      console.error("Mic access error", err);
      setState("idle");
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setState("thinking");
    }
  };

  const processAudio = async (blob: Blob) => {
    try {
      const resp = await voiceApi.processAudio(blob);
      const data = resp.data.data;
      
      setTranscript(data.heard || "");
      setResponse({ text: data.text, sub: data.sub, screen: data.screen });
      setState("responding");
      
      // Speak the ENTIRE answer (text + sub)
      const fullResponse = `${data.text}. ${data.sub}`;
      speak(fullResponse, data.lang);
    } catch (e) {
      console.error(e);
      const resText = "I couldn't process that right now. Please try again.";
      setResponse({ text: resText, sub: "Connection error", screen: null });
      setState("responding");
      speak(resText, "en");
    }
  };

  const speak = (text: string, langCode: string = "en-IN") => {
    if (!("speechSynthesis" in window)) return;
    
    // Reset and Start
    window.speechSynthesis.cancel();
    setIsSpeaking(true);

    const utance = new SpeechSynthesisUtterance(text);
    
    const setVoiceAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      
      // Determine targets based on requested language
      if (langCode.startsWith("mr")) {
        utance.lang = "mr-IN";
        // Priority: Marathi voice -> Hindi voice (fallback) -> any with 'mr'
        utance.voice = voices.find(v => v.lang === "mr-IN") || 
                       voices.find(v => v.lang === "hi-IN") ||
                       voices.find(v => v.lang.startsWith("mr"));
      } else if (langCode.startsWith("hi")) {
        utance.lang = "hi-IN";
        utance.voice = voices.find(v => v.lang === "hi-IN") ||
                       voices.find(v => v.lang.startsWith("hi"));
      } else {
        utance.lang = "en-IN";
        utance.voice = voices.find(v => v.lang.startsWith("en"));
      }

      // Voice volume and speed optimization for clarity
      utance.rate = 0.9; // Slightly slower for rural Marathi clarity
      utance.pitch = 1.0;
      
      utance.onend = () => setIsSpeaking(false);
      utance.onerror = (e) => {
        console.error("Speech error", e);
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utance);
    };

    // Browsers often load voices asynchronously
    if (window.speechSynthesis.getVoices().length > 0) {
      setVoiceAndSpeak();
    } else {
      window.speechSynthesis.onvoiceschanged = setVoiceAndSpeak;
    }
  };

  const reset = () => {
    setState("idle");
    setTranscript("");
    setResponse(null);
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
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
                <span className="text-xs font-black uppercase tracking-widest text-red-500 animate-pulse">TAP TO STOP & PROCESS</span>
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
        onClick={state === "idle" ? startListening : state === "listening" ? stopListening : reset}
        className={`group relative w-16 h-16 flex items-center justify-center transition-all duration-500 rounded-none overflow-hidden ${
          state === "idle" ? "bg-[#408447] shadow-[0_8px_30px_rgba(64,132,71,0.4)]" : 
          state === "listening" ? "bg-red-600 animate-pulse" : "bg-red-600 shadow-xl"
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
