import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { 
  Users, GraduationCap, Building2, TrendingUp, 
  Loader2, Zap, RefreshCw, Activity, BarChart3, Shield
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

// --- UPGRADED GLASSMORPHIC TOOLTIP ---
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/50 p-5 rounded-2xl shadow-2xl">
        <p className="text-white font-black text-sm mb-1">{data.name}</p>
        <p className="text-blue-400 font-bold text-[10px] uppercase tracking-widest mb-4">Department Analytics</p>
        <div className="flex items-center justify-between gap-8">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Attendance</p>
            <p className="text-2xl font-black text-white">{data.attendance}%</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Students</p>
            <p className="text-2xl font-black text-white">{data.students}</p>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activityLogs, setActivityLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchActivityLogs();
    fetchAdminStats();
  }, []);

  const fetchActivityLogs = async () => {
    try {
      const response = await axios.get("https://sams-zsar.onrender.com/admin/activity-logs", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActivityLogs(response.data);
    } catch (error) {
      console.error("Failed to fetch activity logs:", error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Just now";
    const diff = new Date() - new Date(dateString);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const fetchAdminStats = async () => {
    try {
      const response = await axios.get("https://sams-zsar.onrender.com/admin/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data);
    } catch (err) {
      setError("Unable to connect to the Control Center.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4 text-slate-500">
      <Loader2 className="animate-spin text-blue-600" size={48} />
      <p className="font-black animate-pulse tracking-[0.2em] text-xs uppercase">Syncing Control Center...</p>
    </div>
  );

  const stats = [
    { label: "Total Students", value: data?.total_students || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50", shadow: "shadow-blue-500/20" },
    { label: "Total Faculty", value: data?.total_faculty || 0, icon: GraduationCap, color: "text-purple-600", bg: "bg-purple-50", shadow: "shadow-purple-500/20" },
    { label: "Departments", value: data?.total_departments || 0, icon: Building2, color: "text-orange-600", bg: "bg-orange-50", shadow: "shadow-orange-500/20" },
    { label: "Global Attendance", value: `${data?.global_attendance || 0}%`, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50", shadow: "shadow-green-500/20" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10 animate-in fade-in duration-700 pb-12 pt-6 px-4 sm:px-6 lg:px-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Shield size={18} className="text-blue-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Command & Oversight Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">University Control Center</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        
        {/* LEFT COLUMN: Stats & Graph (8 cols) */}
        <div className="lg:col-span-8 space-y-6 sm:space-y-8">
          
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
            {stats.map((stat, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                key={stat.label} 
                className="group rounded-3xl sm:rounded-[2rem] border border-slate-100 bg-white p-5 sm:p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 hover:border-blue-100 flex flex-col justify-between"
              >
                <div className={`mb-4 sm:mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 shadow-sm ${stat.shadow}`}>
                  <stat.icon size={26} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Department Analytics Graph */}
          <div className="rounded-3xl sm:rounded-[2.5rem] border border-slate-100 bg-white shadow-sm overflow-hidden p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <BarChart3 className="text-blue-600" /> Department Analytics
                </h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                  Overall Attendance by Department
                </p>
              </div>
              <button 
                onClick={fetchAdminStats} 
                className="flex items-center justify-center sm:justify-start gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors bg-slate-50 hover:bg-blue-50 px-4 py-2.5 rounded-xl border border-slate-100 active:scale-95"
              >
                <RefreshCw size={14} /> Refresh Data
              </button>
            </div>
            
            <div className="h-[300px] sm:h-[350px] w-full mt-6">
              {data?.department_stats?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={data.department_stats} 
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                    barSize={40}
                  >
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#64748b', fontWeight: 800 }} 
                      dy={10} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#64748b', fontWeight: 800 }} 
                      dx={-10}
                      domain={[0, 100]}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="attendance" radius={[8, 8, 8, 8]}>
                      {data.department_stats.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.attendance >= 75 ? '#3b82f6' : entry.attendance >= 60 ? '#f59e0b' : '#ef4444'} 
                          className="transition-all hover:opacity-80 cursor-pointer"
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-slate-300">
                  <BarChart3 size={48} className="mb-4 opacity-20" />
                  <p className="font-black uppercase tracking-widest text-xs">No department data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: System Pulse (4 cols) */}
        <div className="lg:col-span-4 space-y-6 sm:space-y-8">
          <div className="bg-white p-6 sm:p-8 rounded-3xl sm:rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col h-[500px] sm:h-full lg:min-h-[600px] relative overflow-hidden">
            
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-[50px] rounded-full pointer-events-none"></div>

            <div className="flex items-center justify-between mb-8 relative z-10">
              <h3 className="font-black text-slate-900 text-xl tracking-tight flex items-center gap-2">
                <Activity className="text-green-500" /> System Pulse
              </h3>
              <div className="flex h-3 w-3 items-center justify-center bg-green-50 rounded-full">
                <span className="absolute inline-flex h-2.5 w-2.5 animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500"></span>
              </div>
            </div>
            
            <div className="space-y-0 flex-1 overflow-y-auto custom-scrollbar pr-2 relative z-10">
              
              {loadingLogs ? (
                <div className="flex flex-col justify-center items-center h-full pb-10 gap-3">
                  <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fetching Logs...</p>
                </div>
              ) : activityLogs.length === 0 ? (
                <div className="flex justify-center items-center h-full pb-10 text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No recent activity.</p>
                </div>
              ) : (
                <div className="relative border-l-2 border-slate-100 ml-4 pl-6 space-y-6 pb-4">
                  {activityLogs.map((log) => (
                    <motion.div 
                      whileHover={{ x: 4 }} 
                      key={log.id} 
                      className="relative cursor-pointer group transition-all"
                    >
                      {/* Timeline Dot */}
                      <span className="absolute -left-[35px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white border-2 border-slate-200 group-hover:border-blue-500 transition-colors">
                        <span className={`h-1.5 w-1.5 rounded-full ${log.type === 'auth' ? 'bg-slate-400 group-hover:bg-blue-500' : 'bg-green-400 group-hover:bg-green-500'}`}></span>
                      </span>

                      <div className="flex flex-col min-w-0 bg-slate-50 hover:bg-blue-50/50 p-4 rounded-2xl border border-transparent hover:border-blue-100 transition-colors">
                        <div className="flex items-start justify-between mb-1 gap-2">
                          <p className="text-xs font-black text-slate-900 truncate">{log.user}</p>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap pt-0.5">
                            {formatTimeAgo(log.time)}
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-500 leading-snug">{log.action}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={() => navigate("/dashboard/logs")}
              className="mt-6 w-full rounded-2xl border-2 border-dashed border-slate-200 py-4 text-[10px] font-black text-slate-400 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-all uppercase tracking-[0.2em] relative z-10 bg-white"
            >
              View Full Audit Log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}