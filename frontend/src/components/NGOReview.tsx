import { useState, useEffect } from "react";
import { 
  Users, ShieldCheck, ShieldAlert,
  AlertTriangle, CheckCircle, XCircle,
  FileText, Activity, MapPin, Eye,
  ArrowRight, Clock, Landmark, MessageSquare,
  HelpCircle, Scale
} from "lucide-react";
import { theme } from "@/designSystem";
import { apiClient } from "@/lib/apiClient";
import { APIResponse } from "@/lib/api";
import { toast } from "sonner";

const NGOReview = () => {
  const [farmers, setFarmers] = useState<any[]>([]);
  const [scans, setScans] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"farmers" | "pesticides" | "requests">("requests");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fRes, sRes, rRes] = await Promise.all([
        apiClient.get<APIResponse<any[]>>("/ngo/farmers?filter_status=needs_manual_review"),
        apiClient.get<APIResponse<any[]>>("/ngo/pending-scans"),
        apiClient.get<APIResponse<any[]>>("/requests/ngo/all")
      ]);
      
      if (fRes.data.status === "success") setFarmers(fRes.data.data);
      if (sRes.data.status === "success") setScans(sRes.data.data);
      if (rRes.data.status === "success") setRequests(rRes.data.data);
    } catch (e) {
      toast.error("Failed to fetch review queues");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerifyFarmer = async (farmerId: string, action: "approve" | "reject") => {
    try {
      await apiClient.post("/ngo/verify", {
        farmer_id: farmerId,
        action,
        notes: `Manual NGO Review: ${action.toUpperCase()}`
      });
      toast.success(`Farmer ${action}d`);
      fetchData();
    } catch (e) {
      toast.error("Process failed");
    }
  };

  const handleResolveScan = async (scanId: string, action: "clean" | "fraud") => {
    try {
      await apiClient.post("/ngo/resolve-scan", null, {
        params: { scan_id: scanId, action, notes: `NGO manual resolution as ${action}` }
      });
      toast.success(`Scan marked as ${action}`);
      fetchData();
    } catch (e) {
      toast.error("Scan resolution failed");
    }
  };

  const handleUpdateRequestStatus = async (requestId: string, status: string) => {
    try {
      await apiClient.patch(`/requests/${requestId}`, { 
        status, 
        ngo_notes: `Processed by NGO. Decision: ${status}` 
      });
      toast.success(`Request marked as ${status}`);
      fetchData();
    } catch (e) {
      toast.error("Update failed");
    }
  };

  const getRequestIcon = (type: string) => {
    switch (type) {
      case 'loan': return <Landmark className="w-5 h-5" />;
      case 'pesticide_check': return <ShieldCheck className="w-5 h-5" />;
      case 'legal_aid': return <Scale className="w-5 h-5" />;
      case 'help_ngo': return <HelpCircle className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-20">
      
      {/* ── Header ── */}
      <div className="bg-white p-6 border-b border-[#e5e3d7] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="font-mukta font-black text-3xl text-[#1a1a1a]">Field Intelligence Queue</h1>
          <p className="font-hind text-gray-500 text-sm">Reviewing anomalies and verifying identity records in your sector.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-none border border-[#e5e3d7]">
           <button 
             onClick={() => setActiveTab("requests")}
             className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'requests' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-black'}`}
           >
              Unified Requests ({requests.length})
           </button>
           <button 
             onClick={() => setActiveTab("farmers")}
             className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'farmers' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-black'}`}
           >
              Identity ({farmers.length})
           </button>
           <button 
             onClick={() => setActiveTab("pesticides")}
             className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'pesticides' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-black'}`}
           >
              Pesticides ({scans.length})
           </button>
        </div>
      </div>

      {loading ? (
        <div className="p-20 flex justify-center">
           <div className="w-10 h-10 border-4 border-[#e18b2c] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : activeTab === "requests" ? (
        <div className="space-y-4">
           {requests.length === 0 ? (
             <div className="bg-white p-12 text-center border-2 border-dashed border-[#e5e3d7]">
                <Clock className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="font-mukta font-bold text-gray-400">No pending unified requests.</p>
             </div>
           ) : requests.map(req => (
             <div key={req.id} className="bg-white border border-[#e5e3d7] hover:border-[#408447]/30 transition-all p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                <div className="flex items-center gap-4">
                   <div className={`w-12 h-12 flex items-center justify-center border ${
                     req.request_type === 'loan' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                     req.request_type === 'pesticide_check' ? 'bg-green-50 text-green-600 border-green-100' :
                     'bg-amber-50 text-amber-600 border-amber-100'
                   }`}>
                      {getRequestIcon(req.request_type)}
                   </div>
                   <div>
                      <h3 className="font-bold text-[#1a1a1a] text-lg leading-none mb-1 capitalize">
                        {req.request_type.replace('_', ' ')}
                      </h3>
                      <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                         <span className="flex items-center gap-1 font-hindi text-xs">{req.user_name || "Unknown Farmer"}</span>
                         <span className="w-1 h-1 bg-gray-300 rounded-full" />
                         <span className="flex items-center gap-1 font-mono text-[#3174a1]">{req.id.slice(0,8)}</span>
                      </div>
                   </div>
                </div>

                <div className="flex-1 bg-gray-50 p-3 border-l-2 border-gray-300 min-w-[200px]">
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Farmer Context</p>
                   <p className="text-[11px] font-bold text-[#4a3a2a] leading-tight line-clamp-2 italic">
                     {req.payload?.description || req.payload?.text || "No details provided via assistant."}
                   </p>
                </div>

                <div className="flex gap-2">
                   <button 
                     onClick={() => handleUpdateRequestStatus(req.id, "in_progress")}
                     className="bg-white text-[#3174a1] border border-[#3174a1] px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-colors"
                   >
                      Acknowledge
                   </button>
                   <button 
                     onClick={() => handleUpdateRequestStatus(req.id, "resolved")}
                     className="bg-[#408447] text-white px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-[#2d5d32] transition-colors"
                   >
                      Resolve
                   </button>
                   <button 
                     onClick={() => handleUpdateRequestStatus(req.id, "rejected")}
                     className="bg-white text-[#c82b28] border border-[#c82b28] px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-colors"
                   >
                      Decline
                   </button>
                </div>
             </div>
           ))}
        </div>
      ) : activeTab === "farmers" ? (
        <div className="space-y-4">
           {farmers.length === 0 ? (
             <div className="bg-white p-12 text-center border-2 border-dashed border-[#e5e3d7]">
                <ShieldCheck className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="font-mukta font-bold text-gray-400">Identity queue is clear. No pending reviews.</p>
             </div>
           ) : farmers.map(f => (
             <div key={f.user_id} className="bg-white border border-[#e5e3d7] hover:border-[#408447]/30 transition-all p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 group scale-[0.99] hover:scale-[1]">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-[#f1f8f3] text-[#408447] flex items-center justify-center font-mukta font-black text-xl border border-[#408447]/10">
                      {f.name[0]}
                   </div>
                   <div>
                      <h3 className="font-bold text-[#1a1a1a] text-lg leading-none mb-1">{f.name}</h3>
                      <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                         <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {f.location}</span>
                         <span className="w-1 h-1 bg-gray-300 rounded-full" />
                         <span className="flex items-center gap-1 font-mono text-[#3174a1]">{f.user_id.slice(0,8)}</span>
                      </div>
                   </div>
                </div>

                {/* AI Identity Findings */}
                {f.ai_notes && (
                  <div className="bg-[#fff9f0] border-l-2 border-[#e18b2c] p-2 flex-1">
                     <p className="text-[9px] font-black text-[#e18b2c] uppercase tracking-widest mb-1">AI Detection Log</p>
                     <p className="text-[11px] font-bold text-[#4a3a2a] leading-tight italic">"{f.ai_notes}"</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-4">
                   <div className="px-4 py-2 bg-gray-50 border border-[#e5e3d7] flex items-center gap-3">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-bold text-gray-600">AADHAAR_RECORD</span>
                      <button className="text-[#3174a1] hover:underline"><Eye className="w-4 h-4" /></button>
                   </div>
                   <div className="px-4 py-2 bg-gray-50 border border-[#e5e3d7] flex items-center gap-3">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-bold text-gray-600">LAND_POSSESSION</span>
                      <button className="text-[#3174a1] hover:underline"><Eye className="w-4 h-4" /></button>
                   </div>
                </div>

                <div className="flex gap-2">
                   <button 
                     onClick={() => handleVerifyFarmer(f.user_id, "approve")}
                     className="bg-[#408447] text-white px-6 py-3 text-[11px] font-black uppercase tracking-widest hover:bg-[#2d5d32] transition-colors"
                   >
                      Approve
                   </button>
                   <button 
                     onClick={() => handleVerifyFarmer(f.user_id, "reject")}
                     className="bg-white text-[#c82b28] border border-[#c82b28] px-4 py-3 text-[11px] font-black uppercase tracking-widest hover:bg-[#fdf2f2] transition-colors"
                   >
                      Reject
                   </button>
                </div>
             </div>
           ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {scans.length === 0 ? (
             <div className="col-span-2 bg-white p-12 text-center border-2 border-dashed border-[#e5e3d7]">
                <Activity className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="font-mukta font-bold text-gray-400">Pesticide verification queue is clear.</p>
             </div>
           ) : scans.map(s => (
             <div key={s.id} className="bg-white border-2 border-[#e5e3d7] hover:border-[#e18b2c] transition-all overflow-hidden flex flex-col shadow-sm">
                <div className="p-4 bg-gray-50 border-b border-[#e5e3d7] flex justify-between items-center">
                   <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-[#e18b2c]" />
                      <span className="text-xs font-black uppercase tracking-widest">{s.pesticide_name} Scan</span>
                   </div>
                   <span className="text-[10px] font-bold text-gray-400">CASE_{s.id.slice(0,6).toUpperCase()}</span>
                </div>
                
                <div className="p-5 flex-1">
                   <p className="text-xs text-gray-500 font-bold uppercase mb-4">Farmer: {s.farmer_name} ({s.location})</p>
                   
                   <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="p-3 bg-gray-50 text-center border border-gray-100">
                        <p className="text-[9px] font-bold text-gray-400 uppercase">Bill</p>
                        <p className="text-lg font-mukta font-black text-red-600">₹{s.bill_price}</p>
                      </div>
                      <div className="p-3 bg-gray-50 text-center border border-gray-100">
                        <p className="text-[9px] font-bold text-gray-400 uppercase">MRP</p>
                        <p className="text-lg font-mukta font-black text-gray-800">₹{s.extracted_mrp}</p>
                      </div>
                      <div className="p-3 bg-black text-center border border-black flex flex-col justify-center">
                        <p className="text-[9px] font-black text-[#e18b2c] uppercase">Delta</p>
                        <p className="text-sm font-bold text-white">+{Math.round(((s.bill_price - s.extracted_mrp)/s.extracted_mrp)*100)}%</p>
                      </div>
                   </div>

                   {s.ai_findings && (
                     <div className="mb-4 p-3 bg-red-50 border-l-2 border-red-500 italic text-xs font-hind font-bold text-red-900">
                        "{s.ai_findings}"
                     </div>
                   )}
                </div>

                <div className="p-4 bg-gray-50 border-t border-[#e5e3d7] flex gap-2">
                   <button 
                     onClick={() => handleResolveScan(s.id, "fraud")}
                     className="flex-1 bg-[#c82b28] text-white py-3 text-[10px] font-black uppercase tracking-widest hover:bg-[#8f1e1c] transition-colors"
                   >
                      Confirm Fraud
                   </button>
                   <button 
                     onClick={() => handleResolveScan(s.id, "clean")}
                     className="flex-1 bg-white text-gray-600 border border-[#e5e3d7] py-3 text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-colors"
                   >
                      Mark Clean
                   </button>
                </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
};

export default NGOReview;
