import { useState, useRef, useEffect } from "react";
import { Mic, X } from "lucide-react";
import { toast } from "sonner";
import { voiceApi } from "@/api/client";
import { useTranslation } from "react-i18next";

interface VoiceButtonProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  onResponse?: (data: any) => void;
}

const sizes = {
  sm: "w-12 h-12",
  md: "w-16 h-16",
  lg: "w-20 h-20",
};

const iconSizes = {
  sm: "w-5 h-5",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

const VoiceButton = ({ size = "md", label, onResponse }: VoiceButtonProps) => {
  const { i18n } = useTranslation();
  const [active, setActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await handleAudioUpload(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setActive(true);
      setLiveTranscript("Recording Audio...");
    } catch (err) {
      toast.error("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setActive(false);
    }
  };

  const handleAudioUpload = async (blob: Blob) => {
    setProcessing(true);
    setLiveTranscript("Whisper AI is Thinking...");
    try {
      const res = await voiceApi.processAudio(blob);
      const data = res.data.data;
      if (onResponse) onResponse(data);
      
      // Show what was heard
      setLiveTranscript(data.heard || "I understood your request.");
      
      speak(data.text, data.lang);
      toast.success(data.text);
      
      setTimeout(() => {
        setLiveTranscript("");
      }, 4000);
    } catch (err) {
      toast.error("Cloud brain is offline. Try again.");
      setLiveTranscript("");
    } finally {
      setProcessing(false);
    }
  };

  const speak = (text: string, langCode: string) => {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    if (langCode === "hi") utter.lang = "hi-IN";
    else if (langCode === "mr") utter.lang = "mr-IN";
    else utter.lang = "en-IN";
    window.speechSynthesis.speak(utter);
  };

  return (
    <div className="flex flex-col items-center gap-2 relative">
      {/* Live Audio Transcript Bubble */}
      {active || liveTranscript ? (
        <div className="absolute bottom-full mb-4 w-64 bg-white border-2 border-primary p-3 shadow-2xl animate-in fade-in slide-in-from-bottom-2 z-50">
          <div className="flex justify-between items-start mb-1">
             <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">
               {active ? "Live Audio" : "Whisper AI Brain"}
             </span>
             <button onClick={() => { stopRecording(); setLiveTranscript(""); }} className="text-gray-400 hover:text-red-500">
               <X className="w-3 h-3" />
             </button>
          </div>
          <p className="text-sm font-mukta font-bold text-foreground leading-snug">
            {active ? "Listening to your voice..." : `"${liveTranscript}"`}
          </p>
          {processing && (
            <div className="mt-2 w-full h-1 bg-gray-100 overflow-hidden">
              <div className="w-1/2 h-full bg-primary animate-progress" />
            </div>
          )}
        </div>
      ) : null}

      <button
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
        disabled={processing}
        className={`relative ${sizes[size]} rounded-none flex items-center justify-center transition-all duration-300 ${
          active ? "bg-red-500 scale-110 shadow-[0_0_40px_rgba(239,68,68,0.4)]" : "bg-primary text-primary-foreground"
        } touch-none`}
      >
        {active && (
          <>
            <span className="absolute inset-0 rounded-none border-2 border-red-500 animate-ripple" style={{ animationDelay: "0s" }} />
            <span className="absolute inset-0 rounded-none border-2 border-red-500 shadow-inner" />
          </>
        )}
        <Mic className={`${iconSizes[size]} relative z-10`} />
      </button>
      
      {label && !active && (
        <span className="text-xs text-muted-foreground font-hind uppercase font-bold tracking-widest">{label}</span>
      )}
      
      {active && (
        <div className="flex items-center gap-1 h-6">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="w-0.5 rounded-none bg-red-400"
              style={{
                height: `${8 + Math.random() * 12}px`,
                animation: `pulse 0.4s ease-in-out infinite`,
                animationDelay: `${i * 0.05}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VoiceButton;
