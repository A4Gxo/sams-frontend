import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Users, Search, X, Edit3, Trash2, Loader2,
  Building2, UserPlus, ArrowRight, Save, 
  User, Mail, Hash, Calendar, AlertCircle, ChevronDown, GraduationCap
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Students() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- UI & MODAL STATES ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); 
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false); 
  const [searchTerm, setSearchTerm] = useState("");

  // --- FORM STATES ---
  const [addForm, setAddForm] = useState({
    username: "", password: "password123", first_name: "", last_name: "",
    roll_no: "", department_id: "", year_of_study: 1, role: "student"
  });
  const [editForm, setEditForm] = useState({});

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentRes, deptRes] = await Promise.all([
        axios.get("http://127.0.0.1:8000/students/", { headers }),
        axios.get("http://127.0.0.1:8000/departments/", { headers })
      ]);
      setStudents(studentRes.data);
      setDepartments(deptRes.data);
    } catch (err) {
      console.error("Data Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterStudent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { 
        ...addForm, 
        department_id: parseInt(addForm.department_id), 
        year_of_study: parseInt(addForm.year_of_study) 
      };
      await axios.post("http://127.0.0.1:8000/auth/register", payload);
      setIsAddModalOpen(false);
      fetchData();
      setAddForm({ username: "", password: "password123", first_name: "", last_name: "", roll_no: "", department_id: "", year_of_study: 1, role: "student" });
    } catch (err) {
      alert("Registration failed. Ensure the Roll No or Email is unique.");
    } finally { setIsSubmitting(false); }
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.put(`http://127.0.0.1:8000/students/${selectedStudent.student_id}`, editForm, { headers });
      setIsEditing(false);
      setIsProfileModalOpen(false);
      fetchData();
    } catch (err) {
      alert("Update failed.");
    } finally { setIsSubmitting(false); }
  };

  const handleDeleteStudent = async () => {
    if (!window.confirm(`Delete ${selectedStudent.first_name} permanently?`)) return;
    setIsSubmitting(true);
    try {
      await axios.delete(`http://127.0.0.1:8000/students/${selectedStudent.student_id}`, { headers });
      setIsProfileModalOpen(false);
      fetchData();
    } catch (err) {
      alert("Delete failed.");
    } finally { setIsSubmitting(false); }
  };

  const filteredStudents = students.filter((s) => {
    const searchTarget = `${s.first_name} ${s.last_name} ${s.roll_no} ${s.username}`.toLowerCase();
    return searchTarget.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-12 pt-6 px-4 sm:px-6 lg:px-8">
      
      {/* 1. Header Area */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Users size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Directory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Student Records</h1>
          <p className="text-sm font-bold text-slate-500 mt-1">Manage enrollments and academic profiles.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="group w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-blue-600 active:scale-95 shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_20px_rgba(37,99,235,0.3)]"
        >
          <UserPlus size={18} className="transition-transform group-hover:scale-110" /> Add Student
        </button>
      </header>

      {/* 2. Search Bar */}
      <div className="relative w-full md:w-[400px] group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Search by name, roll, or email..." 
          className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200/60 shadow-sm rounded-2xl font-bold text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X size={16} />
          </button>
        )}
      </div>

      {/* 3. Students List/Grid */}
      <main className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col h-[400px] items-center justify-center gap-4 text-slate-500">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <p className="font-black uppercase tracking-widest text-[10px]">Loading Records...</p>
          </div>
        ) : (
          <>
            {/* Desktop Header Row */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-8 py-5 bg-slate-50/80 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <div className="col-span-5">Student Info</div>
              <div className="col-span-3">Roll Number</div>
              <div className="col-span-3">Batch Details</div>
              <div className="col-span-1 text-right">Profile</div>
            </div>

            {/* List Items */}
            <div className="p-4 sm:p-0 divide-y divide-slate-50">
              {filteredStudents.length > 0 ? filteredStudents.map((s) => (
                <div 
                  key={s.student_id} 
                  onClick={() => { setSelectedStudent(s); setIsProfileModalOpen(true); }}
                  className="group p-4 sm:px-8 sm:py-5 transition-all hover:bg-blue-50/30 flex flex-col sm:grid sm:grid-cols-12 sm:items-center gap-4 border sm:border-none border-slate-100 rounded-2xl sm:rounded-none mb-3 sm:mb-0 cursor-pointer"
                >
                  {/* Info */}
                  <div className="sm:col-span-5 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-white shadow-inner flex items-center justify-center font-black text-slate-600 text-sm uppercase shrink-0 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-blue-600 group-hover:text-white transition-all">
                      {s.first_name[0]}{s.last_name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-slate-900 text-base truncate group-hover:text-blue-700 transition-colors">{s.first_name} {s.last_name}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 truncate flex items-center gap-1">
                        <Mail size={10} /> {s.username}
                      </p>
                    </div>
                  </div>

                  {/* Roll Number */}
                  <div className="sm:col-span-3 flex sm:block items-center justify-between sm:justify-start">
                    <span className="sm:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Roll No:</span>
                    <span className="font-mono text-xs font-black bg-slate-100/80 px-3 py-1.5 rounded-lg text-slate-600 border border-slate-200/50">
                      {s.roll_no}
                    </span>
                  </div>

                  {/* Batch Details */}
                  <div className="sm:col-span-3 flex sm:block items-center justify-between sm:justify-start">
                    <span className="sm:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Course:</span>
                    <div className="text-right sm:text-left">
                      <p className="text-[10px] font-black text-slate-600 uppercase flex items-center sm:justify-start justify-end gap-1.5">
                        <Building2 size={12} className="text-blue-500" /> 
                        <span className="truncate max-w-[120px] sm:max-w-none">{departments.find(d => d.department_id === s.department_id)?.department_name || "N/A"}</span>
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Year {s.year_of_study}</p>
                    </div>
                  </div>

                  {/* Indicator */}
                  <div className="hidden sm:flex sm:col-span-1 justify-end text-slate-300 group-hover:text-blue-500 transition-colors">
                    <ArrowRight size={18} />
                  </div>
                </div>
              )) : (
                <div className="p-20 text-center flex flex-col items-center">
                  <AlertCircle className="text-slate-300 mb-4" size={48} />
                  <p className="font-black text-slate-400 uppercase tracking-widest text-xs">
                    {searchTerm ? "No matching students found" : "Directory is empty"}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* --- ADD MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-slate-900">Register Student</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Add to Academic Directory</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-200/50 rounded-full transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleRegisterStudent} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">First Name</label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                    <input required placeholder="John" className="w-full pl-9 pr-4 py-3.5 bg-slate-50 border border-slate-200/60 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all" 
                      value={addForm.first_name} onChange={(e) => setAddForm({...addForm, first_name: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Last Name</label>
                  <input required placeholder="Doe" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200/60 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all" 
                    value={addForm.last_name} onChange={(e) => setAddForm({...addForm, last_name: e.target.value})} />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                  <input required type="email" placeholder="student@university.edu" className="w-full pl-9 pr-4 py-3.5 bg-slate-50 border border-slate-200/60 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all" 
                    value={addForm.username} onChange={(e) => setAddForm({...addForm, username: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Roll Number</label>
                  <div className="relative group">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                    <input required placeholder="e.g. 21BCE001" className="w-full pl-9 pr-4 py-3.5 bg-slate-50 border border-slate-200/60 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all uppercase" 
                      value={addForm.roll_no} onChange={(e) => setAddForm({...addForm, roll_no: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Year of Study</label>
                  <div className="relative group">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                    <select className="w-full pl-9 pr-10 py-3.5 bg-slate-50 border border-slate-200/60 rounded-xl text-sm font-bold text-slate-900 outline-none appearance-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer" 
                      onChange={(e) => setAddForm({...addForm, year_of_study: e.target.value})}>
                      <option value="1">1st Year</option><option value="2">2nd Year</option><option value="3">3rd Year</option><option value="4">4th Year</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Department</label>
                <div className="relative group">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                  <select required className="w-full pl-9 pr-10 py-3.5 bg-slate-50 border border-slate-200/60 rounded-xl text-sm font-bold text-slate-900 outline-none appearance-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer" 
                    onChange={(e) => setAddForm({...addForm, department_id: e.target.value})}>
                    <option value="" disabled selected>Select Department...</option>
                    {departments.map(d => <option key={d.department_id} value={d.department_id}>{d.department_name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                </div>
              </div>
              
              <button type="submit" disabled={isSubmitting} className="w-full mt-4 py-4 bg-slate-900 text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.3)] hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                {isSubmitting ? <><Loader2 className="animate-spin" size={18}/> Processing...</> : <><UserPlus size={18}/> Create Account</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- PROFILE / EDIT MODAL --- */}
      {isProfileModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-inner flex items-center justify-center font-black text-lg uppercase border-2 border-white">
                  {selectedStudent.first_name[0]}{selectedStudent.last_name[0]}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">{isEditing ? "Edit Records" : "Student Profile"}</h2>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-0.5">ID: #{selectedStudent.student_id}</p>
                </div>
              </div>
              <button onClick={() => { setIsProfileModalOpen(false); setIsEditing(false); }} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-200/50 rounded-full transition-colors"><X size={20}/></button>
            </div>

            <div className="p-8 sm:p-10 space-y-8">
              {!isEditing ? (
                <>
                  <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><User size={12}/> Full Name</p>
                      <p className="text-base font-black text-slate-900">{selectedStudent.first_name} {selectedStudent.last_name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Hash size={12}/> Roll Number</p>
                      <p className="text-base font-black text-slate-900 uppercase">{selectedStudent.roll_no}</p>
                    </div>
                    <div className="space-y-1 col-span-2 sm:col-span-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Building2 size={12}/> Department</p>
                      <p className="text-sm font-bold text-slate-900">{departments.find(d => d.department_id === selectedStudent.department_id)?.department_name || "N/A"}</p>
                    </div>
                    <div className="space-y-1 col-span-2 sm:col-span-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><GraduationCap size={12}/> Academic Year</p>
                      <p className="text-sm font-bold text-slate-900">Year {selectedStudent.year_of_study}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button 
                      onClick={() => navigate("/dashboard/assign")} 
                      className="flex-[2] py-4 rounded-xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-md active:scale-95"
                    >
                      Assign Courses <ArrowRight size={16} />
                    </button>
                    <div className="flex gap-3 flex-1">
                      <button 
                        onClick={() => { setEditForm(selectedStudent); setIsEditing(true); }} 
                        className="flex-1 py-4 rounded-xl bg-slate-100 text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center justify-center"
                      >
                        <Edit3 size={16}/>
                      </button>
                      <button 
                        onClick={handleDeleteStudent} 
                        disabled={isSubmitting} 
                        className="flex-1 py-4 rounded-xl bg-red-50 text-red-600 font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center"
                      >
                        {isSubmitting ? <Loader2 className="animate-spin" size={16}/> : <Trash2 size={16}/>}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <form onSubmit={handleUpdateStudent} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">First Name</label>
                      <input className="w-full p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all" 
                        value={editForm.first_name || ""} onChange={(e) => setEditForm({...editForm, first_name: e.target.value})} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Last Name</label>
                      <input className="w-full p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all" 
                        value={editForm.last_name || ""} onChange={(e) => setEditForm({...editForm, last_name: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Roll Number</label>
                    <input className="w-full p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all uppercase" 
                      value={editForm.roll_no || ""} onChange={(e) => setEditForm({...editForm, roll_no: e.target.value})} />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
                    <button type="submit" disabled={isSubmitting} className="flex-[2] py-4 rounded-xl bg-blue-600 text-white font-black text-xs uppercase tracking-widest shadow-md hover:bg-blue-500 transition-all active:scale-95 flex items-center justify-center gap-2">
                      {isSubmitting ? <Loader2 className="animate-spin" size={16}/> : <><Save size={16} /> Save Changes</>}
                    </button>
                    <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-4 rounded-xl bg-slate-100 text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}