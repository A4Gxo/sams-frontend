import { useState, useEffect } from "react";
import axios from "axios";
import { 
  MapPin, ShieldCheck, Loader2, AlertCircle, 
  CheckCircle2, Navigation, BookOpen, ChevronLeft, ChevronDown 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CheckIn() {
  const navigate = useNavigate();
  
  // --- STATE MANAGEMENT ---
  const [activeSessions, setActiveSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null); 
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState("loading"); // loading, idle, verifying, success, error
  const [errorMsg, setErrorMsg] = useState("");
  const [coords, setCoords] = useState(null);

  // --- AUTH CONSTANTS ---
  const token = localStorage.getItem("token");
  const studentId = localStorage.getItem("studentId"); 
  const headers = { Authorization: `Bearer ${token}` };

  // --- 1. INITIAL GPS FETCH ---
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => {
            setErrorMsg("GPS ACCESS DENIED. PLEASE ENABLE LOCATION.");
            setStatus("error");
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setErrorMsg("BROWSER DOES NOT SUPPORT GPS.");
      setStatus("error");
    }
  }, []);

  // --- 2. DYNAMIC SESSION POLLING (Every 5 Seconds) ---
  useEffect(() => {
    const fetchLiveSessions = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await axios.get(`http://127.0.0.1:8000/students/dashboard-data`, { headers });
        
        if (res.data.live_sessions && res.data.live_sessions.length > 0) {
          const sessions = res.data.live_sessions.map(s => ({
            session_id: s.session_id || s.id || s.course_id ,
            course_name: s.subject || s.course_name || "Unknown Class",
            course_code: s.code || "LIVE"
          }));
          
          setActiveSessions(sessions);
          setSelectedSession(prev => prev || sessions[0]);
          
          if (status === "loading") setStatus("idle");
          setErrorMsg(""); 
        } else {
          setActiveSessions([]);
          setSelectedSession(null);
          setStatus("error");
          setErrorMsg("NO ACTIVE CLASSES FOUND. WAIT FOR PROFESSOR.");
        }
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setStatus("error");
          setErrorMsg("FAILED TO SYNC WITH SERVER.");
        }
      }
    };

    fetchLiveSessions(); 
    const interval = setInterval(fetchLiveSessions, 5000); 
    
    return () => clearInterval(interval); 
  }, [token, navigate, status]);

  // --- 3. VERIFICATION LOGIC ---
  const handleCheckIn = async (e) => {
    e.preventDefault();
    
    const sId = Number(localStorage.getItem("studentId"));
    const sessId = selectedSession?.session_id || Number(document.getElementById("sessionSelect")?.value);
    const otpVal = Number(otp.toString().replace(/\s/g, ''));

    if (!sId || !sessId || isNaN(otpVal) || !coords) {
      setErrorMsg("INVALID DATA. PLEASE SELECT CLASS AND ENTER OTP.");
      return;
    }

    setStatus("verifying");
    setErrorMsg("");

    try {
      const payload = { session_id: sessId, student_id: sId, otp_code: otpVal, lat: coords.lat, lng: coords.lng };
      await axios.post("http://127.0.0.1:8000/attendance/verify", payload, { headers });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setErrorMsg(`${detail[0].loc[1].toUpperCase()}: ${detail[0].msg.toUpperCase()}`);
      } else {
        setErrorMsg(detail?.toUpperCase() || "CHECK-IN FAILED. WRONG OTP OR TOO FAR.");
      }
    }
  };

  // --- SUCCESS VIEW ---
  if (status === "success") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] border border-slate-100 p-8 sm:p-12 shadow-2xl text-center space-y-8 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-green-400/20 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-green-50 text-green-500 ring-[12px] ring-green-50/50 shadow-inner">
            <CheckCircle2 size={56} className="animate-[bounce_2s_ease-in-out_infinite]" strokeWidth={2.5} />
          </div>
          
          <div className="space-y-3 relative z-10">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Verified!</h2>
            <p className="text-slate-500 font-medium">
              Attendance logged successfully for <br/>
              <span className="font-black text-slate-900 mt-1 block text-lg">{selectedSession?.course_name}</span>
            </p>
          </div>
          
          <button 
            onClick={() => navigate("/dashboard")}
            className="w-full bg-slate-900 text-white py-4 sm:py-5 rounded-2xl text-sm font-black transition-all hover:bg-blue-600 active:scale-95 shadow-lg shadow-slate-200 uppercase tracking-widest mt-4"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // --- MAIN FORM VIEW ---
  return (
    <div className="flex h-full min-h-[80vh] items-center justify-center px-4 py-8 sm:py-12">
      
      <div className="w-full max-w-[440px] relative">
        
        {/* Decorative background blurs (matches login page feel) */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none hidden sm:block" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none hidden sm:block" />

        <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] border border-slate-200/60 p-6 sm:p-10 shadow-2xl relative z-10 animate-in slide-in-from-bottom-8 duration-700 fade-in">
          
          <button 
            onClick={() => navigate("/dashboard")} 
            className="group mb-8 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors bg-slate-50 px-4 py-2 rounded-xl w-fit"
          >
              <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" /> Dashboard
          </button>

          <div className="text-center mb-10 relative">
            
            {/* Radar Ping Effect behind the icon */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-20 bg-blue-500/20 rounded-full animate-ping pointer-events-none" />
            
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-600/30 mb-6 border border-white/20">
              <Navigation size={32} strokeWidth={2.5} />
            </div>
            
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Check-In</h1>
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Geofencing Active</p>
            </div>
          </div>

          <form onSubmit={handleCheckIn} className="space-y-6">
            
            {/* Class Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Current Class</label>
              <div className="relative group">
                <BookOpen className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 z-10 group-focus-within:text-blue-600 transition-colors" size={20} />
                <select 
                  id="sessionSelect"
                  value={selectedSession?.session_id || ""}
                  onChange={(e) => {
                      const session = activeSessions.find(s => s.session_id.toString() === e.target.value);
                      setSelectedSession(session);
                    }}
                  className="w-full pl-14 pr-5 py-4 sm:py-5 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm font-black text-slate-900 outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 transition-all appearance-none cursor-pointer shadow-inner"
                >
                  {activeSessions.length > 0 ? (
                    activeSessions.map(s => (
                      <option key={s.session_id} value={s.session_id}>
                        {s.course_code} • {s.course_name}
                      </option>
                    ))
                  ) : (
                    <option disabled value="">Scanning for active sessions...</option>
                  )}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <ChevronDown size={20} strokeWidth={3} />
                </div>
              </div>
            </div>

            {/* OTP Input */}
            <div className="space-y-2 pt-2">
               <div className="flex justify-between items-center pl-1">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">6-Digit Access Code</label>
               </div>
               <input 
                required
                type="text"
                maxLength="6"
                inputMode="numeric"
                placeholder="••••••"
                className="w-full text-center text-4xl sm:text-5xl font-black tracking-[0.3em] sm:tracking-[0.4em] py-6 sm:py-8 bg-slate-50 border border-slate-200/80 rounded-2xl focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 transition-all outline-none text-slate-900 placeholder:text-slate-300 shadow-inner"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
              />
            </div>

            {/* GPS Status Badge */}
            <div className={`flex items-center justify-center gap-2 py-4 mt-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border shadow-sm ${
              coords 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : 'bg-orange-50 border-orange-200 text-orange-700'
            }`}>
              {coords ? (
                <><ShieldCheck size={18} className="text-green-600"/> Location Verified</>
              ) : (
                <><Loader2 className="animate-spin text-orange-600" size={18} /> Locking GPS Signal...</>
              )}
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2 duration-300 backdrop-blur-md">
                <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5 animate-pulse" />
                <p className="text-xs font-black text-red-700 leading-snug uppercase tracking-wide">{errorMsg}</p>
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={!coords || otp.length < 6 || status === "verifying" || activeSessions.length === 0}
              className="group relative w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 sm:py-5 mt-4 text-sm font-black text-white uppercase tracking-widest transition-all hover:bg-blue-500 active:scale-95 disabled:opacity-50 disabled:bg-slate-300 disabled:pointer-events-none shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] disabled:shadow-none"
            >
              {status === "verifying" ? (
                <><Loader2 className="animate-spin" size={20} /> AUTHORIZING...</>
              ) : (
                <>SUBMIT CHECK-IN</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}