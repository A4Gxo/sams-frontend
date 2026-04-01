import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Download, FileText, ChevronRight, BookOpen, 
  Search, Users, BarChart2, Loader2, 
  CheckCircle2, XCircle, Percent
} from 'lucide-react';

export default function FacultyReports() {
  const token = localStorage.getItem("token");
  
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [reportData, setReportData] = useState({ total_classes: 0, student_reports: [] });
  
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    axios.get("http://localhost:8000/faculty/dashboard-data", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setSubjects(res.data.subjects || []);
      setLoadingSubjects(false);
    })
    .catch(err => {
      console.error("Failed to load subjects", err);
      setLoadingSubjects(false);
    });
  }, [token]);

  const handleSubjectSelect = async (subject) => {
    setSelectedSubject(subject);
    setSearchQuery(""); 
    setLoadingReport(true);
    
    try {
      const res = await axios.get(`http://localhost:8000/faculty/course-report/${subject.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReportData(res.data);
    } catch (err) {
      console.error("Failed to fetch course report", err);
      setReportData({ total_classes: 0, student_reports: [] });
    } finally {
      setLoadingReport(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!selectedSubject || reportData.student_reports.length === 0) return;
    const headers = ["Roll Number", "First Name", "Last Name", "Total Classes", "Present", "Absent", "Attendance %"];
    const rows = reportData.student_reports.map(student => [
      `"${student.roll_no || 'N/A'}"`, `"${student.first_name}"`, `"${student.last_name}"`,
      reportData.total_classes, student.present, student.absent, `${student.percentage}%`
    ]);
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${selectedSubject.code}_Student_Analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredStudents = reportData.student_reports.filter(student => {
    const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
    const rollNo = (student.roll_no || "").toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) || rollNo.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12 pt-6 px-4 sm:px-6 lg:px-8">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <BarChart2 size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Analytics & Reports</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Student Analytics
          </h1>
          <p className="text-sm font-bold text-slate-500 mt-1">Detailed class reports and data export.</p>
        </div>
        
        <button 
          onClick={handleDownloadCSV} 
          disabled={!selectedSubject || reportData.student_reports.length === 0}
          className="group w-full md:w-auto flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-blue-600 active:scale-95 shadow-[0_8px_20px_rgba(0,0,0,0.15)] disabled:opacity-50 disabled:pointer-events-none hover:shadow-[0_8px_20px_rgba(37,99,235,0.3)]"
        >
          <Download size={18} className="transition-transform group-hover:-translate-y-1" /> 
          Export CSV
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT SIDEBAR: SUBJECT SELECTION (4 cols) --- */}
        <nav className="lg:col-span-4 space-y-4">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest px-2 flex items-center gap-2">
            <BookOpen size={14} /> Filter by Course
          </h2>
          
          {loadingSubjects ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
              <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Courses...</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {subjects.length > 0 ? subjects.map(sub => {
                const isActive = selectedSubject?.id === sub.id;
                return (
                  <li key={sub.id}>
                    <button 
                      onClick={() => handleSubjectSelect(sub)} 
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
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No subjects found</p>
                </div>
              )}
            </ul>
          )}
        </nav>

        {/* --- MAIN CONTENT: REPORTS (8 cols) --- */}
        <main className="lg:col-span-8 space-y-6">
          {!selectedSubject ? (
             <div className="bg-white rounded-[3rem] border border-slate-100 py-32 text-center shadow-sm flex flex-col items-center justify-center">
               <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                 <FileText size={40} className="text-slate-300" />
               </div>
               <h3 className="text-xl font-black text-slate-900 mb-2">No Course Selected</h3>
               <p className="font-bold text-slate-400 text-sm">Choose a course from the sidebar to view its analytics.</p>
             </div>
          ) : loadingReport ? (
             <div className="bg-white rounded-[3rem] border border-slate-100 h-[500px] flex flex-col items-center justify-center shadow-sm">
               <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
               <p className="text-xs font-black uppercase tracking-widest text-slate-400">Generating Report...</p>
             </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              
              {/* SUMMARY CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-[2rem] p-6 shadow-xl shadow-slate-900/10 flex flex-col justify-center relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">Selected Course</p>
                    <p className="text-xl font-black leading-tight line-clamp-2">{selectedSubject.name}</p>
                    <p className="text-xs font-bold text-slate-400 mt-2">{selectedSubject.code}</p>
                  </div>
                  <BookOpen className="absolute -right-4 -bottom-4 text-white opacity-5" size={100} />
                </div>
                
                <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><BarChart2 size={16}/></div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Classes</p>
                  </div>
                  <p className="text-4xl font-black text-slate-900">{reportData.total_classes}</p>
                </div>
                
                <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Users size={16}/></div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Enrolled Students</p>
                  </div>
                  <p className="text-4xl font-black text-slate-900">{reportData.student_reports.length}</p>
                </div>
              </div>

              {/* DATA SECTION */}
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                
                {/* Search Header */}
                <div className="p-6 sm:p-8 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 bg-slate-950 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none"></div>
                  
                  <div className="relative z-10">
                    <h3 className="text-2xl font-black">Performance Roster</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">Individual Student Metrics</p>
                  </div>
                  
                  <div className="relative w-full sm:w-72 z-10">
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

                {/* Desktop Header Row (Hidden on Mobile) */}
                <div className="hidden sm:grid grid-cols-12 gap-4 px-8 py-4 bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <div className="col-span-5">Student Info</div>
                  <div className="col-span-2 text-center text-green-600">Present</div>
                  <div className="col-span-2 text-center text-red-500">Absent</div>
                  <div className="col-span-3 text-right">Attendance %</div>
                </div>

                {/* List Items (Responsive Cards on Mobile, Rows on Desktop) */}
                <div className="p-4 sm:p-6 flex-1 bg-slate-50/50 space-y-3">
                  {filteredStudents.length > 0 ? filteredStudents.map((student) => {
                    const isSafe = student.percentage >= 75;
                    
                    return (
                      <div key={student.student_id} className="group bg-white p-4 sm:px-8 sm:py-5 rounded-2xl sm:rounded-[1.5rem] border border-slate-200/60 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col sm:grid sm:grid-cols-12 sm:items-center gap-4 sm:gap-4">
                        
                        {/* 1. Student Info */}
                        <div className="sm:col-span-5 flex items-center gap-4">
                          <div className="h-12 w-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center font-black text-slate-600 text-sm uppercase shadow-inner border border-white shrink-0">
                            {student.first_name?.[0]}{student.last_name?.[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-slate-900 text-base truncate">{student.first_name} {student.last_name}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{student.roll_no}</p>
                          </div>
                        </div>

                        {/* Mobile Wrapper for Stats */}
                        <div className="grid grid-cols-3 sm:contents gap-2 pt-3 border-t sm:border-t-0 border-slate-100">
                          
                          {/* 2. Present */}
                          <div className="sm:col-span-2 flex flex-col sm:block items-center sm:text-center bg-green-50 sm:bg-transparent p-2 sm:p-0 rounded-xl">
                            <span className="sm:hidden text-[9px] font-black text-green-600 uppercase tracking-widest mb-1 flex items-center gap-1"><CheckCircle2 size={10}/> Present</span>
                            <span className="text-sm sm:text-base font-black text-green-700 sm:text-green-600">{student.present}</span>
                          </div>

                          {/* 3. Absent */}
                          <div className="sm:col-span-2 flex flex-col sm:block items-center sm:text-center bg-red-50 sm:bg-transparent p-2 sm:p-0 rounded-xl">
                            <span className="sm:hidden text-[9px] font-black text-red-600 uppercase tracking-widest mb-1 flex items-center gap-1"><XCircle size={10}/> Absent</span>
                            <span className="text-sm sm:text-base font-black text-red-700 sm:text-red-500">{student.absent}</span>
                          </div>

                          {/* 4. Percentage */}
                          <div className="sm:col-span-3 flex flex-col sm:block items-center sm:text-right bg-slate-50 sm:bg-transparent p-2 sm:p-0 rounded-xl">
                            <span className="sm:hidden text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Percent size={10}/> Overall</span>
                            <span className={`inline-flex items-center px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-black tracking-widest ${
                              isSafe ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {student.percentage}%
                            </span>
                          </div>

                        </div>
                      </div>
                    );
                  }) : (
                    <div className="py-20 text-center flex flex-col items-center">
                      <Users size={48} className="text-slate-300 mb-4" />
                      <p className="text-slate-500 font-bold text-sm">
                        {searchQuery ? `No students found matching "${searchQuery}"` : "No analytics data available yet."}
                      </p>
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