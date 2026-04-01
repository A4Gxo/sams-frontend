import { useState, useEffect } from "react";
import axios from "axios";
import { 
  GraduationCap, Search, X, Edit3, Trash2, Loader2,
  Building2, UserPlus, Save, Mail, ChevronRight, AlertCircle,
  User, Lock, ChevronDown
} from "lucide-react";

export default function Faculty() {
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); 
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Form States
  const [addForm, setAddForm] = useState({
    username: "", password_hash: "", first_name: "", last_name: "",
    department_id: "", role: "faculty"
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
      const [facultyRes, deptRes] = await Promise.all([
        axios.get("http://127.0.0.1:8000/faculty/", { headers }),
        axios.get("http://127.0.0.1:8000/departments/", { headers })
      ]);
      setFaculty(facultyRes.data);
      setDepartments(deptRes.data);
    } catch (err) { 
      console.error("Fetch error:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...addForm, department_id: parseInt(addForm.department_id) };
      await axios.post("http://127.0.0.1:8000/admin/faculty", payload);
      setIsAddModalOpen(false);
      await fetchData(); // Refresh list immediately
      setAddForm({ username: "", password_hash: "", first_name: "", last_name: "", department_id: "", role: "faculty" });
    } catch (err) { 
      alert(err.response?.data?.detail || "Registration failed."); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Clean payload: send only first/last name and dept
      const payload = {
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        department_id: parseInt(editForm.department_id)
      };
      await axios.put(`http://127.0.0.1:8000/faculty/${selectedFaculty.faculty_id}`, payload, { headers });
      setIsEditing(false);
      setIsProfileModalOpen(false);
      fetchData();
    } catch (err) { 
      alert("Update failed."); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Remove ${selectedFaculty.first_name}?`)) return;
    setIsSubmitting(true);
    try {
      await axios.delete(`http://127.0.0.1:8000/faculty/${selectedFaculty.faculty_id}`, { headers });
      setIsProfileModalOpen(false);
      fetchData();
    } catch (err) { 
      alert("Delete failed. Faculty may have active course assignments."); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const filteredFaculty = faculty.filter(f => 
    `${f.first_name} ${f.last_name} ${f.username}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-12 pt-6 px-4 sm:px-6 lg:px-8">
      
      {/* HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <GraduationCap size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Directory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Faculty Directory</h1>
          <p className="text-sm font-bold text-slate-500 mt-1">Manage academic staff and department access.</p>
        </div>
        
        <button 
          onClick={() => setIsAddModalOpen(true)} 
          className="group w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-blue-600 active:scale-95 shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_20px_rgba(37,99,235,0.3)]"
        >
          <UserPlus size={18} className="transition-transform group-hover:scale-110" /> Add Faculty
        </button>
      </header>

      {/* SEARCH BAR */}
      <div className="relative w-full md:w-[400px] group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Search by name or email..." 
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

      {/* DATA DISPLAY */}
      <main className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col h-[400px] items-center justify-center gap-4 text-slate-500">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <p className="font-black uppercase tracking-widest text-[10px]">Loading Directory...</p>
          </div>
        ) : (
          <>
            {/* Desktop Header Row */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-8 py-5 bg-slate-50/80 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <div className="col-span-6">Faculty Member</div>
              <div className="col-span-4 text-center">Department</div>
              <div className="col-span-2 text-right">Profile</div>
            </div>

            {/* List Items */}
            <div className="p-4 sm:p-0 divide-y divide-slate-50">
              {filteredFaculty.length > 0 ? filteredFaculty.map((f) => (
                <div 
                  key={f.faculty_id} 
                  onClick={() => { setSelectedFaculty(f); setEditForm(f); setIsProfileModalOpen(true); }}
                  className="group p-4 sm:px-8 sm:py-5 transition-all hover:bg-blue-50/30 flex flex-col sm:grid sm:grid-cols-12 sm:items-center gap-4 border sm:border-none border-slate-100 rounded-2xl sm:rounded-none mb-3 sm:mb-0 cursor-pointer"
                >
                  
                  {/* Faculty Info */}
                  <div className="sm:col-span-6 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-white shadow-inner flex items-center justify-center font-black text-slate-600 text-sm uppercase shrink-0 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-blue-600 group-hover:text-white transition-all">
                      {f.first_name[0]}{f.last_name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-slate-900 text-base truncate group-hover:text-blue-700 transition-colors">{f.first_name} {f.last_name}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 truncate flex items-center gap-1">
                        <Mail size={10} /> {f.username}
                      </p>
                    </div>
                  </div>

                  {/* Department Badge */}
                  <div className="sm:col-span-4 flex sm:justify-center items-center justify-between sm:block">
                    <span className="sm:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Dept:</span>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-black bg-blue-50/80 text-blue-700 px-3 py-1.5 rounded-lg uppercase tracking-widest border border-blue-100/50">
                      <Building2 size={12} />
                      {departments.find(d => d.department_id === f.department_id)?.department_name || "General"}
                    </span>
                  </div>

                  {/* Indicator */}
                  <div className="hidden sm:flex sm:col-span-2 justify-end text-slate-300 group-hover:text-blue-500 transition-colors">
                    <ChevronRight size={18} />
                  </div>
                </div>
              )) : (
                <div className="p-20 text-center flex flex-col items-center">
                  <AlertCircle className="text-slate-300 mb-4" size={48} />
                  <p className="font-black text-slate-400 uppercase tracking-widest text-xs">
                    {searchTerm ? "No matching faculty found" : "Directory is empty"}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* --- ADD MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-slate-900">New Registration</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Add Faculty to Directory</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-200/50 rounded-full transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleRegister} className="p-8 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">First Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                    <input required placeholder="John" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200/60 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all" 
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
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                  <input required type="email" placeholder="faculty@university.edu" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200/60 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all" 
                    value={addForm.username} onChange={(e) => setAddForm({...addForm, username: e.target.value})} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Initial Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                  <input required type="password" placeholder="Assign secure password" minLength={6} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200/60 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all" 
                    value={addForm.password_hash} onChange={(e) => setAddForm({...addForm, password_hash: e.target.value})} />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Department</label>
                <div className="relative group">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                  <select required className="w-full pl-11 pr-10 py-3.5 bg-slate-50 border border-slate-200/60 rounded-xl text-sm font-bold text-slate-900 outline-none appearance-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer" 
                    value={addForm.department_id} onChange={(e) => setAddForm({...addForm, department_id: e.target.value})}>
                    <option value="" disabled>Select Department...</option>
                    {departments.map(d => <option key={d.department_id} value={d.department_id}>{d.department_name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                </div>
              </div>
              
              <button type="submit" disabled={isSubmitting} className="w-full mt-4 py-4 bg-slate-900 text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.3)] hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                {isSubmitting ? <><Loader2 className="animate-spin" size={18}/> Processing...</> : <><UserPlus size={18}/> Create Account</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- PROFILE / EDIT MODAL --- */}
      {isProfileModalOpen && selectedFaculty && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-inner flex items-center justify-center font-black text-lg uppercase border-2 border-white">
                  {selectedFaculty.first_name[0]}{selectedFaculty.last_name[0]}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">{isEditing ? "Modify Record" : "Faculty Profile"}</h2>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-0.5">Access Control active</p>
                </div>
              </div>
              <button onClick={() => { setIsProfileModalOpen(false); setIsEditing(false); }} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-200/50 rounded-full transition-colors"><X size={20}/></button>
            </div>

            <div className="p-8 sm:p-10 space-y-8">
              {!isEditing ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><User size={12}/> Full Name</p>
                      <p className="text-base font-black text-slate-900">{selectedFaculty.first_name} {selectedFaculty.last_name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Mail size={12}/> Email / Username</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{selectedFaculty.username}</p>
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Building2 size={12}/> Department</p>
                      <p className="text-sm font-bold text-slate-900">
                        {departments.find(d => d.department_id === selectedFaculty.department_id)?.department_name || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button 
                      onClick={() => setIsEditing(true)} 
                      className="flex-[2] py-4 rounded-xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Edit3 size={16}/> Edit Record
                    </button>
                    <button 
                      onClick={handleDelete} 
                      disabled={isSubmitting} 
                      className="flex-1 py-4 rounded-xl border-2 border-red-50 text-red-600 font-black text-xs uppercase tracking-widest hover:bg-red-50 hover:border-red-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" size={16}/> : <><Trash2 size={16}/> Remove</>}
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleUpdate} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Change Department</label>
                    <div className="relative group">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                      <select className="w-full pl-11 pr-10 py-3.5 bg-slate-50 border border-slate-200/60 rounded-xl text-sm font-bold text-slate-900 outline-none appearance-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer" 
                        value={editForm.department_id || ""} onChange={(e) => setEditForm({...editForm, department_id: e.target.value})}>
                        {departments.map(d => <option key={d.department_id} value={d.department_id}>{d.department_name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-blue-500 transition-colors" size={18} />
                    </div>
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