import { useState } from "react";
import { Mic } from "lucide-react";

interface VoiceButtonProps {
  size?: "sm" | "md" | "lg";
  label?: string;
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

const VoiceButton = ({ size = "md", label }: VoiceButtonProps) => {
  const [active, setActive] = useState(false);

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={() => setActive(!active)}
        className={`relative ${sizes[size]} rounded-none flex items-center justify-center transition-all duration-300 bg-primary text-primary-foreground ${
          active ? "scale-110 shadow-[0_0_30px_hsl(var(--kisan-green)/0.5)]" : ""
        }`}
        style={{
          animation: active ? undefined : "mic-pulse 2s ease-in-out infinite",
        }}
      >
        {active && (
          <>
            <span className="absolute inset-0 rounded-none border-2 border-primary animate-ripple" style={{ animationDelay: "0s" }} />
            <span className="absolute inset-0 rounded-none border-2 border-primary animate-ripple" style={{ animationDelay: "0.5s" }} />
          </>
        )}
        <Mic className={`${iconSizes[size]} relative z-10`} />
      </button>
      {label && (
        <span className="text-xs text-muted-foreground font-hind">{label}</span>
      )}
      {active && (
        <div className="flex items-center gap-0.5 h-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="w-1 rounded-none bg-primary"
              style={{
                height: `${8 + Math.sin(Date.now() / 200 + i) * 8}px`,
                animation: `wheat-sway ${0.6 + i * 0.08}s ease-in-out infinite`,
                opacity: 0.4 + (i % 3) * 0.2,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VoiceButton;
