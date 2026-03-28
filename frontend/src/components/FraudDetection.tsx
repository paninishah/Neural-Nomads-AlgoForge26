import { useState } from "react";
import {
  Camera,
  FileText,
  QrCode,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  Activity,
  CheckCircle2,
  XCircle,
  Users,
  AlertCircle,
  PlusCircle
} from "lucide-react";
import ScreenHeader from "./ScreenHeader";
import VoiceButton from "./VoiceButton";

type ScanMode = "gathering" | "capturing_bottle" | "capturing_bill" | "capturing_qr" | "loading" | "result";
type ResultType = "safe" | "suspicious" | "risk";

const FraudDetection = ({ onBack, lang }: { onBack: () => void; lang?: any }) => {
  const [mode, setMode] = useState<ScanMode>("gathering");
  const [inputs, setInputs] = useState({
    bottle: false,
    bill: false,
    qr: false,
  });
  const [resultData, setResultData] = useState<ResultType>("safe");

  const captureInput = (type: keyof typeof inputs) => {
    // Fake capture delay
    setTimeout(() => {
      setInputs((prev) => ({ ...prev, [type]: true }));
      setMode("gathering");
    }, 1500);
  };

  const processScan = () => {
    setMode("loading");
    // Pseudo-random logic to show different states based on inputs provided
    // If they provide all 3, let's show SAFE or RISK to demonstrate high confidence
    // If they provide only 1, let's show SUSPICIOUS to demonstrate lower confidence
    setTimeout(() => {
      const count = Object.values(inputs).filter(Boolean).length;
      if (count === 3) setResultData("safe");
      else if (count === 2) setResultData("risk");
      else setResultData("suspicious");

      setMode("result");
    }, 2500);
  };

  const hasAnyInput = inputs.bottle || inputs.bill || inputs.qr;

  const renderResult = () => {
    if (resultData === "safe") {
      return (
        <div className="space-y-5" style={{ animation: "slide-up-fade 0.4s ease-out forwards" }}>
          <div className="bg-green-50 border-2 border-green-200 rounded-3xl p-6 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/10 rounded-full -mr-10 -mt-10 blur-2xl" />
            <ShieldCheck className="w-16 h-16 text-green-500 mb-3" />
            <h2 className="text-2xl font-bold font-mukta text-green-700 tracking-tight">SAFE PRODUCT</h2>
            <div className="inline-flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold mt-2">
              Confidence: 96%
            </div>
            <p className="text-xs font-bold text-green-700 mt-2 bg-green-200/50 px-3 py-1 rounded-full">
              Cross-verified {Object.values(inputs).filter(Boolean).length} sources
            </p>
          </div>

          <div className="bg-white rounded-3xl p-5 border shadow-sm">
             <ul className="space-y-3">
               <li className="flex items-start gap-3">
                 <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                 <span className="text-sm font-hind text-gray-700"><strong>Verified brand:</strong> Bayer</span>
               </li>
               <li className="flex items-start gap-3">
                 <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                 <span className="text-sm font-hind text-gray-700">Price matches Mandi database</span>
               </li>
               {inputs.qr && (
                 <li className="flex items-start gap-3">
                   <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                   <span className="text-sm font-hind text-gray-700">QR code matches manufacturer records</span>
                 </li>
               )}
             </ul>
          </div>
        </div>
      );
    }

    if (resultData === "suspicious") {
      return (
        <div className="space-y-5" style={{ animation: "slide-up-fade 0.4s ease-out forwards" }}>
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-3xl p-6 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/20 rounded-full -mr-10 -mt-10 blur-2xl" />
            <AlertTriangle className="w-16 h-16 text-yellow-500 mb-3" />
            <h2 className="text-2xl font-bold font-mukta text-yellow-700 tracking-tight">POSSIBLY FAKE</h2>
            <div className="inline-flex items-center gap-1 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold mt-2">
              Confidence: 65%
            </div>
             <p className="text-xs text-yellow-800 mt-2 bg-yellow-200/50 px-3 py-1 rounded-full">
              Only 1 source verified
            </p>
          </div>

          <div className="bg-white rounded-3xl p-5 border shadow-sm">
             <ul className="space-y-3 mb-4">
               <li className="flex items-start gap-3">
                 <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                 <span className="text-sm font-hind text-gray-700">Price 40% lower than market</span>
               </li>
               <li className="flex items-start gap-3">
                 <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                 <span className="text-sm font-hind text-gray-700">Label quality looks unusual</span>
               </li>
             </ul>
             
             <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-gray-700 uppercase tracking-wide">Advice</h4>
                  <p className="text-sm font-hind text-gray-600 font-bold">Buy from another trusted shop or add QR scan.</p>
                </div>
             </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-5" style={{ animation: "slide-up-fade 0.4s ease-out forwards" }}>
        <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-6 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-400/20 rounded-full -mr-10 -mt-10 blur-2xl" />
          <ShieldAlert className="w-16 h-16 text-red-600 mb-3" />
          <h2 className="text-2xl font-bold font-mukta text-red-700 tracking-tight">HIGH RISK PRODUCT</h2>
          <div className="inline-flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold mt-2">
            Confidence: 89%
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border shadow-sm">
           <ul className="space-y-3 mb-5">
             <li className="flex items-start gap-3">
               <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
               <span className="text-sm font-hind text-gray-700">QR code not found in manufacturer DB</span>
             </li>
             <li className="flex items-start gap-3">
               <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
               <span className="text-sm font-hind text-gray-700">Batch number invalid</span>
             </li>
             <li className="flex items-start gap-3">
               <Users className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
               <span className="text-sm font-hind text-gray-700">8 farmers reported crop damage from this batch</span>
             </li>
           </ul>

           <div className="p-4 bg-red-600 rounded-2xl text-center shadow-md">
              <h4 className="font-bold text-lg text-white font-mukta uppercase tracking-widest">DO NOT USE THIS</h4>
           </div>
        </div>

        {/* Nearby Alert Bonus */}
        <div className="bg-red-50 border border-red-200 rounded-3xl p-5 shadow-sm flex items-start gap-4">
           <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 text-red-600">
             <AlertTriangle className="w-5 h-5" />
           </div>
           <div>
             <h4 className="font-bold text-sm text-red-700 uppercase tracking-widest mb-1">Nearby Alert</h4>
             <p className="text-sm font-hind text-red-900 font-bold leading-snug">5 farmers reported this pesticide as harmful in the last 3 days.</p>
           </div>
        </div>
      </div>
    );
  };

  const isCapturing = mode.startsWith("capturing_");

  const InputCard = ({
    title,
    subtitle,
    icon: Icon,
    isAdded,
    onClick,
    accent
  }: {
    title: string;
    subtitle: string;
    icon: any;
    isAdded: boolean;
    onClick: () => void;
    accent: string;
  }) => (
    <button
      onClick={onClick}
      disabled={isAdded}
      className={`w-full border-2 rounded-3xl p-5 text-left transition-all flex items-center gap-4 ${
        isAdded 
          ? "bg-green-50 border-green-200 opacity-80 cursor-default" 
          : "bg-white border-gray-200 hover:border-gray-300 shadow-sm active:scale-[0.98]"
      }`}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${isAdded ? 'bg-green-100 text-green-600' : accent}`}>
        {isAdded ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
      </div>
      <div className="flex-1">
        <h3 className={`font-bold text-lg font-mukta ${isAdded ? 'text-green-800' : 'text-gray-800'}`}>{title}</h3>
        <p className={`text-sm font-hind font-bold mt-0.5 ${isAdded ? 'text-green-600' : 'text-gray-500'}`}>{isAdded ? 'Added' : subtitle}</p>
      </div>
      {!isAdded && <PlusCircle className="w-6 h-6 text-gray-300" />}
    </button>
  );

  return (
    <div className={`min-h-screen pb-28 ${mode === "gathering" || mode === "result" ? "bg-[#fdfaf5]" : "bg-black"}`}>
      <div className={mode !== "gathering" && mode !== "result" ? "dark" : ""}>
        <ScreenHeader
          onBack={() => {
            if (mode === "gathering") {
              if (hasAnyInput) setInputs({ bottle: false, bill: false, qr: false });
              else onBack();
            } else setMode("gathering");
          }}
          title="Safety Scanner"
          icon="🛡️"
          subtitle={mode === "gathering" ? "Add evidence to cross-verify" : ""}
        />
      </div>

      <div className="px-5 mt-6">
        {mode === "gathering" && (
          <div className="space-y-6" style={{ animation: "slide-up-fade 0.3s ease-out forwards" }}>
            
            <div className="bg-white p-4 rounded-3xl border shadow-sm hidden">
              {/* Optional progress indicator if needed */}
            </div>

            <div className="space-y-3">
               <InputCard
                 title="Scan Bottle Label"
                 subtitle="Required for best accuracy"
                 icon={Camera}
                 isAdded={inputs.bottle}
                 onClick={() => setMode("capturing_bottle")}
                 accent="bg-primary/10 text-primary"
               />
               <InputCard
                 title="Upload Bill / Receipt"
                 subtitle="Optional: checks dealer"
                 icon={FileText}
                 isAdded={inputs.bill}
                 onClick={() => setMode("capturing_bill")}
                 accent="bg-gray-100 text-gray-600"
               />
               <InputCard
                 title="Scan QR Code"
                 subtitle="Optional: verifies batch"
                 icon={QrCode}
                 isAdded={inputs.qr}
                 onClick={() => setMode("capturing_qr")}
                 accent="bg-blue-50 text-blue-500"
               />
            </div>

            <div className={`transition-all duration-500 ${hasAnyInput ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
              <button
                onClick={processScan}
                className="w-full py-4 rounded-xl shadow-[0_8px_20px_rgba(34,197,94,0.3)] bg-primary text-white font-bold font-mukta text-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <Activity className="w-5 h-5" /> Analyze Everything Together
              </button>
              <p className="text-center text-xs font-hind font-bold text-gray-400 mt-3">
                More inputs = higher AI accuracy
              </p>
            </div>
          </div>
        )}

        {isCapturing && (
          <div className="flex flex-col items-center pt-8 h-[65vh] justify-center" style={{ animation: "slide-up-fade 0.5s ease-out forwards" }}>
            <div className="relative w-full aspect-[3/4] max-w-sm rounded-3xl overflow-hidden bg-gray-900 border border-gray-800 shadow-2xl flex items-center justify-center">
              <div className="absolute inset-8 border-2 border-white/40 rounded-xl flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-t-2 border-l-2 absolute top-0 left-0 border-primary rounded-tl-xl"></div>
                <div className="w-16 h-16 border-t-2 border-r-2 absolute top-0 right-0 border-primary rounded-tr-xl"></div>
                <div className="w-16 h-16 border-b-2 border-l-2 absolute bottom-0 left-0 border-primary rounded-bl-xl"></div>
                <div className="w-16 h-16 border-b-2 border-r-2 absolute bottom-0 right-0 border-primary rounded-br-xl"></div>
                
                {mode === "capturing_bottle" && <Camera className="w-12 h-12 text-white/50 mb-2" />}
                {mode === "capturing_bill" && <FileText className="w-12 h-12 text-white/50 mb-2" />}
                {mode === "capturing_qr" && <QrCode className="w-12 h-12 text-white/50 mb-2" />}
                
                <p className="text-white/70 font-mukta font-bold text-sm">
                  {mode === "capturing_bottle" && "Align bottle label"}
                  {mode === "capturing_bill" && "Align bill clearly"}
                  {mode === "capturing_qr" && "Place QR in frame"}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (mode === "capturing_bottle") captureInput("bottle");
                if (mode === "capturing_bill") captureInput("bill");
                if (mode === "capturing_qr") captureInput("qr");
              }}
              className="mt-8 px-10 py-4 rounded-full bg-primary text-white font-bold font-mukta text-lg shadow-[0_0_20px_rgba(34,197,94,0.4)] active:scale-95 transition-all w-full max-w-sm"
            >
              Capture Context
            </button>
          </div>
        )}

        {mode === "loading" && (
          <div className="flex flex-col items-center justify-center h-[70vh]" style={{ animation: "slide-up-fade 0.3s ease-out forwards" }}>
            <Activity className="w-16 h-16 text-primary animate-pulse mb-6" />
            <p className="font-mukta font-bold text-xl text-white text-center px-6">Cross-verifying across bill, packaging, and supply chain signals...</p>
          </div>
        )}

        {mode === "result" && (
          <>
            {renderResult()}
            <button
              onClick={() => {
                setInputs({ bottle: false, bill: false, qr: false });
                setMode("gathering");
              }}
              className="w-full py-4 mt-6 rounded-xl shadow-sm bg-white border-2 border-gray-200 text-gray-700 font-bold font-mukta text-lg active:scale-95 transition-transform"
            >
              Scan Another Product
            </button>
          </>
        )}
      </div>

      {(mode === "gathering" || mode === "result") && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <div className="bg-card/95 backdrop-blur-md rounded-full px-5 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-border/50 flex items-center gap-3">
            <VoiceButton size="sm" />
            <span className="text-sm font-hind font-bold text-primary cursor-pointer hover:underline">Ask by voice</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FraudDetection;