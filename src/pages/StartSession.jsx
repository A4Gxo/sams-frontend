import { useState, useEffect } from "react";
import axios from "axios";
import { 
  MapPin, Play, StopCircle, Loader2, 
  Users, Zap, CheckCircle2, RefreshCw, ChevronDown, ShieldCheck
} from "lucide-react";

export default function StartSession() {
  const [courses, setCourses] = useState([]); 
  const [selectedCourse, setSelectedCourse] = useState(""); 
  const [location, setLocation] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [sessionCode, setSessionCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [checkInCount, setCheckInCount] = useState(0); 

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const res = await axios.get("https://sams-zsar.onrender.com/faculty/dashboard-data", { headers });
        const mySubjects = res.data.subjects || [];
        setCourses(mySubjects);
        if (mySubjects.length > 0) setSelectedCourse(mySubjects[0].id);
      } catch (err) {
        console.error("Failed to fetch assigned courses");
      }
    };
    fetchMyCourses();
  }, []);

  // --- REAL-TIME POLLING LOGIC ---
  useEffect(() => {
    let interval;
    if (isLive && sessionId) {
      const fetchCount = async () => {
        try {
          const res = await axios.get(`https://sams-zsar.onrender.com/attendance/live/${sessionId}`, { headers });
          setCheckInCount(res.data.students.length);
        } catch (err) {
          console.error("Polling failed");
        }
      };
      
      fetchCount(); 
      interval = setInterval(fetchCount, 4000); 
    }
    return () => clearInterval(interval); 
  }, [isLive, sessionId]);

  const startAttendance = async () => {
    if (!selectedCourse) return alert("Select a subject");
    setLoading(true);

    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const payload = { 
          course_id: parseInt(selectedCourse), 
          lat: position.coords.latitude, 
          lng: position.coords.longitude 
        };
        const response = await axios.post("https://sams-zsar.onrender.com/attendance/session/start", payload, { headers });
        
        setSessionCode(response.data.otp_code);
        setSessionId(response.data.session_id);
        setIsLive(true);
      } catch (err) {
        alert("Error: " + (err.response?.data?.detail || "Could not start"));
      } finally {
        setLoading(false);
      }
    }, () => {
      alert("GPS Required");
      setLoading(false);
    });
  };

  const terminateSession = async () => {
    try {
      await axios.post(`https://sams-zsar.onrender.com/attendance/session/terminate/${sessionId}`, {}, { headers });
      setIsLive(false);
      setCheckInCount(0);
    } catch (err) {
      alert("Termination failed");
    }
  };

  return (
    <div className="flex h-full min-h-[80vh] items-center justify-center px-4 py-8 sm:py-12">
      
      <div className="w-full max-w-[500px] relative">
        
        {/* Background ambient blurs */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none hidden sm:block" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none hidden sm:block" />

        <div className="bg-white/90 backdrop-blur-2xl p-8 sm:p-12 rounded-[2.5rem] sm:rounded-[3.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100/60 text-center relative z-10 animate-in slide-in-from-bottom-8 duration-700 fade-in">
          
          {!isLive ? (
            <div className="animate-in fade-in duration-500">
              <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center mb-6 sm:mb-8 shadow-xl shadow-blue-600/30 border border-white/20">
                <MapPin size={36} strokeWidth={2.5} />
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Open GPS Gate</h1>
              <p className="text-sm font-bold text-slate-500 mt-2">Initialize a secure location-based zone.</p>
              
              <div className="mt-8 sm:mt-10 text-left space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Assigned Subject</label>
                <div className="relative group">
                  <select 
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full p-5 sm:p-6 bg-slate-50 border border-slate-200/60 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 rounded-2xl sm:rounded-3xl text-sm sm:text-base font-black text-slate-900 outline-none appearance-none cursor-pointer transition-all shadow-inner"
                  >
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-600 pointer-events-none transition-colors" size={20} strokeWidth={3} />
                </div>
              </div>

              <button 
                onClick={startAttendance}
                disabled={loading || courses.length === 0}
                className="mt-8 sm:mt-10 w-full bg-slate-900 text-white py-5 sm:py-6 rounded-2xl sm:rounded-[2rem] font-black text-xs sm:text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 transition-all active:scale-95 shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_10px_30px_rgba(37,99,235,0.3)] disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? <Loader2 className="animate-spin" size={22} /> : <Play size={20} fill="currentColor" />}
                Launch Session
              </button>
            </div>
          ) : (
            /* --- SESSION LIVE WITH MONITOR --- */
            <div className="animate-in zoom-in-95 duration-500 flex flex-col items-center">
              
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 border border-red-200/60 mb-8 sm:mb-10">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em]">Live Broadcast Active</p>
              </div>

              <div className="w-full mb-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Classroom Access Code</p>
                <div className="flex justify-center gap-2 sm:gap-3">
                  {sessionCode.split('').map((char, i) => (
                      <div key={i} className="h-16 w-12 sm:h-24 sm:w-16 bg-slate-900 text-white rounded-xl sm:rounded-2xl flex items-center justify-center text-3xl sm:text-5xl font-black shadow-xl shadow-slate-900/20 border-b-4 border-slate-700">
                          {char}
                      </div>
                  ))}
                </div>
              </div>

              {/* LIVE MONITOR BADGES */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full mb-8 sm:mb-10">
                 <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50 p-5 sm:p-6 rounded-2xl sm:rounded-[2rem] text-center shadow-sm">
                    <p className="text-[9px] font-black text-green-600 uppercase tracking-widest mb-2">Live Presence</p>
                    <div className="flex items-center justify-center gap-2">
                      <Users size={20} className="text-green-500" />
                      <span className="text-3xl sm:text-4xl font-black text-slate-900">{checkInCount}</span>
                    </div>
                 </div>
                 <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 p-5 sm:p-6 rounded-2xl sm:rounded-[2rem] text-center shadow-sm flex flex-col justify-center">
                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-3">Network Status</p>
                    <div className="flex items-center justify-center gap-2 text-blue-600 bg-white/50 py-1.5 px-3 rounded-lg w-fit mx-auto">
                      <RefreshCw size={14} className="animate-spin" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Syncing</span>
                    </div>
                 </div>
              </div>

              <button 
                  onClick={terminateSession} 
                  className="group w-full bg-red-600 text-white py-5 sm:py-6 rounded-2xl sm:rounded-[2rem] font-black text-xs sm:text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-red-700 shadow-[0_10px_30px_rgba(220,38,38,0.3)] transition-all active:scale-95"
              >
                <StopCircle size={22} className="group-hover:rotate-90 transition-transform" /> 
                Terminate & Save
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}