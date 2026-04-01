import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Search, UserCheck, UserX, ChevronRight, BookOpen, 
  Loader2, Calendar as CalendarIcon, ChevronLeft, Users, 
  CheckCircle2, XCircle, FileSpreadsheet
} from "lucide-react";

export default function MarkAttendance() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); 
  
  // Loading States
  const [loading, setLoading] = useState(false);
  const [rosterLoading, setRosterLoading] = useState(false);
  
  // Calendar States
  const [history, setHistory] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState("");

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // Helper: Format Date object to "YYYY-MM-DD"
  const formatDateStr = (dateObj) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  useEffect(() => {
    axios.get("http://localhost:8000/faculty/dashboard-data", { headers })
      .then(res => setSubjects(res.data.subjects || []))
      .catch(err => console.error("API ERROR:", err.response?.data || err.message));
  }, []);

  const handleSubjectSelect = async (sub) => {
    setSelectedSubject(sub);
    setSearchQuery("");
    setLoading(true);
    
    const todayStr = formatDateStr(new Date());
    setSelectedDateStr(todayStr);

    try {
      const histRes = await axios.get(`http://localhost:8000/attendance/faculty/history/${sub.id}`, { headers });
      setHistory(histRes.data.history || []);
      fetchDateRoster(sub.id, todayStr);
    } catch (err) {
      console.error("Error fetching subject data", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDateRoster = async (courseId, dateStr) => {
    setRosterLoading(true);
    try {
      const res = await axios.get(`http://localhost:8000/attendance/roster/${courseId}/${dateStr}`, { headers });
      setStudents(res.data.students || []);
    } catch (err) {
      console.error("Failed to fetch roster", err);
      setStudents([]);
    } finally {
      setRosterLoading(false);
    }
  };

  const handleDateClick = (dayNumber) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);
    const dateStr = formatDateStr(clickedDate);
    setSelectedDateStr(dateStr);
    fetchDateRoster(selectedSubject.id, dateStr);
  };

  const toggleAttendance = async (studentId, currentStatus) => {
    const newStatus = currentStatus === "Present" ? "Absent" : "Present";
    
    // Optimistic UI Update
    setStudents(prev => prev.map(s => 
      s.student_id === studentId ? { ...s, status: newStatus } : s
    ));

    try {
      await axios.post("http://localhost:8000/attendance/autonomous-mark", {
        course_id: selectedSubject.id, 
        student_id: studentId,
        status: newStatus,
        date: selectedDateStr 
      }, { headers });
      
      // Silently refresh history in background
      axios.get(`http://localhost:8000/attendance/faculty/history/${selectedSubject.id}`, { headers })
        .then(res => setHistory(res.data.history || []));

    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to save attendance.");
      // Revert UI on failure
      setStudents(prev => prev.map(s => 
        s.student_id === studentId ? { ...s, status: currentStatus } : s
      ));
    }
  };

  // --- CALENDAR MATH ---
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const filteredStudents = students.filter(student => {
    const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
    const rollNo = (student.roll_no || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || rollNo.includes(query);
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12 pt-6 px-4 sm:px-6 lg:px-8">
      
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <FileSpreadsheet size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Attendance Center</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Manage Records</h1>
          <p className="text-sm font-bold text-slate-500 mt-1">Audit past records or manually override today's attendance.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT SIDEBAR: SUBJECT SELECTION (4 cols) --- */}
        <nav aria-label="Subject Selection" className="lg:col-span-4 space-y-4">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest px-2 flex items-center gap-2" id="subject-list-heading">
            <BookOpen size={14} /> Assigned Subjects
          </h2>
          
          <ul aria-labelledby="subject-list-heading" className="space-y-3">
            {subjects.length > 0 ? subjects.map(sub => {
              const isActive = selectedSubject?.id === sub.id;
              return (
                <li key={sub.id}>
                  <button 
                    onClick={() => handleSubjectSelect(sub)}
                    aria-pressed={isActive}
                    className={`group w-full p-5 rounded-[2rem] flex items-center justify-between transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-[0_8px_30px_rgba(37,99,235,0.3)] scale-[1.02]' 
                        : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/60 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div className="text-left flex-1 min-w-0 pr-4">
                      <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isActive ? 'text-blue-200' : 'text-slate-400'}`}>
                        {sub.code}
                      </p>
                      <p className="font-black text-base truncate">{sub.name}</p>
                    </div>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${isActive ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-blue-100 group-hover:text-blue-600'}`}>
                      <ChevronRight aria-hidden="true" size={16} className={isActive ? 'text-white' : ''} />
                    </div>
                  </button>
                </li>
              );
            }) : (
              <div className="p-8 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No subjects assigned</p>
              </div>
            )}
          </ul>
        </nav>

        {/* --- MAIN CONTENT: CALENDAR + ROSTER (8 cols) --- */}
        <main className="lg:col-span-8 space-y-6">
          {!selectedSubject ? (
            /* EMPTY STATE */
            <div className="bg-white rounded-[3rem] border border-slate-100 py-32 text-center shadow-sm flex flex-col items-center justify-center">
              <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <CalendarIcon aria-hidden="true" size={40} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">No Subject Selected</h3>
              <p className="font-bold text-slate-400 text-sm">Choose a subject from the sidebar to view its roster.</p>
            </div>
          ) : loading ? (
            <div className="bg-white rounded-[3rem] border border-slate-100 h-[600px] flex flex-col items-center justify-center shadow-sm">
              <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Data...</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              
              {/* COMPACT CALENDAR STRIP */}
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 sm:p-8 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                    <CalendarIcon className="text-blue-600" size={20} /> Select Date
                  </h3>
                  
                  <div className="flex items-center justify-between sm:justify-center gap-2 bg-slate-50 px-2 py-1.5 rounded-2xl border border-slate-200/60 shadow-inner w-full sm:w-auto">
                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="hover:bg-white p-2 rounded-xl transition-colors text-slate-500 hover:text-blue-600 shadow-sm"><ChevronLeft size={18}/></button>
                    <span className="font-black text-sm w-32 text-center text-slate-800">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="hover:bg-white p-2 rounded-xl transition-colors text-slate-500 hover:text-blue-600 shadow-sm"><ChevronRight size={18}/></button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1.5 sm:gap-2 relative z-10">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{day}</div>
                  ))}
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
                  
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNumber = i + 1;
                    const dateString = formatDateStr(new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber));
                    const isSelected = selectedDateStr === dateString;
                    const isToday = formatDateStr(new Date()) === dateString;
                    const sessionData = history.find(h => h.date === dateString);

                    return (
                      <button 
                        key={dayNumber}
                        onClick={() => handleDateClick(dayNumber)}
                        className={`relative p-2 rounded-2xl border-2 transition-all flex flex-col items-center justify-center aspect-square sm:aspect-auto sm:min-h-[70px] ${
                          isSelected 
                            ? 'border-blue-600 bg-blue-600 shadow-[0_4px_12px_rgba(37,99,235,0.3)] scale-105 z-10' 
                            : sessionData 
                              ? 'border-blue-100 bg-white hover:border-blue-400 hover:shadow-md' 
                              : 'border-transparent bg-slate-50 hover:bg-slate-100'
                        }`}
                      >
                        <span className={`text-sm sm:text-base font-black ${isSelected ? 'text-white' : sessionData ? 'text-slate-900' : 'text-slate-400'}`}>
                          {dayNumber}
                        </span>
                        
                        {/* Status Dots/Badges */}
                        {isToday && !isSelected && <div className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-blue-500"></div>}
                        
                        {sessionData && (
                          <span className={`absolute bottom-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5 ${
                            isSelected ? 'bg-white/20 text-white' : 'text-blue-600 bg-blue-50'
                          }`}>
                            <Users size={8} strokeWidth={3}/> {sessionData.present_count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* --- ROSTER TABLE (FLEX-BASED FOR MOBILE) --- */}
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                
                {/* Roster Header & Search */}
                <div className="p-6 sm:p-8 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 bg-slate-950 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none"></div>
                  
                  <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-1">Roster for:</p>
                    <h3 className="text-2xl font-black">
                      {selectedDateStr === formatDateStr(new Date()) && <span className="text-blue-400 mr-2">Today,</span>}
                      {selectedDateStr}
                    </h3>
                  </div>
                  
                  <div className="relative w-full sm:w-72 relative z-10">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="search" 
                      placeholder="Search name or ID..." 
                      value={searchQuery} 
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-white/5 text-white placeholder:text-slate-400 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/10 text-sm font-semibold transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* Roster List (Mobile Friendly) */}
                <div className="p-4 sm:p-6 flex-1 bg-slate-50/50" aria-live="polite">
                  {rosterLoading ? (
                    <div className="h-full flex flex-col items-center justify-center py-20">
                      <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredStudents.length > 0 ? filteredStudents.map((student) => {
                        const isPresent = student.status === "Present";
                        
                        return (
                          <div key={student.student_id} className="group bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md hover:border-blue-200">
                            
                            {/* Student Info */}
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center font-black text-slate-600 text-sm uppercase shadow-inner border border-white">
                                {student.first_name?.[0]}{student.last_name?.[0]}
                              </div>
                              <div>
                                <p className="font-black text-slate-900 text-base">{student.first_name} {student.last_name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{student.roll_no}</span>
                                  <span className="text-slate-300">•</span>
                                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                                    isPresent ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                                  }`}>
                                    {student.status || "Absent"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 sm:ml-auto w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                              <button 
                                onClick={() => toggleAttendance(student.student_id, student.status)}
                                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${
                                  isPresent 
                                    ? "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-100" 
                                    : "bg-green-50 text-green-600 hover:bg-green-600 hover:text-white border border-green-100"
                                }`}
                              >
                                {isPresent ? (
                                  <><XCircle size={16} /> Mark Absent</>
                                ) : (
                                  <><CheckCircle2 size={16} /> Mark Present</>
                                )}
                              </button>
                            </div>

                          </div>
                        );
                      }) : (
                        <div className="py-20 text-center flex flex-col items-center">
                          <UserX size={48} className="text-slate-300 mb-4" />
                          <p className="text-slate-500 font-bold text-sm">
                            {searchQuery ? `No students found matching "${searchQuery}"` : "No students found in this course."}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}