import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Users, BookOpen, Search, Filter, 
  CheckSquare, X, Building2, Loader2, CheckCircle2, PlusCircle,
  GraduationCap, ChevronDown
} from "lucide-react";

export default function AssignSubjects() {
  const [faculties, setFaculties] = useState([]);
  const [students, setStudents] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals State
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [activeFaculty, setActiveFaculty] = useState(null);
  const [activeCourseId, setActiveCourseId] = useState("");
  
  // Filters & Checkboxes
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    const baseUrl = "http://127.0.0.1:8000";

    try {
      setLoading(true);
      const [facRes, studRes, courseRes] = await Promise.all([
        axios.get(`${baseUrl}/faculty/`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${baseUrl}/students/`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${baseUrl}/admin/courses/`, { headers: { Authorization: `Bearer ${token}` } }) 
      ]);

      const fetchedCourses = courseRes.data;
      const mergedFaculties = facRes.data.map(fac => ({
        ...fac,
        courses: fetchedCourses.filter(c => c.faculty_id === fac.faculty_id)
      }));

      setFaculties(mergedFaculties);
      setStudents(studRes.data);
      setAllCourses(fetchedCourses);
    } catch (err) {
      console.error("DETAILED ERROR:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers for Student Enrollment ---
  const openStudentModal = (faculty) => {
    setActiveFaculty(faculty);
    setActiveCourseId(faculty.courses[0].course_id);
    setSelectedStudents([]);
    setIsStudentModalOpen(true);
  };

  const handleBulkAssignStudents = async () => {
    if (selectedStudents.length === 0 || !activeCourseId) return;
    setAssigning(true);
    const token = localStorage.getItem("token");

    try {
      const promises = selectedStudents.map(studentId => 
        axios.post("http://127.0.0.1:8000/enrollments/", {
          student_id: studentId,
          course_id: parseInt(activeCourseId)
        }, { headers: { Authorization: `Bearer ${token}` } })
      );
      await Promise.all(promises);
      alert(`Successfully enrolled ${selectedStudents.length} students!`);
      setIsStudentModalOpen(false);
      fetchData(); 
    } catch (err) {
      alert("Some assignments failed. They might already be enrolled.");
    } finally {
      setAssigning(false);
    }
  };

  // --- Handlers for Faculty Course Assignment ---
  const openCourseModal = (faculty) => {
    setActiveFaculty(faculty);
    setActiveCourseId(""); 
    setIsCourseModalOpen(true);
  };

  const handleAssignCourseToFaculty = async () => {
    if (!activeCourseId) return;
    setAssigning(true);
    const token = localStorage.getItem("token");

    try {
      await axios.put(`http://127.0.0.1:8000/admin/courses/${activeCourseId}/assign-faculty`, {
        faculty_id: activeFaculty.faculty_id
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setIsCourseModalOpen(false);
      fetchData(); 
    } catch (err) {
      alert("Failed to assign course to faculty.");
    } finally {
      setAssigning(false);
    }
  };

  // --- Filters ---
  const filteredStudents = students.filter(s => {
    const matchesSearch = (s.first_name + " " + s.last_name).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = filterDept ? s.department_id === parseInt(filterDept) : true;
    return matchesSearch && matchesDept;
  });

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId) 
        : [...prev, studentId]
    );
  };

  if (loading) return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-slate-500">
      <Loader2 className="animate-spin text-blue-600" size={48} />
      <p className="font-black uppercase tracking-widest text-[10px]">Loading Rosters...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-12 pt-6 px-4 sm:px-6 lg:px-8">
      
      {/* HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <BookOpen size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Class Management</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Faculty Assignments</h1>
          <p className="text-sm font-bold text-slate-500 mt-1">Manage teaching subjects and enroll students.</p>
        </div>
      </header>

      {/* FACULTY GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {faculties.map((faculty) => (
          <div key={faculty.faculty_id} className="bg-white rounded-3xl sm:rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all p-6 sm:p-8 flex flex-col group relative overflow-hidden">
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-[100px] -z-0 transition-transform duration-500 group-hover:scale-125 opacity-50"></div>

            <div className="relative z-10 flex-1">
              <div className="flex items-start gap-4 mb-6">
                <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-lg shadow-blue-200 uppercase shrink-0 border-2 border-white">
                    {faculty.first_name?.charAt(0) || "F"}{faculty.last_name?.charAt(0) || "M"}
                </div>
                <div className="min-w-0">
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight truncate" title={`Prof. ${faculty.first_name} ${faculty.last_name}`}>
                      Prof. {faculty.first_name} {faculty.last_name}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mt-1 truncate">
                      <Building2 size={12}/> Dept: {faculty.department_id}
                    </p>
                </div>
              </div>

              {/* Assigned Courses */}
              <div className="mb-8">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Teaching Subjects</p>
                <div className="flex flex-wrap gap-2">
                    {faculty.courses?.length > 0 ? faculty.courses.map(course => (
                      <span key={course.course_id} className="bg-slate-50 text-slate-700 border border-slate-200/60 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors">
                          <BookOpen size={12} className="text-blue-500" /> {course.course_name}
                      </span>
                    )) : (
                      <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 flex items-center gap-1">
                        <Loader2 size={12} /> No subjects assigned
                      </span>
                    )}
                </div>
              </div>
            </div>

            {/* Smart Action Button */}
            {faculty.courses?.length > 0 ? (
                <button 
                  onClick={() => openStudentModal(faculty)}
                  className="relative z-10 w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-[0_8px_20px_rgba(0,0,0,0.15)] active:scale-95"
                >
                  <Users size={16}/> Enroll Students
                </button>
            ) : (
                <button 
                  onClick={() => openCourseModal(faculty)}
                  className="relative z-10 w-full bg-amber-500 text-white py-4 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-amber-600 transition-all shadow-[0_8px_20px_rgba(245,158,11,0.3)] active:scale-95"
                >
                  <PlusCircle size={16}/> Assign Subject
                </button>
            )}
          </div>
        ))}
      </div>

      {/* --- MODAL 1: ASSIGN COURSE TO FACULTY --- */}
      {isCourseModalOpen && activeFaculty && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] sm:rounded-[3rem] w-full max-w-md p-8 sm:p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Assign Subject</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">For <span className="text-blue-600">Prof. {activeFaculty.first_name}</span></p>
              </div>
              <button onClick={() => setIsCourseModalOpen(false)} className="text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors"><X size={20}/></button>
            </div>
            
            <div className="relative group mb-8">
              <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <select 
                value={activeCourseId} 
                onChange={(e) => setActiveCourseId(e.target.value)}
                className="w-full pl-11 pr-10 py-4 rounded-2xl bg-slate-50 border border-slate-200/60 font-bold text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled>Select an available course...</option>
                {allCourses.map(c => (
                  <option key={c.course_id} value={c.course_id}>{c.course_name} ({c.course_code})</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-blue-500 transition-colors" size={18} />
            </div>

            <button 
              onClick={handleAssignCourseToFaculty}
              disabled={!activeCourseId || assigning}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-blue-200"
            >
              {assigning ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18}/>} Confirm Subject
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL 2: BULK ENROLL STUDENTS --- */}
      {isStudentModalOpen && activeFaculty && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white sm:rounded-[3rem] w-full h-full sm:h-auto sm:max-w-4xl sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
            
            {/* Modal Header */}
            <div className="px-6 sm:px-10 py-6 sm:py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex h-12 w-12 rounded-2xl bg-blue-600 text-white items-center justify-center shadow-lg shadow-blue-200">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">Class Roster</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">Assigning students to <span className="text-blue-600">Prof. {activeFaculty.first_name}</span></p>
                </div>
              </div>
              <button onClick={() => setIsStudentModalOpen(false)} className="h-10 w-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors shadow-sm shrink-0"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              
              {/* Filter Sidebar */}
              <div className="w-full md:w-80 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200/60 p-6 flex flex-col gap-5 overflow-y-auto shrink-0">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Target Course</label>
                  <div className="relative group">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                    <select 
                      value={activeCourseId} 
                      onChange={(e) => setActiveCourseId(e.target.value)}
                      className="w-full pl-9 pr-10 py-3 rounded-xl border border-slate-200/60 font-bold text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer bg-white"
                    >
                      {activeFaculty.courses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-blue-500 transition-colors" size={16} />
                  </div>
                </div>
                
                <div className="h-px bg-slate-200/60 w-full"></div>
                
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 pl-1"><Filter size={12}/> Search & Filter</p>
                  <div className="relative group">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                      type="text" placeholder="Search by name..." 
                      value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200/60 text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-white placeholder:text-slate-400"
                    />
                  </div>
                  <div className="relative group">
                    <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <select 
                      value={filterDept} onChange={(e) => setFilterDept(e.target.value)}
                      className="w-full pl-9 pr-10 py-3 rounded-xl border border-slate-200/60 text-sm font-bold outline-none text-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer bg-white"
                    >
                      <option value="">All Departments</option>
                      {/* Assuming you pass departments down or fetch them, using hardcoded for demo based on your original code */}
                      <option value="1">Computer Science</option>
                      <option value="2">Information Tech</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-blue-500 transition-colors" size={16} />
                  </div>
                </div>
              </div>

              {/* Student List */}
              <div className="flex-1 flex flex-col bg-white overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2 sm:space-y-3 custom-scrollbar">
                  {filteredStudents.length > 0 ? filteredStudents.map(student => (
                    <label 
                      key={student.student_id} 
                      className={`group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl border cursor-pointer transition-all ${
                        selectedStudents.includes(student.student_id) 
                          ? 'border-blue-500 bg-blue-50/50 shadow-sm' 
                          : 'border-slate-200/60 hover:border-blue-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="relative flex items-center justify-center shrink-0">
                        <input 
                          type="checkbox" 
                          className="peer sr-only"
                          checked={selectedStudents.includes(student.student_id)}
                          onChange={() => toggleStudentSelection(student.student_id)}
                        />
                        <div className={`h-6 w-6 sm:h-7 sm:w-7 rounded-lg border-2 transition-all flex items-center justify-center ${
                          selectedStudents.includes(student.student_id) 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                            : 'bg-white border-slate-300 text-transparent group-hover:border-blue-400'
                        }`}>
                          <CheckSquare size={14} strokeWidth={3} />
                        </div>
                      </div>
                      
                      <div className="h-10 w-10 sm:h-12 sm:w-12 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-500 text-[10px] sm:text-xs uppercase shrink-0 border border-white shadow-inner">
                        {student.first_name?.charAt(0) || "S"}{student.last_name?.charAt(0) || ""}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 text-sm sm:text-base truncate group-hover:text-blue-700 transition-colors">{student.first_name} {student.last_name}</p>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest truncate mt-0.5">{student.roll_no} • Dept {student.department_id}</p>
                      </div>
                    </label>
                  )) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                      <Users size={40} className="mb-4 opacity-20"/>
                      <p className="font-black uppercase tracking-widest text-[10px]">No students match filters</p>
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                  <p className="text-xs sm:text-sm font-black text-slate-600 w-full sm:w-auto text-center sm:text-left">
                    <span className="text-blue-600 text-base sm:text-lg mr-1">{selectedStudents.length}</span> selected
                  </p>
                  <button 
                    onClick={handleBulkAssignStudents} 
                    disabled={selectedStudents.length === 0 || assigning}
                    className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 sm:py-3.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-[0_8px_20px_rgba(37,99,235,0.25)] disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 active:scale-95"
                  >
                    {assigning ? <Loader2 className="animate-spin" size={18}/> : <CheckCircle2 size={18}/>} Confirm Roster
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  ); 
}