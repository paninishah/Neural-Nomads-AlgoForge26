import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "English",  native: "English" },
  { code: "hi", label: "Hindi",    native: "हिंदी" },
  { code: "mr", label: "Marathi",  native: "मराठी" },
  { code: "te", label: "Telugu",   native: "తెలుగు" },
];

const LanguageSwitcher = ({ compact = false }: { compact?: boolean }) => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];

  const handleSelect = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem("annadata_lang", code);
    setOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative" style={{ zIndex: 50 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 transition-all font-mukta font-bold text-xs uppercase tracking-widest ${
          compact
            ? "px-3 py-2 text-white/70 hover:text-white hover:bg-white/5 w-full"
            : "px-3 py-1.5 border border-transparent hover:border-white/20 text-white/60 hover:text-white"
        }`}
        title="Change language"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{current.native}</span>
        <span className="ml-auto opacity-40 text-[10px]">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div
          className="absolute bottom-full left-0 mb-1 w-44 bg-[#0e2715] border border-white/10 shadow-2xl overflow-hidden"
          role="listbox"
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              role="option"
              aria-selected={lang.code === i18n.language}
              onClick={() => handleSelect(lang.code)}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold transition-colors ${
                lang.code === i18n.language
                  ? "bg-[#254d31] text-[#d4cb7e]"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="tracking-wide">{lang.native}</span>
              <span className="opacity-40 uppercase font-mono">{lang.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
