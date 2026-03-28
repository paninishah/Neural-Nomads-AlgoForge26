import { ArrowLeft } from "lucide-react";

interface ScreenHeaderProps {
  onBack: () => void;
  title: string;
  icon: string;
  subtitle?: string;
}

const ScreenHeader = ({ onBack, title, icon, subtitle }: ScreenHeaderProps) => (
  <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border/50">
    <div className="flex items-center gap-3 px-5 py-4">
      <button
        onClick={onBack}
        className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center active:scale-95 transition-all text-foreground hover:bg-muted"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h2 className="text-xl font-bold text-foreground font-mukta truncate">{title}</h2>
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground font-hind mt-0.5 ml-8">{subtitle}</p>
        )}
      </div>
    </div>
  </div>
);

export default ScreenHeader;
