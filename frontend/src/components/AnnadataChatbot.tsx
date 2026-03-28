import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Send, Bot, User, 
  ChevronRight, Sparkles, Loader2,
  CheckCircle, PlusCircle
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { APIResponse } from "@/lib/api";

interface Message {
  id: string;
  text: string;
  sender: "bot" | "user";
  timestamp: Date;
  action?: any;
}

interface AnnadataChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

const AnnadataChatbot = ({ isOpen, onClose }: AnnadataChatbotProps) => {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: t("chatbot.greeting"),
      sender: "bot",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Re-greet if language changes
  useEffect(() => {
    if (messages.length === 1 && messages[0].sender === "bot") {
      setMessages([{
        id: "1",
        text: t("chatbot.greeting"),
        sender: "bot",
        timestamp: new Date()
      }]);
    }
  }, [i18n.language]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (text?: string) => {
    const messageText = typeof text === "string" ? text : input;
    if (!messageText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    if (typeof text !== "string") setInput("");
    setLoading(true);

    try {
      const res = await apiClient.post<APIResponse<any>>("/chatbot/query", { 
        text: messageText,
        lang: i18n.language 
      });
      if (res.data.status === "success") {
        const data = res.data.data;
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          text: data.reply,
          sender: "bot",
          timestamp: new Date(),
          action: data.action_required ? { intent: data.intent } : null
        };
        setMessages(prev => [...prev, botMsg]);
      }
    } catch (e) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: t("chatbot.connectError"),
        sender: "bot",
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const confirmAction = async (intent: string) => {
    setLoading(true);
    try {
      const res = await apiClient.post<APIResponse<any>>("/chatbot/confirm", { 
        intent,
        lang: i18n.language
      });
      if (res.data.status === "success") {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: res.data.data.message || "Request created successfully!",
          sender: "bot",
          timestamp: new Date()
        }]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="fixed inset-0 md:inset-auto md:bottom-6 md:right-6 md:w-[400px] md:h-[600px] z-[100] bg-white shadow-2xl flex flex-col overflow-hidden border border-[#e5e3d7]"
    >
      {/* Header */}
      <div className="bg-[#13311c] p-4 text-white flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#408447] flex items-center justify-center border border-[#d4cb7e]/30">
            <Bot className="w-6 h-6 text-[#d4cb7e]" />
          </div>
          <div>
            <h3 className="font-mukta font-bold text-lg leading-tight">{t("chatbot.title")}</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-green-300 uppercase tracking-widest">{t("chatbot.online")}</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#fbfaf5]"
      >
        <AnimatePresence>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: m.sender === "bot" ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${m.sender === "bot" ? "justify-start" : "justify-end"}`}
            >
              <div className={`max-w-[85%] p-4 shadow-sm ${
                m.sender === "bot" 
                  ? "bg-white border-l-4 border-[#408447] text-[#1a1a1a]" 
                  : "bg-[#13311c] text-white"
              }`}>
                <p className="text-sm font-medium leading-relaxed">{m.text}</p>
                
                {m.sender === "bot" && m.action && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
                    <button 
                      onClick={() => confirmAction(m.action.intent)}
                      className="bg-[#408447] text-white px-4 py-2 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#346b3a] transition-all"
                    >
                      <PlusCircle className="w-3 h-3" />
                      {t("chatbot.createRequest")}
                    </button>
                  </div>
                )}
                
                <span className={`text-[9px] mt-2 block ${m.sender === "bot" ? "text-gray-400" : "text-white/40"}`}>
                  {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border-l-4 border-gray-300 p-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                <span className="text-xs text-gray-400 font-bold italic">{t("chatbot.thinking")}</span>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-[#e5e3d7]">
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1 no-scrollbar">
          {[t("chatbot.applyLoan"), t("chatbot.checkPesticide"), t("chatbot.sellCrop")].map(suggestion => (
            <button
              key={suggestion}
              onClick={() => handleSend(suggestion)}
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-[10px] font-black uppercase tracking-tighter text-gray-500 hover:border-[#408447] hover:text-[#408447] shrink-0 transition-all font-mukta"
            >
              {suggestion}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-[#f9f9f7] p-2 border border-gray-200 focus-within:border-[#13311c] transition-colors">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={t("chatbot.typeQuestion")}
            className="flex-1 bg-transparent border-none outline-none text-sm p-1.5 font-hind"
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="w-10 h-10 bg-[#13311c] text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#1a4427] transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AnnadataChatbot;
