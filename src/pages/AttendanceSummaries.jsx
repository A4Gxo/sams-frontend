import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Filter, Loader2, Download, FileSpreadsheet, 
  Building2, Calendar, BookOpen, ChevronDown, 
  AlertCircle, CheckCircle2, XCircle
} from 'lucide-react';

export default function AttendanceSummaries() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Filter States
  const [filters, setFilters] = useState({
    department_id: '',
    course_id: '',
    semester_name: ''
  });

  const token = localStorage.getItem("token");

  // Fetch data whenever filters change
  useEffect(() => {
    fetchFilteredReports();
  }, [filters]);

  const fetchFilteredReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.department_id) params.append('department_id', filters.department_id);
      if (filters.course_id) params.append('course_id', filters.course_id);
      if (filters.semester_name) params.append('semester_name', filters.semester_name);

      const response = await axios.get(`http://127.0.0.1:8000/admin/attendance-summaries?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(response.data);
    } catch (error) {
      console.error("Failed to fetch summaries", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-12 pt-6 px-4 sm:px-6 lg:px-8">
      
      {/* HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <FileSpreadsheet size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Reports & Export</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Semester Summaries</h1>
          <p className="text-sm font-bold text-slate-500 mt-1">Review overall attendance and exam eligibility.</p>
        </div>
        
        <button className="group w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-blue-600 active:scale-95 shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_20px_rgba(37,99,235,0.3)]">
          <Download size={18} className="transition-transform group-hover:-translate-y-1" /> Export List
        </button>
      </header>

      {/* FILTER BAR */}
      <div className="bg-white p-5 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col lg:flex-row gap-4 sm:gap-6 lg:items-center">
        <div className="flex items-center gap-2 text-slate-400 font-black uppercase tracking-widest text-[10px] px-2 shrink-0">
          <Filter size={16} /> Filters
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          
          {/* Department Filter */}
          <div className="relative group">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
            <select 
              name="department_id" 
              onChange={handleFilterChange} 
              value={filters.department_id} 
              className="w-full pl-11 pr-10 py-3.5 bg-slate-50 border border-slate-200/60 rounded-xl text-sm font-bold text-slate-900 outline-none appearance-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
            >
              <option value="">All Departments</option>
              <option value="1">Computer Science</option>
              <option value="2">Information Technology</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-blue-500 transition-colors" size={18} />
          </div>

          {/* Semester Filter */}
          <div className="relative group">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
            <select 
              name="semester_name" 
              onChange={handleFilterChange} 
              value={filters.semester_name} 
              className="w-full pl-11 pr-10 py-3.5 bg-slate-50 border border-slate-200/60 rounded-xl text-sm font-bold text-slate-900 outline-none appearance-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
            >
              <option value="">All Semesters</option>
              <option value="Fall 2026">Fall 2026</option>
              <option value="Spring 2026">Spring 2026</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-blue-500 transition-colors" size={18} />
          </div>

          {/* Course Filter */}
          <div className="relative group">
            <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
            <select 
              name="course_id" 
              onChange={handleFilterChange} 
              value={filters.course_id} 
              className="w-full pl-11 pr-10 py-3.5 bg-slate-50 border border-slate-200/60 rounded-xl text-sm font-bold text-slate-900 outline-none appearance-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
            >
              <option value="">All Courses</option>
              <option value="1">Machine Learning</option>
              <option value="2">Data Structures</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-blue-500 transition-colors" size={18} />
          </div>

        </div>
      </div>

      {/* DATA TABLE / LIST */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col h-[400px] items-center justify-center gap-4 text-slate-500">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <p className="font-black uppercase tracking-widest text-[10px]">Generating Report...</p>
          </div>
        ) : (
          <>
            {/* Desktop Header Row (Hidden on Mobile) */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-8 py-5 bg-slate-50/80 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <div className="col-span-3">Student</div>
              <div className="col-span-3">Course & Semester</div>
              <div className="col-span-2 text-center">Classes (P/T)</div>
              <div className="col-span-2 text-center">Attendance %</div>
              <div className="col-span-2 text-right">Exam Eligibility</div>
            </div>

            {/* List Items */}
            <div className="p-4 sm:p-0 divide-y divide-slate-50">
              {reports.length === 0 ? (
                <div className="p-20 text-center flex flex-col items-center">
                  <AlertCircle className="text-slate-300 mb-4" size={48} />
                  <p className="font-black text-slate-400 uppercase tracking-widest text-xs">No records found for these filters</p>
                </div>
              ) : (
                reports.map(row => {
                  const isSafe = row.percentage >= 75;
                  return (
                    <div key={row.id} className="group p-4 sm:px-8 sm:py-5 transition-all hover:bg-slate-50/50 flex flex-col sm:grid sm:grid-cols-12 sm:items-center gap-4 sm:gap-4 border sm:border-none border-slate-100 rounded-2xl sm:rounded-none mb-3 sm:mb-0">
                      
                      {/* Student Info */}
                      <div className="sm:col-span-3 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-600 text-xs uppercase shrink-0">
                          {row.student_name.split(' ')[0][0]}{row.student_name.split(' ')[1]?.[0]}
                        </div>
                        <p className="font-black text-slate-900 text-sm sm:text-base truncate">{row.student_name}</p>
                      </div>

                      {/* Course Info */}
                      <div className="sm:col-span-3 flex sm:flex-col items-center sm:items-start justify-between">
                        <span className="sm:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Course</span>
                        <div className="text-right sm:text-left">
                          <p className="font-bold text-slate-800 text-sm truncate">{row.course_name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{row.semester_name}</p>
                        </div>
                      </div>

                      {/* Classes (Present/Total) */}
                      <div className="sm:col-span-2 flex items-center justify-between sm:justify-center">
                        <span className="sm:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Classes</span>
                        <div className="text-sm font-black text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                          <span className={isSafe ? "text-green-600" : "text-red-500"}>{row.total_present}</span> / {row.total_classes}
                        </div>
                      </div>

                      {/* Attendance Percentage */}
                      <div className="sm:col-span-2 flex items-center justify-between sm:justify-center">
                        <span className="sm:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Overall</span>
                        <span className={`text-lg font-black ${isSafe ? 'text-green-600' : 'text-red-600'}`}>
                          {row.percentage}%
                        </span>
                      </div>

                      {/* Exam Eligibility */}
                      <div className="sm:col-span-2 flex items-center justify-between sm:justify-end border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                        <span className="sm:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Eligibility</span>
                        {row.eligible ? (
                          <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest border border-green-200/50">
                            <CheckCircle2 size={14} /> Eligible
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest border border-red-200/50">
                            <XCircle size={14} /> Barred
                          </span>
                        )}
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}