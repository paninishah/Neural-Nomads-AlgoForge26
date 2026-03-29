import { useState, useEffect, useCallback } from "react";
import { ngoApi, profileApi, requestApi } from "@/api/client";
import { CheckCircle2, XCircle, Users, FileText, Loader2, AlertTriangle, ShieldCheck, MapPin, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

function RequestCard({ request, onUpdate, accentColor }: { request: any; onUpdate: any; accentColor: string }) {
  const r = request;
  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`bg-white border border-[#e5e3d7] p-5 shadow-sm border-l-4 hover:shadow-md transition-shadow ${accentColor}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-black uppercase tracking-wider text-[10px] text-gray-400">
             Case ID: {r.id.slice(0, 8)}
          </p>
          <p className="text-[10px] font-bold text-gray-400 mt-1">
            {new Date(r.created_at).toLocaleString()}
          </p>
        </div>
        <span className={`text-[10px] uppercase font-black tracking-wider px-2 py-0.5 ${r.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
          r.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}>
          {r.status.replace("_", " ")}
        </span>
      </div>

      <div className="p-3 bg-[#fbfaf5] border border-gray-100 mb-4 italic text-sm text-gray-600 leading-tight">
        "{r.description || r.request_type.replace('_', ' ')}"
        {r.payload?.trust_score && <p className="mt-2 not-italic font-black text-xs text-black">Trust Score: {r.payload.trust_score}%</p>}
      </div>

      <div className="flex gap-2">
        {r.status === "pending" && (
          <button onClick={() => onUpdate(r.id, "in_progress")} className="flex-1 bg-[#1a1a1a] text-white py-2 text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
            Acknowledge
          </button>
        )}
        {r.status !== "resolved" && (
          <button onClick={() => onUpdate(r.id, "resolved")} className="flex-1 border-2 border-[#1a1a1a] text-[#1a1a1a] py-2 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">
            Resolve
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function NGODashboard() {
  const [farmers, setFarmers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [ngoProfile, setNgoProfile] = useState<any>(null);

  const userId = localStorage.getItem("annadata_user_id");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [fRes, rRes, sRes] = await Promise.all([
        ngoApi.getFarmers("needs_manual_review"),
        requestApi.getAllRequests(),
        ngoApi.getStats()
      ]);

      setFarmers(fRes.data.data || []);
      setRequests(rRes.data.data || []);
      setStats(sRes.data.data || null);

      if (userId) {
        const pRes = await profileApi.getProfile(userId);
        setNgoProfile(pRes.data.data);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load NGO operations data");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();

    // 30-second live polling as requested for "real-time" dashboard
    const pollId = setInterval(fetchData, 30000);

    // Request Browser Location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn("Location access denied", err)
      );
    }

    return () => clearInterval(pollId);
  }, [fetchData]);

  const verifyFarmer = async (farmerId: string, action: "approve" | "reject") => {
    try {
      await ngoApi.verifyFarmer({
        farmer_id: farmerId,
        action,
        notes: "Verified via NGO Operations Center"
      });
      toast.success(`Farmer ${action === 'approve' ? 'verified' : 'rejected'} successfully`);
      fetchData();
    } catch (e) {
      toast.error("Verification update failed");
    }
  };

  const updateRequest = async (requestId: string, status: "in_progress" | "resolved") => {
    try {
      await requestApi.updateStatus(requestId, {
        status,
        ngo_notes: "Updated by NGO Staff"
      });
      toast.success(`Request marked as ${status.replace('_', ' ')}`);
      fetchData();
    } catch (e) {
      toast.error("Request update failed");
    }
  };

  // Farmer Grouping Logic
  const filteredFarmers = farmers.filter(f =>
    f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.phone?.includes(searchTerm)
  );

  const nearbyFarmers = filteredFarmers.filter(f => f.district === ngoProfile?.district);
  const otherFarmers = filteredFarmers.filter(f => f.district !== ngoProfile?.district);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 p-6 bg-[#fbfaf5] min-h-screen pb-24">

      {/* ── Header & Stats ── */}
      <div className="bg-white border border-[#e5e3d7] p-8 mt-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#e18b2c]/5 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <h2 className="font-mukta font-black text-4xl text-[#1a1a1a] flex items-center gap-3 tracking-tight">
              <Users className="w-10 h-10 text-[#e18b2c]" />
              Operations Center
            </h2>
            <p className="font-hind text-gray-500 text-lg mt-1">
              Active Session: <span className="font-bold text-gray-700">{ngoProfile?.organization_name || "NGO"}</span>
              {location && <span className="ml-4 text-xs bg-green-100 text-green-700 px-2 py-0.5 font-bold rounded-full">LIVE LOCATION ACTIVE</span>}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Pending KYC", val: stats?.pending_kyc || 0, color: "text-[#e18b2c]" },
              { label: "Open Requests", val: stats?.open_requests || 0, color: "text-blue-600" },
              { label: "Fraud Scans", val: stats?.pending_scans || 0, color: "text-red-600" },
              { label: "Verified Today", val: 12, color: "text-green-600" },
            ].map((s, i) => (
              <div key={i} className="bg-[#fbfaf5] border border-[#e5e3d7] p-4 min-w-[120px]">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{s.label}</p>
                <p className={`text-2xl font-mukta font-black ${s.color}`}>{s.val}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#e18b2c]" />
          <p className="font-bold text-gray-400 uppercase tracking-widest text-xs animate-pulse">Synchronizing Global Grid...</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">

          {/* ── Left: Main Farmer Verification Queue ── */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-mukta font-black text-2xl text-[#1a1a1a] uppercase tracking-tight flex items-center gap-2">
                KYC Verification Queue
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or phone..."
                  className="pl-9 pr-4 py-2 border border-[#e5e3d7] bg-white text-xs font-bold focus:border-[#e18b2c] outline-none transition-all w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* NEARBY SECTION */}
            {nearbyFarmers.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-4 py-1.5 bg-green-50 border-l-4 border-green-500">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-black uppercase text-green-700 tracking-widest">Nearby Farmers (Your District: {ngoProfile?.district})</span>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {nearbyFarmers.map((f, i) => <FarmerCard key={i} farmer={f} onVerify={verifyFarmer} />)}
                </div>
              </div>
            )}

            {/* GENERAL QUEUE */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-100 border-l-4 border-gray-400">
                <Filter className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-black uppercase text-gray-700 tracking-widest">General verification list</span>
              </div>
              {otherFarmers.length === 0 && nearbyFarmers.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-[#e5e3d7] p-20 text-center text-gray-300 font-bold uppercase italic tracking-widest">
                  No pending verifications found.
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {otherFarmers.map((f, i) => <FarmerCard key={i} farmer={f} onVerify={verifyFarmer} />)}
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Real-time Intel (Legal & Identity) ── */}
          <div className="space-y-10">
            
            {/* 1. LEGAL AID QUEUE */}
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-mukta font-black text-xl text-[#1a1a1a] uppercase tracking-tight flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" /> Legal Aid Queue
                </h3>
                <span className="text-[10px] font-black text-blue-600 px-2 py-0.5 bg-blue-50 border border-blue-100">REAL-TIME</span>
              </div>
              
              <div className="space-y-3">
                {requests.filter(r => r.request_type === 'legal_aid').length === 0 ? (
                  <div className="bg-white border border-dashed border-gray-200 p-8 text-center text-gray-300 text-xs font-bold uppercase">No pending legal cases</div>
                ) : (
                  requests.filter(r => r.request_type === 'legal_aid').slice(0, 5).map((r, i) => (
                    <RequestCard key={r.id} request={r} onUpdate={updateRequest} accentColor="border-l-blue-500" />
                  ))
                )}
              </div>
            </section>

            {/* 2. IDENTITY VERIFICATION ALERTS */}
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-mukta font-black text-xl text-[#1a1a1a] uppercase tracking-tight flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#408447]" /> Identity Checks
                </h3>
                <span className="text-[10px] font-black text-green-600 px-2 py-0.5 bg-green-50 border border-green-100">LIVE FEED</span>
              </div>
              
              <div className="space-y-3">
                {requests.filter(r => r.request_type === 'identity_verification').length === 0 ? (
                  <div className="bg-white border border-dashed border-gray-200 p-8 text-center text-gray-300 text-xs font-bold uppercase">No recent identity verifications</div>
                ) : (
                  requests.filter(r => r.request_type === 'identity_verification').slice(0, 5).map((r, i) => (
                    <RequestCard key={r.id} request={r} onUpdate={updateRequest} accentColor="border-l-green-500" />
                  ))
                )}
              </div>
            </section>

            {/* 3. FRAUD REPORTS (PESTICIDES) */}
            <section className="space-y-4">
               <h3 className="font-mukta font-black text-xl text-[#1a1a1a] uppercase tracking-tight flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" /> Intel & Fraud Logs
               </h3>
               <div className="space-y-3">
                {requests.filter(r => r.request_type === 'fraud_report').slice(0, 3).map((r, i) => (
                  <RequestCard key={r.id} request={r} onUpdate={updateRequest} accentColor="border-l-red-500" />
                ))}
              </div>
            </section>

          </div>

        </div>
      )}
    </div>
  );
}

function FarmerCard({ farmer, onVerify }: { farmer: any; onVerify: any }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white border border-[#e5e3d7] p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between h-full"
    >
      <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-gray-50 to-transparent pointer-events-none" />

      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#fbfaf5] border border-[#e5e3d7] flex items-center justify-center">
              <Users className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <p className="font-mukta font-black text-lg text-gray-800 leading-none">{farmer.name || farmer.phone}</p>
              <p className="text-[10px] uppercase font-black tracking-widest text-[#e18b2c] mt-1">{farmer.district || "-"}, {farmer.state || "-"}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Identity verified</span>
            <span className={farmer.phone_verified ? "text-green-600 font-black" : "text-amber-500 font-black"}>
              {farmer.phone_verified ? "YES" : "NO"}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Trust Score Prediction</span>
            <span className="font-mono bg-gray-50 px-2 border border-gray-100 text-[#13311c] font-black tracking-tighter italic">N/A</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => onVerify(farmer.user_id, "reject")} className="flex-1 bg-white border border-red-200 text-red-600 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all">
          X Reject
        </button>
        <button onClick={() => onVerify(farmer.user_id, "approve")} className="flex-1 bg-[#408447] text-white py-2 text-[10px] font-black uppercase tracking-widest hover:bg-[#2a5a2f] shadow-lg shadow-green-900/10 transition-all">
          ✓ Verify
        </button>
      </div>
    </motion.div>
  );
}
