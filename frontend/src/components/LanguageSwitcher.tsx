import { Globe } from "lucide-react";

interface LanguageSwitcherProps {
  lang: "en" | "hi";
  onToggle: () => void;
}

const LanguageSwitcher = ({ lang, onToggle }: LanguageSwitcherProps) => (
  <button
    onClick={onToggle}
    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground text-sm font-semibold font-mukta backdrop-blur-sm hover:bg-primary-foreground/20 transition-colors"
    aria-label="Switch language"
  >
    <Globe className="w-4 h-4" />
    <span>{lang === "en" ? "हिंदी" : "English"}</span>
  </button>
);

export default LanguageSwitcher;
