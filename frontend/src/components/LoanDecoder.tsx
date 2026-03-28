import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Upload,
  Activity,
  ArrowRight,
  ShieldCheck,
  FileSearch,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  IndianRupee,
  BadgeCheck,
  FileText,
  ScanLine
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/apiClient";
import { APIResponse } from "@/lib/api";
import { toast } from "sonner";

type Mode = "landing" | "upload" | "scanning" | "report";

interface LoanOption {
  provider: string;
  interest: number;
  max_amount: number;
  tenure_months: number;
  requirements: string[];
}

interface CredibilityResponse {
  user_name: string;
  ocr_name: string;
  name_match: boolean;
  trust_score: number;
  trust_factors: {
    phone_verified: boolean;
    document_uploaded: boolean;
    ai_confidence: "low" | "medium" | "high" | "none";
    ngo_verified: boolean;
    profile_complete: boolean;
  };
  eligible: boolean;
  max_amount: number;
  recommended_amount: number;
  loan_options: LoanOption[];
}

export default function LoanDecoder({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>("landing");
  const [docType, setDocType] = useState<"aadhaar" | "ration_card">("aadhaar");
  const [file, setFile] = useState<File | null>(null);
  const [scanningProgress, setScanningProgress] = useState(0);
  const [result, setResult] = useState<CredibilityResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const userId = localStorage.getItem("annadata_user_id");

  // --- Handlers ---

  const handleUploadClick = () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }
    startProcessing();
  };

  const startProcessing = async () => {
    setMode("scanning");
    setScanningProgress(0);

    // Simulate OCR progress for UI feel
    const interval = setInterval(() => {
      setScanningProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 400);

    try {
      // 1. Upload the document
      const formData = new FormData();
      formData.append("file", file!);
      formData.append("doc_type", docType);
      formData.append("user_id", userId!);

      await apiClient.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setScanningProgress(95);

      // 2. Fetch the credibility score
      const credResp = await apiClient.post<APIResponse<CredibilityResponse>>("/loan/check-credibility");
      setResult(credResp.data.data);
      
      setScanningProgress(100);
      setTimeout(() => setMode("report"), 500);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || "Verification failed";
      toast.error(errorMsg);
      console.error("Upload Error:", err);
      setMode("upload");
    } finally {
      clearInterval(interval);
    }
  };

  // --- Components ---

  const PointRow = ({ factor, maxPoints, value, label }: { factor: string, maxPoints: number, value: boolean | string, label: string }) => {
    let earned = 0;
    if (factor === "NGO Verified" && value === true) earned = 25;
    if (factor === "AI Confidence") {
        if (value === "high") earned = 25;
        else if (value === "medium") earned = 15;
        else if (value === "low") earned = 5;
    }
    if (factor === "Phone Verified" && value === true) earned = 20;
    if (factor === "Has Documents") {
        // Simple logic for the table based on factor object
        earned = value ? 20 : 0; 
    }
    if (factor === "Profile Complete" && value === true) earned = 10;

    return (
      <tr className="border-b border-[#e5e3d7] text-sm">
        <td className="py-4 pr-4 font-bold text-[#1a1a1a]">{factor}</td>
        <td className="py-4 pr-4 font-bold text-[#666666]">{maxPoints} pts</td>
        <td className="py-4 text-[#666666] font-hind leading-tight">{label}</td>
      </tr>
    );
  };

  const currentModeUI = () => {
    switch (mode) {
      case "landing":
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-[#13311c] text-white p-8 border-l-4 border-[#e18b2c] shadow-xl">
              <h2 className="font-mukta font-black text-3xl mb-2">{t("loan.title")}</h2>
              <p className="font-hind text-white/80 text-lg">
                {t("loan.unlockPotential")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => { setDocType("aadhaar"); setMode("upload"); }}
                className="bg-white border-2 border-[#e5e3d7] hover:border-[#408447] p-6 text-left transition-all active:scale-[0.98] group"
              >
                <div className="w-12 h-12 bg-[#fbfaf5] flex items-center justify-center mb-4 group-hover:bg-[#408447] group-hover:text-white transition-colors">
                  <BadgeCheck className="w-6 h-6" />
                </div>
                <h3 className="font-mukta font-bold text-xl text-[#1a1a1a]">{t("loan.aadhaarCard")}</h3>
                <p className="text-sm text-gray-400 font-hind">{t("loan.ocrFast")}</p>
              </button>

              <button 
                onClick={() => { setDocType("ration_card"); setMode("upload"); }}
                className="bg-white border-2 border-[#e5e3d7] hover:border-[#408447] p-6 text-left transition-all active:scale-[0.98] group"
              >
                <div className="w-12 h-12 bg-[#fbfaf5] flex items-center justify-center mb-4 group-hover:bg-[#408447] group-hover:text-white transition-colors">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-mukta font-bold text-xl text-[#1a1a1a]">{t("loan.rationCard")}</h3>
                <p className="text-sm text-gray-400 font-hind">{t("loan.altIdentity")}</p>
              </button>
            </div>
          </motion.div>
        );

      case "upload":
        return (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <button onClick={() => setMode("landing")} className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
              ← Change Document Type
            </button>

            <div className="bg-white border border-[#e5e3d7] shadow-sm">
                <div className="p-6 border-b border-[#e5e3d7] bg-[#fbfaf5]">
                    <h3 className="font-mukta font-bold text-lg text-[#1a1a1a] uppercase tracking-wide">
                        Upload {docType === "aadhaar" ? "Aadhaar Card" : "Ration Card"}
                    </h3>
                </div>
                <div className="p-10 flex flex-col items-center">
                    <div className="w-full max-w-sm border-2 border-dashed border-[#e5e3d7] p-12 flex flex-col items-center justify-center bg-[#fbfaf5] relative">
                        <Upload className="w-12 h-12 text-[#e5e3d7] mb-4" />
                        <p className="text-sm font-bold text-gray-400 font-hind">Click to browse or Drag & Drop</p>
                        <input 
                            type="file" 
                            accept="image/*,application/pdf"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </div>
                    {file && (
                        <div className="mt-4 flex items-center gap-2 bg-green-50 text-[#408447] px-4 py-2 border border-[#408447]/20">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-sm font-bold">{file.name}</span>
                        </div>
                    )}
                </div>
            </div>

            <button 
              onClick={handleUploadClick}
              disabled={!file}
              className="w-full bg-[#408447] text-white py-4 font-mukta font-black text-xl flex items-center justify-center gap-3 hover:bg-[#13311c] disabled:opacity-50 transition-all shadow-lg"
            >
              <ScanLine className="w-6 h-6" />
              {t("loan.startScanning")}
            </button>
          </motion.div>
        );

      case "scanning":
        return (
          <div className="flex flex-col items-center justify-center py-24 space-y-6">
            <div className="relative w-24 h-24">
              <Loader2 className="w-24 h-24 text-[#408447] animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Activity className="w-8 h-8 text-[#e18b2c]" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="font-mukta font-black text-2xl text-gray-800">Processing Document...</h3>
              <p className="text-gray-400 font-hind max-w-[250px] mx-auto mt-2">
                Our AI is extracting identity data and matching it with your profile records.
              </p>
            </div>
            <div className="w-full max-w-sm h-1.5 bg-gray-100 border border-[#e5e3d7] overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${scanningProgress}%` }}
                    className="h-full bg-[#408447]"
                />
            </div>
          </div>
        );

      case "report":
        if (!result) return null;
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8 pb-20"
          >
            {/* --- Hero Result --- */}
            <div className="bg-white border-4 border-[#13311c] p-8 shadow-2xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <IndianRupee className="w-32 h-32" />
                </div>
                <div className="relative">
                    <div className="w-32 h-32 border-[8px] border-[#408447] rounded-full flex flex-col items-center justify-center bg-[#fbfaf5]">
                        <span className="text-3xl font-black font-mukta text-[#13311c]">{result.trust_score}</span>
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-tighter">Trust Score</span>
                    </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                        {result.name_match ? (
                            <span className="bg-[#408447] text-white text-[10px] font-black px-2 py-0.5 uppercase tracking-widest flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> Identity Verified
                            </span>
                        ) : (
                            <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 uppercase tracking-widest flex items-center gap-1">
                                <XCircle className="w-3 h-3" /> Name Mismatch
                            </span>
                        )}
                        <span className="bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 uppercase tracking-widest">
                            AI Confidence: {result.trust_factors.ai_confidence.toUpperCase()}
                        </span>
                    </div>
                    <h2 className="font-mukta font-black text-3xl text-[#1a1a1a]">
                        {result.eligible ? "Eligible for Credit" : "Improve Your Score"}
                    </h2>
                    <p className="font-hind text-gray-500 mt-2">
                        {result.name_match 
                            ? `We detected '${result.ocr_name}' on your card, which matches your profile.`
                            : `Warning: Name on card ('${result.ocr_name}') doesn't match profile ('${result.user_name}').`}
                    </p>
                </div>
            </div>

            {/* --- Table: The Point Breakdown --- */}
            <div className="bg-[#f2f0e4] border border-[#e5e3d7] p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-6 h-1 bg-[#408447]" />
                    <h3 className="font-mukta font-black text-sm uppercase tracking-widest text-[#1a1a1a]">
                        📊 The Point Breakdown
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[#e18b2c] text-[10px] font-black uppercase tracking-widest text-gray-400">
                                <td className="pb-2">Factor</td>
                                <td className="pb-2">Max Points</td>
                                <td className="pb-2">What it means</td>
                            </tr>
                        </thead>
                        <tbody>
                            <PointRow 
                                factor="NGO Verified" 
                                maxPoints={25} 
                                value={result.trust_factors.ngo_verified}
                                label="The most important factor. This is when an NGO manually 'vets' the farmer."
                            />
                            <PointRow 
                                factor="AI Confidence" 
                                maxPoints={25} 
                                value={result.trust_factors.ai_confidence}
                                label="Based on the OCR scan. High confidence level boosts your reliability."
                            />
                            <PointRow 
                                factor="Phone Verified" 
                                maxPoints={20} 
                                value={result.trust_factors.phone_verified}
                                label="Basic level security (SMS/Phone check)."
                            />
                            <PointRow 
                                factor="Has Documents" 
                                maxPoints={20} 
                                value={result.trust_factors.document_uploaded}
                                label="Points for uploading valid identity and land documents."
                            />
                            <PointRow 
                                factor="Profile Complete" 
                                maxPoints={10} 
                                value={result.trust_factors.profile_complete}
                                label="Has the farmer filled out their village, district, and crop types?"
                            />
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- Credit Limits --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-[#e5e3d7] p-6">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Recommended Loan</p>
                    <h4 className="text-3xl font-mukta font-black text-[#408447]">₹{result.recommended_amount.toLocaleString()}</h4>
                </div>
                <div className="bg-white border border-[#e5e3d7] p-6">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Max Credit Limit</p>
                    <h4 className="text-3xl font-mukta font-black text-[#13311c]">₹{result.max_amount.toLocaleString()}</h4>
                </div>
            </div>

            {/* --- Loan Options --- */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-1 bg-[#e18b2c]" />
                    <h3 className="font-mukta font-black text-sm uppercase tracking-widest text-[#1a1a1a]">
                        Available Loan Options
                    </h3>
                </div>
                <div className="grid grid-cols-1 gap-3">
                    {result.loan_options.map((opt, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white border border-[#e5e3d7] p-5 hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                            <div className="space-y-1">
                                <h4 className="font-mukta font-black text-lg text-[#1a1a1a]">{opt.provider}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {opt.requirements.map((r, ri) => (
                                        <span key={ri} className="text-[9px] font-bold bg-[#fbfaf5] border border-[#e5e3d7] px-1.5 py-0.5 text-gray-500 uppercase">
                                            {r}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-10">
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Interest</p>
                                    <p className="font-mukta font-black text-[#408447] text-xl">{opt.interest}%</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Tenure</p>
                                    <p className="font-mukta font-black text-[#13311c] text-xl">{opt.tenure_months}mo</p>
                                </div>
                                <button className="bg-[#408447] text-white px-6 py-2 font-black font-mukta text-sm uppercase tracking-widest hover:bg-[#13311c] transition-colors">
                                    Select
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto min-h-[600px] flex flex-col">
       {/* Global Back Header is handled by AppLayout for farmers */}
       
       <div className="flex-1">
           {currentModeUI()}
       </div>
    </div>
  );
}
