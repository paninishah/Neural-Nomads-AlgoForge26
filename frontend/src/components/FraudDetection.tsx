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
import type { Role } from "@/components/RoleLogin";

type ScanMode = "gathering" | "capturing_bottle" | "capturing_bill" | "capturing_qr" | "loading" | "result";
type ResultType = "safe" | "suspicious" | "risk";

const FraudDetection = ({ onBack, lang, role }: { onBack: () => void; lang?: any, role?: Role }) => {
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
    
    // OUTPUT PRINCIPLE: Mocking exact JSON backend response structure as requested
    const mockAiResponse = {
       status: "success",
       decision: "pending_manual_review",
       message_text: "System requires field operator to verify labeling anomalies."
    };
    console.log("AI Backend Response:", mockAiResponse);

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
          <div className="bg-green-50 border-2 border-green-200 rounded-none p-6 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/10 rounded-none -mr-10 -mt-10 blur-2xl" />
            <ShieldCheck className="w-16 h-16 text-green-500 mb-3" />
            <h2 className="text-2xl font-bold font-mukta text-green-700 tracking-tight">SAFE PRODUCT</h2>
            <div className="inline-flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded-none text-sm font-bold mt-2">
              Confidence: 96%
            </div>
            <p className="text-xs font-bold text-green-700 mt-2 bg-green-200/50 px-3 py-1 rounded-none">
              Cross-verified {Object.values(inputs).filter(Boolean).length} sources
            </p>
          </div>

          <div className="bg-white rounded-none p-5 border shadow-sm">
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
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-none p-6 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/20 rounded-none -mr-10 -mt-10 blur-2xl" />
            <AlertTriangle className="w-16 h-16 text-yellow-500 mb-3" />
            <h2 className="text-2xl font-bold font-mukta text-yellow-700 tracking-tight">POSSIBLY FAKE</h2>
            <div className="inline-flex items-center gap-1 bg-yellow-500 text-white px-3 py-1 rounded-none text-sm font-bold mt-2">
              Confidence: 65%
            </div>
             <p className="text-xs text-yellow-800 mt-2 bg-yellow-200/50 px-3 py-1 rounded-none">
              Only 1 source verified
            </p>
          </div>

          <div className="bg-white rounded-none p-5 border shadow-sm">
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
             
             <div className="p-4 bg-gray-50 rounded-none border border-gray-100 flex items-start gap-3">
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
        <div className="bg-red-50 border-2 border-red-200 rounded-none p-6 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-400/20 rounded-none -mr-10 -mt-10 blur-2xl" />
          <ShieldAlert className="w-16 h-16 text-red-600 mb-3" />
          <h2 className="text-2xl font-bold font-mukta text-red-700 tracking-tight">HIGH RISK PRODUCT</h2>
          <div className="inline-flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded-none text-sm font-bold mt-2">
            Confidence: 89%
          </div>
        </div>

        <div className="bg-white rounded-none p-5 border shadow-sm">
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

           <div className="p-4 bg-red-600 rounded-none text-center shadow-md">
              <h4 className="font-bold text-lg text-white font-mukta uppercase tracking-widest">DO NOT USE THIS</h4>
           </div>
        </div>

        {/* Nearby Alert Bonus */}
        <div className="bg-red-50 border border-red-200 rounded-none p-5 shadow-sm flex items-start gap-4">
           <div className="w-10 h-10 bg-red-100 rounded-none flex items-center justify-center flex-shrink-0 text-red-600">
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
      className={`w-full border-2 rounded-none p-5 text-left transition-all flex items-center gap-4 ${
        isAdded 
          ? "bg-green-50 border-green-200 opacity-80 cursor-default" 
          : "bg-white border-gray-200 hover:border-gray-300 shadow-sm active:scale-[0.98]"
      }`}
    >
      <div className={`w-12 h-12 rounded-none flex items-center justify-center flex-shrink-0 ${isAdded ? 'bg-green-100 text-green-600' : accent}`}>
        {isAdded ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
      </div>
      <div className="flex-1">
        <h3 className={`font-bold text-lg font-mukta ${isAdded ? 'text-green-800' : 'text-gray-800'}`}>{title}</h3>
        <p className={`text-sm font-hind font-bold mt-0.5 ${isAdded ? 'text-green-600' : 'text-gray-500'}`}>{isAdded ? 'Added' : subtitle}</p>
      </div>
      {!isAdded && <PlusCircle className="w-6 h-6 text-gray-300" />}
    </button>
  );

  // ----------------------------------------------------
  // NGO FIELD OPERATOR VIEW
  // ----------------------------------------------------
  if (role === "ngo" || role === "admin") {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <div className="bg-white p-6 border-b border-[#e5e3d7] shadow-sm">
           <h2 className="font-mukta font-bold text-2xl text-[#1a1a1a]">Input Verification Queue</h2>
           <p className="font-hind text-gray-500 text-sm mt-1 mb-6">Review scans flagged by the AI for manual verification.</p>
           
           <div className="space-y-4">
              <div className="bg-gray-50 p-4 border border-gray-200">
                 <div className="flex justify-between items-start mb-3">
                   <div>
                     <h3 className="font-bold text-[#1a1a1a]">SuperGro Pesticide Scan</h3>
                     <p className="text-xs text-gray-500">Submitted by: Farmer #9421 (Nashik)</p>
                   </div>
                   <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1">pending_manual_review</span>
                 </div>
                 <div className="flex gap-4 mb-4">
                    <div className="w-24 h-24 bg-gray-200 border border-gray-300 flex items-center justify-center text-xs text-gray-500">Bottle Img</div>
                    <div className="w-24 h-24 bg-gray-200 border border-gray-300 flex items-center justify-center text-xs text-gray-500">Receipt Img</div>
                 </div>
                 <div className="p-3 bg-red-50 border-l-2 border-red-500 text-xs text-red-700 mb-4 font-bold">
                    AI OUTPUT: Price 30% below market average. Missing hologram on label.
                 </div>
                 <div className="flex gap-3">
                    <button className="bg-[#c82b28] text-white px-4 py-2 text-sm font-bold flex-1 hover:bg-red-800 transition-colors">Mark as FAKE (Alert Area)</button>
                    <button className="bg-[#408447] text-white px-4 py-2 text-sm font-bold flex-1 hover:bg-green-800 transition-colors">Verify as Authentic</button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // FARMER END USER VIEW
  // ----------------------------------------------------
  return (
    <div className={`space-y-6 w-full max-w-4xl mx-auto`}>

      <div className="px-5 mt-6">
        {mode === "gathering" && (
          <div className="space-y-6" style={{ animation: "slide-up-fade 0.3s ease-out forwards" }}>
            
            <div className="bg-white p-4 rounded-none border shadow-sm hidden">
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
                className="w-full py-4 rounded-none shadow-[0_8px_20px_rgba(34,197,94,0.3)] bg-primary text-white font-bold font-mukta text-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
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
            <div className="relative w-full aspect-[3/4] max-w-sm rounded-none overflow-hidden bg-white/50 backdrop-blur-md border border-[#2d5a27]/30 shadow-2xl flex items-center justify-center">
              <div className="absolute inset-8 border-2 border-[#2d5a27]/40 rounded-none flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-t-2 border-l-2 absolute top-0 left-0 border-primary rounded-none"></div>
                <div className="w-16 h-16 border-t-2 border-r-2 absolute top-0 right-0 border-primary rounded-none"></div>
                <div className="w-16 h-16 border-b-2 border-l-2 absolute bottom-0 left-0 border-primary rounded-none"></div>
                <div className="w-16 h-16 border-b-2 border-r-2 absolute bottom-0 right-0 border-primary rounded-none"></div>
                
                {mode === "capturing_bottle" && <Camera className="w-12 h-12 text-white/50 mb-2" />}
                {mode === "capturing_bill" && <FileText className="w-12 h-12 text-white/50 mb-2" />}
                {mode === "capturing_qr" && <QrCode className="w-12 h-12 text-white/50 mb-2" />}
                
                <p className="text-[#2d5a27]/80 font-mukta font-bold text-sm">
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
              className="mt-8 px-10 py-4 rounded-none bg-primary text-white font-bold font-mukta text-lg shadow-[0_0_20px_rgba(34,197,94,0.4)] active:scale-95 transition-all w-full max-w-sm"
            >
              Capture Context
            </button>
          </div>
        )}

        {mode === "loading" && (
          <div className="flex flex-col items-center justify-center h-[70vh]" style={{ animation: "slide-up-fade 0.3s ease-out forwards" }}>
            <Activity className="w-16 h-16 text-primary animate-pulse mb-6" />
            <p className="font-mukta font-bold text-xl text-[#1a2f1c] text-center px-6">Cross-verifying across bill, packaging, and supply chain signals...</p>
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
              className="w-full py-4 mt-6 rounded-none shadow-sm bg-white border-2 border-gray-200 text-gray-700 font-bold font-mukta text-lg active:scale-95 transition-transform"
            >
              Scan Another Product
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default FraudDetection;