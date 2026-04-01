import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 
import { 
  Users, BookOpen, Clock, PlayCircle, 
  Loader2, StopCircle, Zap, MapPin, 
  Activity, UserCheck, ShieldCheck, Radio
} from "lucide-react";
import FacultyAnalytics from "../components/FacultyAnalytics";

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [liveStudents, setLiveStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  
  // Get values from localStorage
  const userName = localStorage.getItem("userName") || "Professor";
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchFacultyData();
  }, []);

  // --- LIVE POLLING ---
  useEffect(() => {
    let interval;
    if (activeSession) {
      const fetchLiveAttendance = async () => {
        try {
          const res = await axios.get(`http://127.0.0.1:8000/attendance/live/${activeSession.session_id}`, { headers });
          setLiveStudents(res.data.students || []); 
        } catch (err) {
          console.error("Live sync failed");
        }
      };
      fetchLiveAttendance(); 
      interval = setInterval(fetchLiveAttendance, 3000);
    } else {
      setLiveStudents([]);
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  const fetchFacultyData = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await axios.get("http://127.0.0.1:8000/faculty/dashboard-data", { headers });
      setCourses(res.data.subjects || []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load dashboard", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
      setLoading(false);
    }
  };

  const handleStartSession = async (courseId) => {
    setIsStarting(true);
    if (!navigator.geolocation) {
      alert("GPS is required to start a session.");
      setIsStarting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const payload = {
          course_id: courseId,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };

        const res = await axios.post("http://127.0.0.1:8000/attendance/session/start", payload, { headers });
        
        setActiveSession({
          session_id: res.data.session_id,
          otp_code: res.data.otp_code,
          courseName: courses.find(c => c.id === courseId)?.name
        });
      } catch (err) {
        alert("Server Error: Could not start session.");
      } finally {
        setIsStarting(false);
      }
    }, (err) => {
      alert("Location permission denied. GPS is mandatory for Faculty.");
      setIsStarting(false);
    });
  };

  const handleEndSession = async () => {
    if (!activeSession) return;
    try {
      await axios.post(`http://127.0.0.1:8000/attendance/session/terminate/${activeSession.session_id}`, {}, { headers });
      setActiveSession(null);
    } catch (err) {
      console.error("Termination failed", err);
    }
  };

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={48} />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10 pb-16 animate-in fade-in duration-700 pt-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <ShieldCheck size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Faculty Portal</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Prof. {userName.split(' ')[0]} <span className="text-blue-600">.</span>
          </h1>
          <p className="text-sm font-bold text-slate-500 mt-2">
            Digital Attendance & Control Hub
          </p>
        </div>
        
        {activeSession && (
          <div className="flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-red-50 text-red-600 border border-red-200/60 shadow-sm animate-pulse w-full md:w-auto">
            <Radio size={18} className="animate-ping absolute opacity-20" />
            <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
            <span className="text-xs font-black uppercase tracking-widest">Live Broadcast Active</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Main Controls (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {activeSession ? (
            /* 🔴 ACTIVE SESSION CONTROL BOARD */
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-[2rem] sm:rounded-[3.5rem] p-6 sm:p-12 text-white shadow-2xl relative overflow-hidden ring-4 ring-blue-500/20">
              <div className="relative z-10 flex flex-col items-center text-center">
                <p className="text-xs font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-blue-400 mb-6 sm:mb-8 opacity-80 flex items-center gap-2">
                  <Zap size={16} /> Broadcast this code
                </p>
                
                {/* OTP Display */}
                <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-10 sm:mb-12">
                  {activeSession.otp_code.split('').map((char, i) => (
                    <div key={i} className="h-20 w-16 sm:h-28 sm:w-24 bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-[2rem] flex items-center justify-center text-5xl sm:text-7xl font-black border border-white/20 shadow-2xl text-white">
                      {char}
                    </div>
                  ))}
                </div>

                <div className="bg-white/10 p-6 sm:p-8 rounded-[2rem] border border-white/10 w-full max-w-md mb-8 sm:mb-10 backdrop-blur-sm">
                    <h3 className="text-xl sm:text-2xl font-black mb-2">{activeSession.courseName}</h3>
                    <div className="flex items-center justify-center gap-2 text-blue-300 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                        <MapPin size={14} /> Location-Locked Zone Active
                    </div>
                </div>
                
                <button 
                  onClick={handleEndSession}
                  className="group w-full sm:w-auto flex items-center justify-center gap-3 rounded-2xl sm:rounded-[2rem] bg-red-600 px-8 sm:px-16 py-5 sm:py-6 text-sm font-black hover:bg-red-500 transition-all active:scale-95 shadow-[0_0_30px_rgba(220,38,38,0.4)]"
                >
                  <StopCircle size={22} className="group-hover:rotate-90 transition-transform" /> 
                  END CLASS SESSION
                </button>
              </div>
              
              {/* Background Decor */}
              <Zap size={400} className="absolute -right-20 -bottom-20 text-white opacity-[0.03] -rotate-12 pointer-events-none" />
            </div>
          ) : (
          /* 🔵 COURSE LIST GRID */
          <div className="space-y-6">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <BookOpen className="text-blue-600" size={24} /> My Subjects
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {courses.length > 0 ? courses.map((course) => (
                <div key={course.id} className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div className="h-12 w-12 sm:h-14 sm:w-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Users size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase bg-slate-50 text-slate-400 px-3 py-1.5 rounded-lg border border-slate-100">
                      {course.code}
                    </span>
                  </div>
                  
                  <h4 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mb-8 flex-1">{course.name}</h4>
                  
                  <button 
                    onClick={() => handleStartSession(course.id)}
                    disabled={isStarting}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 text-xs font-black text-white hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-slate-200 disabled:opacity-50"
                  >
                    {isStarting ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <>
                        <div className="relative flex h-2 w-2 mr-1">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </div>
                        START GPS SESSION
                      </>
                    )}
                  </button>
                </div>
              )) : (
                <div className="col-span-full p-10 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-400 font-bold flex flex-col items-center justify-center gap-3">
                  <BookOpen size={32} className="opacity-50" />
                  <p className="uppercase tracking-widest text-[10px]">No assigned subjects found.</p>
                </div>
              )}
            </div>
            
            {/* FACULTY ANALYTICS CHART */}
            <div className="pt-4">
              <FacultyAnalytics />
            </div>
          </div>
          )}
        </div>

        {/* RIGHT COLUMN: Live Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 p-6 sm:p-8 shadow-xl shadow-slate-200/20 h-full min-h-[500px] flex flex-col relative overflow-hidden">
            
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2 relative z-10">
               {activeSession ? (
                 <><Activity className="text-red-500 animate-pulse" /> Live Attendance</>
               ) : (
                 <><Radio className="text-slate-400" /> Standby Mode</>
               )}
            </h3>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar relative z-10">
              {activeSession ? (
                liveStudents.length > 0 ? (
                  liveStudents.map((stu, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100/50 hover:bg-blue-50 transition-colors">
                      <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white text-[10px] font-black shadow-sm">
                        {stu.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-slate-900 truncate">{stu.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{stu.roll_no}</p>
                      </div>
                      <div className="text-[9px] font-black text-green-600 bg-green-100/50 border border-green-200/50 px-2 py-1 rounded-md">
                        {stu.time}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="relative h-16 w-16 mb-4 flex items-center justify-center">
                      <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-50"></div>
                      <UserCheck size={32} className="text-blue-500 relative z-10" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-relaxed">
                      Awaiting Student<br/>Connections...
                    </p>
                  </div>
                )
              ) : (
                /* EMPTY STATE WHEN NO SESSION IS ACTIVE */
                <div className="flex flex-col items-center justify-center h-full text-center opacity-60 py-20">
                  <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Zap size={32} className="text-slate-300" />
                  </div>
                  <h4 className="font-black text-slate-700 text-sm mb-1">System Offline</h4>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Start a GPS session<br/>to monitor live check-ins.
                  </p>
                </div>
              )}
            </div>
            
            {/* Subtle background glow for active state */}
            {activeSession && <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-[50px] rounded-full pointer-events-none"></div>}
          </div>
        </div>

      </div>
    </div>
  );
}