import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Users, Clock, MapPin, StopCircle, RefreshCcw, 
  CheckCircle, ShieldCheck, QrCode, Wifi, Loader2 
} from "lucide-react";

export default function LiveAttendance() {
  const [isActive, setIsActive] = useState(false);
  const [sessionCode, setSessionCode] = useState("");
  const [presentStudents, setPresentStudents] = useState([]);
  const [stats, setStats] = useState({ present: 0, total: 60 });
  const [loading, setLoading] = useState(false);

  // Poll for new check-ins every 5 seconds if session is active
  useEffect(() => {
    let interval;
    if (isActive) {
      interval = setInterval(() => {
        fetchLiveCheckIns();
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const fetchLiveCheckIns = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/attendance/live-stream");
      setPresentStudents(res.data.students);
      setStats(prev => ({ ...prev, present: res.data.students.length }));
    } catch (err) {
      console.error("Failed to poll check-ins", err);
    }
  };

  const startSession = async () => {
    setLoading(true);
    // In a real app, this sends GPS coords + CourseID to backend
    setTimeout(() => {
      setSessionCode(Math.floor(100000 + Math.random() * 900000).toString());
      setIsActive(true);
      setLoading(false);
    }, 1500);
  };

  const stopSession = () => {
    setIsActive(false);
    setSessionCode("");
    // Finalize the session in the DB here
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Live Session Monitor</h1>
          <p className="text-slate-500">Course: CS-402 Operating Systems • Hall 4B</p>
        </div>
        <div className="flex items-center gap-3">
          {isActive && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-xs font-black uppercase tracking-widest animate-pulse">
              <Wifi size={14} /> Live
            </div>
          )}
          <span className="text-sm font-bold text-slate-400">{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Control Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-xl text-center space-y-6">
            {!isActive ? (
              <>
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto">
                  <MapPin size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Initialize Geofence</h3>
                  <p className="text-sm text-slate-500 mt-2">Lock attendance to your current GPS coordinates.</p>
                </div>
                <button 
                  onClick={startSession}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck size={20} />}
                  Open Attendance Gate
                </button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Student Entry Code</p>
                  <p className="text-6xl font-black text-blue-600 tracking-tighter">{sessionCode}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center">
                   <QrCode size={120} className="text-slate-800" />
                   <p className="text-[10px] font-bold text-slate-400 mt-3 uppercase">Scan to fast-track check-in</p>
                </div>
                <button 
                  onClick={stopSession}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-600 transition-colors"
                >
                  <StopCircle size={20} /> End Session
                </button>
              </>
            )}
          </div>

          {/* Real-time Stats */}
          <div className="bg-slate-900 rounded-3xl p-8 text-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-end">
              <p className="text-sm font-bold text-slate-400">Class Filling</p>
              <p className="text-2xl font-black">{Math.round((stats.present / stats.total) * 100)}%</p>
            </div>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-1000 ease-out" 
                style={{ width: `${(stats.present / stats.total) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 text-center">
              <b>{stats.present}</b> students present out of <b>{stats.total}</b> enrolled.
            </p>
          </div>
        </div>

        {/* Right Column: Live Feed */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b flex items-center justify-between bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users size={20} className="text-blue-600" /> 
              Recent Check-ins
            </h3>
            <button className="text-slate-400 hover:text-blue-600 transition-colors">
              <RefreshCcw size={18} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[600px] p-6">
            {!isActive && presentStudents.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 opacity-50">
                <Clock size={48} />
                <p className="font-medium">Waiting for session to start...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {presentStudents.map((student, i) => (
                  <div 
                    key={student.id} 
                    className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 animate-in slide-in-from-right duration-300"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="h-10 w-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">
                      {student.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{student.name}</p>
                      <p className="text-[10px] font-medium text-slate-500">{student.roll_no} • {student.time}</p>
                    </div>
                    <CheckCircle className="text-green-500" size={18} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}