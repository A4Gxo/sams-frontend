import { useState, useEffect } from "react";
import axios from "axios";
import { 
  BookOpen, Clock, Activity, MapPin, 
  ChevronRight, Play, ShieldCheck, ShieldAlert, 
  Radar, GraduationCap, LayoutDashboard
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    enrolled_subjects: [],
    live_sessions: [],
    overall_attendance: 0
  });
  const [loading, setLoading] = useState(true);

  // --- UPGRADED AUTO-REFRESHING FETCH LOGIC ---
  const fetchStudentData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://sams-zsar.onrender.com/students/dashboard-data", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error("Dashboard fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
    const intervalId = setInterval(() => {
      fetchStudentData();
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12 pb-16 animate-in fade-in duration-700 pt-6">
      
      {/* 1. Header & Live Status */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <LayoutDashboard size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Student Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Hey, {localStorage.getItem("userName")?.split(" ")[0] || "User"}!
          </h1>
          <p className="text-sm font-bold text-slate-500">Here is your official academic status.</p>
        </div>
        
        {/* Animated Check-in Button if Live Class Exists */}
        {data.live_sessions.length > 0 ? (
          <button 
            onClick={() => navigate("/dashboard/check-in")}
            className="group relative w-full md:w-auto flex items-center justify-center gap-3 bg-blue-600 px-8 py-4 sm:py-4 rounded-2xl text-white font-black text-sm shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] hover:bg-blue-500 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
          >
            {/* Ping effect behind the button */}
            <div className="absolute inset-0 w-full h-full border-2 border-blue-400 rounded-2xl animate-ping opacity-20"></div>
            
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <span>Join Live Class</span>
            <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
          </button>
        ) : (
          <div className="w-full md:w-auto px-6 py-4 bg-slate-100 rounded-2xl text-slate-500 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 shadow-inner">
            <Clock size={16} className="text-slate-400" /> No Live Sessions Right Now
          </div>
        )}
      </div>

      {/* 2. Cumulative Attendance Hero Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 text-white shadow-2xl border border-slate-800 group">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 sm:gap-12">
          
          {/* Progress Circle */}
          <div className="relative h-36 w-36 sm:h-40 sm:w-40 flex items-center justify-center shrink-0">
             <svg className="h-full w-full transform -rotate-90 drop-shadow-2xl">
                <circle cx="50%" cy="50%" r="44%" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800/50" />
                <circle cx="50%" cy="50%" r="44%" stroke="currentColor" strokeWidth="8" fill="transparent" 
                        strokeDasharray={364.4} strokeDashoffset={364.4 - (364.4 * data.overall_attendance) / 100}
                        className={`${data.overall_attendance >= 75 ? 'text-green-400' : 'text-red-500'} transition-all duration-1500 ease-out`} strokeLinecap="round" />
             </svg>
             <div className="absolute flex flex-col items-center justify-center">
               <span className="text-3xl sm:text-4xl font-black">{data.overall_attendance}%</span>
             </div>
          </div>
          
          {/* Text Content */}
          <div className="text-center md:text-left">
            <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-sm border ${
              data.overall_attendance >= 75 
                ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                : 'bg-red-500/10 text-red-400 border-red-500/20'
            }`}>
              {data.overall_attendance >= 75 ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
              {data.overall_attendance >= 75 ? 'Status: Safe' : 'Action Required'}
            </div>
            <h2 className="text-3xl sm:text-4xl font-black mt-4 tracking-tight">Overall Presence</h2>
            <p className="text-slate-400 font-medium mt-2 text-sm sm:text-base">
              Calculated across all <span className="text-white font-bold">{data.enrolled_subjects.length}</span> registered subjects this semester.
            </p>
          </div>
        </div>

        {/* Background Decorative Elements */}
        <div className="absolute -top-24 -right-24 p-10 opacity-5 transform group-hover:scale-110 transition-transform duration-1000 ease-in-out pointer-events-none">
          <Activity size={400} />
        </div>
      </div>

      {/* 3. Grid: Enrolled Subjects & Live Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Enrolled Subjects List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <BookOpen className="text-blue-600" size={24} /> Registered Courses
            </h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {data.enrolled_subjects.map((subject, idx) => (
              <div key={idx} className="group relative bg-white p-6 sm:p-7 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex justify-between items-start mb-5">
                  <div className={`flex items-center justify-center h-12 w-12 rounded-2xl font-black text-sm border ${
                    subject.attendance >= 75 
                      ? 'bg-green-50 text-green-600 border-green-100' 
                      : 'bg-red-50 text-red-600 border-red-100'
                  }`}>
                    {subject.attendance}%
                  </div>
                  <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>
                
                <h4 className="font-black text-slate-800 text-lg mb-1 line-clamp-1">{subject.course_name}</h4>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <GraduationCap size={12} />
                  <span>{subject.course_code} • {subject.faculty_name}</span>
                </div>
                
                {/* Visual Mini Progress Bar */}
                <div className="mt-6 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${subject.attendance >= 75 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${subject.attendance}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Classes Right Sidebar */}
        <div className="space-y-6">
           <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Radar className="text-red-500" size={24} /> Currently Live
          </h3>
          
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-lg p-6 sm:p-8 relative overflow-hidden">
            {/* Subtle background glow for live section */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-[60px] rounded-full pointer-events-none"></div>

            {data.live_sessions.length > 0 ? (
              <div className="space-y-4 relative z-10">
                {data.live_sessions.map((session, i) => (
                  <div key={i} className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 group hover:bg-blue-50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                      </span>
                      <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Live Now</p>
                    </div>
                    
                    <h4 className="font-black text-slate-900 text-sm mb-1 line-clamp-1">{session.subject}</h4>
                    <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mb-5">
                      <MapPin size={12} className="text-blue-500" /> {session.room}
                    </p>
                    
                    <button 
                      onClick={() => navigate("/dashboard/check-in")}
                      className="w-full py-3 bg-slate-900 hover:bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-md"
                    >
                      <MapPin size={14} /> Mark Presence
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 relative z-10">
                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300 mb-4 shadow-inner">
                  <Clock size={28} />
                </div>
                <h4 className="font-black text-slate-700 mb-1">No Active Classes</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Check back according to schedule</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}