import { useState, useEffect } from "react";
import axios from "axios";
import { Calendar as CalendarIcon, ChevronRight, ChevronLeft, Users, Clock, Loader2 } from "lucide-react";

export default function SessionCalendar() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // 1. Fetch Subjects on load
  useEffect(() => {
    axios.get("https://sams-zsar.onrender.com/faculty/dashboard-data", { headers })
      .then(res => setSubjects(res.data.subjects || []))
      .catch(err => console.error("API Error:", err));
  }, []);

  // 2. Fetch History when a subject is clicked
  const fetchHistory = async (courseId) => {
    setLoading(true);
    try {
      const res = await axios.get(`https://sams-zsar.onrender.com/attendance/faculty/history/${courseId}`, { headers });
      setHistory(res.data.history || []);
    } catch (err) {
      console.error("History fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- CALENDAR MATH ---
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  // Helper: Format cell date to "YYYY-MM-DD" to match backend
  const getFormattedDate = (day) => {
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <header>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Class History</h1>
        <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-[10px]">Audit Past Sessions & Attendance</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* SIDEBAR: SUBJECT SELECTION */}
        <nav aria-label="Subject Selection" className="space-y-4">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest px-2">Select Subject</h2>
          <ul className="space-y-2">
            {subjects.map(sub => (
              <li key={sub.id}>
                <button 
                  onClick={() => { setSelectedSubject(sub); fetchHistory(sub.id); }}
                  className={`w-full p-5 rounded-3xl flex items-center justify-between transition-all ${
                    selectedSubject?.id === sub.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-100'
                  }`}
                >
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase opacity-80">{sub.code}</p>
                    <p className="font-bold truncate w-32">{sub.name}</p>
                  </div>
                  <ChevronRight size={18} />
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* MAIN: CALENDAR VIEW */}
        <main className="lg:col-span-3">
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden p-8">
            
            {loading ? (
              <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
            ) : !selectedSubject ? (
              <div className="py-20 text-center text-slate-400">
                <CalendarIcon size={48} className="mx-auto mb-4 opacity-30" />
                <p className="font-black uppercase text-xs tracking-[0.2em]">Select a subject to view history</p>
              </div>
            ) : (
              <div className="space-y-8">
                
                {/* Calendar Header Controls */}
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl">
                  <button onClick={() => changeMonth(-1)} className="p-3 hover:bg-white rounded-xl shadow-sm text-slate-600"><ChevronLeft size={20} /></button>
                  <h3 className="text-xl font-black text-slate-900">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h3>
                  <button onClick={() => changeMonth(1)} className="p-3 hover:bg-white rounded-xl shadow-sm text-slate-600"><ChevronRight size={20} /></button>
                </div>

                {/* Calendar Grid */}
                <div>
                  {/* Days of week */}
                  <div className="grid grid-cols-7 mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">{day}</div>
                    ))}
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-7 gap-2 sm:gap-4">
                    {/* Empty slots for previous month offset */}
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                      <div key={`empty-${i}`} className="p-4 rounded-2xl bg-transparent" />
                    ))}

                    {/* Actual Days */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const dayNumber = i + 1;
                      const dateString = getFormattedDate(dayNumber);
                      
                      // Check if a class happened on this day
                      const sessionData = history.find(h => h.date === dateString);

                      return (
                        <div 
                          key={dayNumber} 
                          className={`relative flex flex-col items-center justify-center p-2 sm:p-4 rounded-2xl sm:rounded-3xl border-2 transition-all min-h-[80px] sm:min-h-[100px] ${
                            sessionData 
                              ? 'border-blue-500 bg-blue-50/50 hover:bg-blue-100 cursor-pointer' 
                              : 'border-slate-50 bg-slate-50/30'
                          }`}
                        >
                          <span className={`text-lg font-black ${sessionData ? 'text-blue-900' : 'text-slate-400'}`}>
                            {dayNumber}
                          </span>
                          
                          {/* If class exists, show attendance badge */}
                          {sessionData && (
                            <div className="absolute bottom-2 flex flex-col items-center gap-1">
                              <span className="flex items-center gap-1 bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded-md shadow-sm">
                                <Users size={10} /> {sessionData.present_count}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Legend & Stats */}
                <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
                    <div className="w-4 h-4 rounded bg-blue-50 border-2 border-blue-500"></div> Class Conducted
                  </div>
                  <p className="text-slate-500 font-bold">Total Sessions Recorded: <span className="text-slate-900 font-black">{history.length}</span></p>
                </div>

              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}