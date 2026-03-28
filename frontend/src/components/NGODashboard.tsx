import { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";
import { theme } from "@/designSystem";
import { CheckCircle2, XCircle, Users, FileText, Loader2, AlertTriangle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function NGODashboard() {
  const [farmers, setFarmers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fRes, rRes] = await Promise.all([
        apiClient.get("/ngo/farmers"),
        apiClient.get("/ngo/help-requests")
      ]);
      setFarmers(fRes.data.data);
      setRequests(rRes.data.data);
    } catch(e) {
      console.error(e);
      toast.error("Failed to load NGO data");
    } finally {
      setLoading(false);
    }
  };

  const verifyFarmer = async (farmerId: string, action: "approve" | "reject") => {
    try {
      await apiClient.post("/ngo/verify", {
        farmer_id: farmerId,
        action,
        notes: "Verified via NGO Dashboard"
      });
      toast.success(`Farmer ${action}d successfully`);
      fetchData(); // Refresh list
    } catch (e) {
      console.error(e);
      toast.error("Failed to verify farmer");
    }
  };

  const updateRequest = async (requestId: string, status: "in_progress" | "resolved") => {
    try {
      await apiClient.post("/ngo/help-update", {
        request_id: requestId,
        status,
        notes: "Updated by NGO"
      });
      toast.success(`Request marked as ${status}`);
      fetchData();
    } catch (e) {
      console.error(e);
      toast.error("Failed to update request");
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 p-6 bg-[#fbfaf5] min-h-screen">
      <div className="border-b border-[#e5e3d7] pb-6 mt-8">
        <h2 className="font-mukta font-black text-4xl text-[#e18b2c] flex items-center gap-3 tracking-tight">
          <Users className="w-8 h-8" /> NGO Operations Center
        </h2>
        <p className="font-hind text-gray-500 text-lg mt-2">Manage farmer verifications and incoming distress signals across your coverage area.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-[#e18b2c]" /></div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-10">
          
          {/* Farmers Column */}
          <div className="space-y-5">
            <h3 className="font-mukta font-bold text-xl text-gray-800 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-600" /> Pending KYC Review
            </h3>
            {farmers.length === 0 ? (
              <div className="bg-white border p-8 text-center text-gray-400 font-bold border-dashed">No farmers pending verification.</div>
            ) : (
              <div className="space-y-4">
                {farmers.map((f, i) => (
                  <div key={i} className="bg-white border border-[#e5e3d7] p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-green-50 to-transparent pointer-events-none" />
                    
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs uppercase font-bold tracking-widest text-[#666666]">Farmer ID</p>
                        <p className="font-mono text-sm text-gray-800 bg-gray-100 px-2 py-0.5 mt-1 border border-gray-200">{f.user_id}</p>
                      </div>
                      <span className="bg-yellow-100 text-yellow-800 text-[10px] uppercase font-bold tracking-wider px-2 py-1">Needs Review</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-5 p-3 bg-[#fbfaf5] border border-[#e5e3d7]">
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase">Phone</p>
                        <p className="font-bold text-gray-700">{f.phone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase">Documents</p>
                        <p className="font-bold text-gray-700">{f.document_count} files attached</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button onClick={() => verifyFarmer(f.user_id, "reject")} className="flex-1 bg-white border-2 border-red-200 text-red-600 font-bold py-2 hover:bg-red-50 flex items-center justify-center gap-1 active:scale-95 transition-all">
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                      <button onClick={() => verifyFarmer(f.user_id, "approve")} className="flex-1 bg-green-600 text-white font-bold py-2 shadow-md shadow-green-600/20 hover:bg-green-700 flex items-center justify-center gap-1 active:scale-95 transition-all">
                        <CheckCircle2 className="w-4 h-4" /> Approve KYC
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Help Requests Column */}
          <div className="space-y-5">
            <h3 className="font-mukta font-bold text-xl text-gray-800 uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" /> Active Distress Signals
            </h3>
            {requests.length === 0 ? (
              <div className="bg-white border p-8 text-center text-gray-400 font-bold border-dashed">No open help requests in queue.</div>
            ) : (
              <div className="space-y-4">
                {requests.map((r, i) => (
                  <div key={i} className="bg-white border border-[#e5e3d7] p-5 shadow-sm border-l-4 border-l-[#e18b2c] hover:shadow-md transition-shadow">
                    
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-none bg-orange-100 text-orange-600 flex items-center justify-center border border-orange-200">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold uppercase tracking-wider text-xs text-[#e18b2c]">{r.request_type} Category</p>
                          <p className="text-xs text-gray-500">{new Date(r.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 ${r.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                        {r.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="p-4 bg-[#fbfaf5] border border-[#e5e3d7] mb-5">
                      <p className="font-hind text-gray-800 font-bold text-sm leading-relaxed">
                        "{r.description}"
                      </p>
                    </div>

                    <div className="flex gap-3">
                      {r.status === "open" && (
                        <button onClick={() => updateRequest(r.id, "in_progress")} className="flex-1 bg-[#3174a1] text-white py-2 font-bold text-sm hover:bg-[#1b435e] shadow-md shadow-blue-900/10 active:scale-95 transition-all">
                          Acknowledge & Start
                        </button>
                      )}
                      <button onClick={() => updateRequest(r.id, "resolved")} className="flex-1 bg-white border-2 border-green-500 text-green-700 py-2 font-bold text-sm hover:bg-green-50 active:scale-95 transition-all">
                        Mark Resolved
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
