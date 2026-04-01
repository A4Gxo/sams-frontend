import { useState, useEffect } from "react";
import axios from "axios";
import { 
  GraduationCap, Search, X, Edit3, Trash2, Loader2,
  Building2, UserPlus, Save, Filter, ChevronDown, AlertCircle, Mail, User
} from "lucide-react";

export default function Faculty() {
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI & Filter States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); 
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("all"); 

  // Forms
  const [addForm, setAddForm] = useState({
    username: "", password: "faculty123", first_name: "", last_name: "",
    department_id: "", role: "faculty"
  });
  const [editForm, setEditForm] = useState({ first_name: "", last_name: "", department_id: "" });

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchData();
  }, [searchTerm]); // Added searchTerm to dependency array so it refetches dynamically if you want server-side search, otherwise remove it for client-side only.

  const fetchData = async () => {
    setLoading(true);
    try {
      const url = searchTerm 
        ? `https://sams-zsar.onrender.com/faculty/?search=${searchTerm}` 
        : `https://sams-zsar.onrender.com/faculty/`;

      const [facultyRes, deptRes] = await Promise.all([
        axios.get(url, { headers }),
        axios.get("https://sams-zsar.onrender.com/departments/", { headers })
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
      await axios.post("https://sams-zsar.onrender.com/auth/register", payload);
      setIsAddModalOpen(false);
      setAddForm({ username: "", password: "faculty123", first_name: "", last_name: "", department_id: "", role: "faculty" });
      await fetchData(); 
    } catch (err) {
      alert("Registration failed. Check if username/email is unique.");
    } finally { setIsSubmitting(false); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        first_name: editForm.first_name.trim(),
        last_name: editForm.last_name.trim(),
        department_id: parseInt(editForm.department_id)
      };

      await axios.put(
        `https://sams-zsar.onrender.com/faculty/${selectedFaculty.faculty_id}`, 
        payload, 
        { headers }
      );
      
      setIsEditModalOpen(false);
      fetchData(); 
    } catch (err) {
      console.error("Update Error Details:", err.response?.data);
      alert(err.response?.data?.detail || "Update failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (fId, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name}?`)) return;
    try {
      await axios.delete(`https://sams-zsar.onrender.com/faculty/${fId}`, { headers });
      fetchData();
    } catch (err) { alert("Delete failed. This faculty may have course assignments."); }
  };

  const filteredFaculty = faculty.filter((f) => {
    const matchesSearch = `${f.first_name} ${f.last_name} ${f.username}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === "all" || String(f.department_id) === String(selectedDept);
    return matchesSearch && matchesDept;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-12 pt-6 px-4 sm:px-6 lg:px-8">
      
      {/* HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <GraduationCap size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Directory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Faculty Management</h1>
          <p className="text-sm font-bold text-slate-500 mt-1">Manage staff access and department assignments.</p>
        </div>
        
        <button 
          onClick={() => setIsAddModalOpen(true)} 
          className="group w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-blue-600 active:scale-95 shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_20px_rgba(37,99,235,0.3)]"
        >
          <UserPlus size={18} className="transition-transform group-hover:scale-110" /> Add Faculty
        </button>
      </header>

      {/* FILTER TOOLBAR */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200/60 shadow-sm rounded-2xl font-bold text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-72 relative group">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors z-10" size={18} />
          <select 
            className="w-full pl-12 pr-10 py-4 bg-white border border-slate-200/60 shadow-sm rounded-2xl font-bold text-sm text-slate-900 appearance-none cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
            value={selectedDept} 
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option value="all">All Departments</option>
            {departments.map(d => <option key={d.department_id} value={d.department_id}>{d.department_name}</option>)}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-blue-500 transition-colors" size={18} />
        </div>
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
            {/* Desktop Header Row (Hidden on Mobile) */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-8 py-5 bg-slate-50/80 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <div className="col-span-6">Faculty Member</div>
              <div className="col-span-4 text-center">Department</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* List Items */}
            <div className="p-4 sm:p-0 divide-y divide-slate-50">
              {filteredFaculty.length > 0 ? filteredFaculty.map((f) => (
                <div key={f.faculty_id} className="group p-4 sm:px-8 sm:py-5 transition-all hover:bg-slate-50/50 flex flex-col sm:grid sm:grid-cols-12 sm:items-center gap-4 border sm:border-none border-slate-100 rounded-2xl sm:rounded-none mb-3 sm:mb-0">
                  
                  {/* Faculty Info */}
                  <div className="sm:col-span-6 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-white shadow-inner flex items-center justify-center font-black text-slate-600 text-sm uppercase shrink-0">
                      {f.first_name[0]}{f.last_name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-slate-900 text-base truncate">{f.first_name} {f.last_name}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 truncate flex items-center gap-1">
                        <Mail size={10} /> {f.username}
                      </p>
                    </div>
                  </div>

                  {/* Department Badge */}
                  <div className="sm:col-span-4 flex sm:justify-center">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-black bg-blue-50/80 text-blue-700 px-3 py-1.5 rounded-lg uppercase tracking-widest border border-blue-100/50">
                      <Building2 size={12} />
                      {departments.find(d => d.department_id === f.department_id)?.department_name || "General"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="sm:col-span-2 flex justify-end gap-2 mt-2 sm:mt-0 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                    <button 
                      onClick={() => { setSelectedFaculty(f); setEditForm(f); setIsEditModalOpen(true); }}
                      className="flex-1 sm:flex-none flex items-center justify-center p-2.5 bg-slate-50 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors active:scale-95 border border-slate-100 hover:border-blue-100"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(f.faculty_id, f.first_name)}
                      className="flex-1 sm:flex-none flex items-center justify-center p-2.5 bg-slate-50 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors active:scale-95 border border-slate-100 hover:border-red-100"
                    >
                      <Trash2 size={16} />
                    </button>
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

      {/* --- EDIT MODAL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-slate-900">Modify Record</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Update Faculty Details</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-200/50 rounded-full transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">First Name</label>
                  <input required className="w-full p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all" 
                    value={editForm.first_name} onChange={(e) => setEditForm({...editForm, first_name: e.target.value})} placeholder="e.g. John" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Last Name</label>
                  <input required className="w-full p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all" 
                    value={editForm.last_name} onChange={(e) => setEditForm({...editForm, last_name: e.target.value})} placeholder="e.g. Doe" />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Department</label>
                <div className="relative group">
                  <select required className="w-full pl-4 pr-10 py-3.5 bg-slate-50 border border-slate-200/60 rounded-xl text-sm font-bold text-slate-900 outline-none appearance-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer" 
                    value={editForm.department_id} onChange={(e) => setEditForm({...editForm, department_id: e.target.value})}>
                    <option value="" disabled>Assign Department</option>
                    {departments.map(d => <option key={d.department_id} value={d.department_id}>{d.department_name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" size={18} />
                </div>
              </div>
              
              <button type="submit" disabled={isSubmitting} className="w-full mt-4 py-4 bg-blue-600 text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : <><Save size={18}/> Save Changes</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-slate-900">New Registration</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Add Faculty to Directory</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-200/50 rounded-full transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleRegister} className="p-8 space-y-5">
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
                  <input required type="email" placeholder="faculty@university.edu" className="w-full pl-9 pr-4 py-3.5 bg-slate-50 border border-slate-200/60 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all" 
                    value={addForm.username} onChange={(e) => setAddForm({...addForm, username: e.target.value})} />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Department</label>
                <div className="relative group">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                  <select required className="w-full pl-9 pr-10 py-3.5 bg-slate-50 border border-slate-200/60 rounded-xl text-sm font-bold text-slate-900 outline-none appearance-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer" 
                    value={addForm.department_id} onChange={(e) => setAddForm({...addForm, department_id: e.target.value})}>
                    <option value="" disabled>Select Department...</option>
                    {departments.map(d => <option key={d.department_id} value={d.department_id}>{d.department_name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" size={18} />
                </div>
              </div>
              
              <button type="submit" disabled={isSubmitting} className="w-full mt-4 py-4 bg-slate-900 text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.3)] hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                {isSubmitting ? <><Loader2 className="animate-spin" size={18}/> Processing...</> : <><UserPlus size={18}/> Create Account</>}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}