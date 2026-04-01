import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Check, X, Clock, Loader2, Building2, 
  UserCircle, ShieldAlert, CheckCircle2, XCircle 
} from "lucide-react";

export default function PendingApprovals() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/admin/approvals/pending", { headers });
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to fetch approvals");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (userId, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this request?`)) return;
    
    setProcessingId(userId);
    try {
      if (action === "approve") {
        await axios.put(`http://127.0.0.1:8000/admin/approvals/${userId}/approve`, {}, { headers });
      } else {
        await axios.delete(`http://127.0.0.1:8000/admin/approvals/${userId}/reject`, { headers });
      }
      // Remove the processed user from the list
      setRequests(requests.filter(req => req.user_id !== userId));
    } catch (err) {
      alert(`Failed to ${action} user.`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-12 pt-6 px-4 sm:px-6 lg:px-8">
      
      {/* HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-orange-500 mb-2">
            <ShieldAlert size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Access Control</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Pending Approvals</h1>
          <p className="text-sm font-bold text-slate-500 mt-1">Review guest access requests for workshops and events.</p>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main>
        {loading ? (
          <div className="bg-white rounded-[3rem] border border-slate-100 h-[400px] flex flex-col items-center justify-center shadow-sm">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fetching Requests...</p>
          </div>
        ) : requests.length === 0 ? (
          /* EMPTY STATE */
          <div className="bg-white rounded-[3rem] border border-slate-100 py-32 text-center shadow-sm flex flex-col items-center justify-center">
            <div className="h-24 w-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 size={48} className="text-green-500" strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">You're all caught up!</h3>
            <p className="font-bold text-slate-400 text-sm">There are no pending guest requests at the moment.</p>
          </div>
        ) : (
          /* REQUESTS LIST */
          <div className="grid grid-cols-1 gap-4">
            {requests.map((req) => (
              <div 
                key={req.user_id} 
                className="group bg-white p-5 sm:p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                
                {/* User Info */}
                <div className="flex items-start sm:items-center gap-4 sm:gap-6">
                  
                  {/* Status Avatar */}
                  <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100/50 group-hover:bg-orange-100 transition-colors">
                    <div className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-orange-500 border-2 border-white"></span>
                    </div>
                    <Clock size={28} className="text-orange-500" />
                  </div>
                  
                  {/* Details */}
                  <div className="min-w-0">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 truncate mb-1">{req.username}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60">
                        <UserCircle size={12} /> 
                        {req.role === 'external_student' ? 'Guest Student' : 'Guest Speaker'}
                      </span>
                      {req.institution && (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100/50">
                          <Building2 size={12} /> 
                          {req.institution}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 w-full sm:w-auto border-t sm:border-t-0 border-slate-100 pt-5 sm:pt-0 shrink-0">
                  <button 
                    onClick={() => handleAction(req.user_id, "reject")}
                    disabled={processingId === req.user_id}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest text-red-600 bg-red-50 hover:bg-red-600 hover:text-white transition-all active:scale-95 disabled:opacity-50 border border-red-100 hover:border-red-600"
                  >
                    {processingId === req.user_id ? <Loader2 className="animate-spin" size={16} /> : <XCircle size={16} />}
                    <span className="sm:hidden lg:inline">Reject</span>
                  </button>
                  <button 
                    onClick={() => handleAction(req.user_id, "approve")}
                    disabled={processingId === req.user_id}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest text-white bg-slate-900 hover:bg-blue-600 shadow-md hover:shadow-xl transition-all active:scale-95 disabled:opacity-50"
                  >
                    {processingId === req.user_id ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} strokeWidth={3} />}
                    Approve
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}