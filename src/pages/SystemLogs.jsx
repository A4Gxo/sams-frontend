import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Clock, Users, Zap, Search, Filter, 
  ChevronLeft, Loader2, Download 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SystemLogs() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const mockLogs = [
    { id: 1, user: "Sanket M.", action: "Registered as Guest", time: "2026-03-26 09:15:00", type: "auth", detail: "Institution: IITB" },
    { id: 2, user: "Prof. Sharma", action: "Started GPS Session", time: "2026-03-26 09:00:12", type: "session", detail: "Course: CS101" },
    { id: 3, user: "Admin", action: "Approved Chandan", time: "2026-03-26 08:45:00", type: "admin", detail: "Role: Guest Speaker" },
    { id: 4, user: "System", action: "Database Backup", time: "2026-03-26 00:00:01", type: "system", detail: "Automated Task" },
  ];

  useEffect(() => {
    setTimeout(() => {
      setLogs(mockLogs);
      setLoading(false);
    }, 800);
  }, []);

  // --- CSV EXPORT LOGIC ---
  const exportToCSV = () => {
    if (logs.length === 0) return alert("No logs available to export.");

    const headers = ["Event ID", "User", "Action", "Details", "Timestamp", "Category"];
    
    const rows = logs.map(log => [
      log.id,
      `"${log.user}"`, 
      `"${log.action}"`,
      `"${log.detail}"`,
      log.time,
      log.type
    ]);

    const csvContent = [
      headers.join(","), 
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    link.setAttribute("href", url);
    link.setAttribute("download", `SAMS_Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = logs.filter(log => 
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Audit Logs</h1>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-1">Immutable Activity History</p>
          </div>
        </div>
        
        {/* Export Button hooked to logic */}
        <button 
          onClick={exportToCSV}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs shadow-xl active:scale-95 hover:bg-blue-600 transition-all"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by user or action..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all bg-white font-bold text-sm outline-none"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm text-slate-600 hover:bg-slate-50 transition-all">
          <Filter size={18} /> Filters
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <tr>
              <th className="px-10 py-6">Event Type</th>
              <th className="px-10 py-6">User / Actor</th>
              <th className="px-10 py-6">Action Details</th>
              <th className="px-10 py-6 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-10 py-6">
                  <div className={`flex items-center justify-center h-10 w-10 rounded-xl ${
                    log.type === 'auth' ? 'bg-blue-50 text-blue-600' : 
                    log.type === 'session' ? 'bg-amber-50 text-amber-600' : 
                    log.type === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-slate-50 text-slate-500'
                  }`}>
                    {log.type === 'auth' ? <Users size={18}/> : log.type === 'session' ? <Zap size={18}/> : <Clock size={18}/>}
                  </div>
                </td>
                <td className="px-10 py-6 font-black text-slate-900">{log.user}</td>
                <td className="px-10 py-6">
                  <p className="text-sm font-bold text-slate-700">{log.action}</p>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">{log.detail}</p>
                </td>
                <td className="px-10 py-6 text-right font-mono text-xs font-bold text-slate-400">
                  {log.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}