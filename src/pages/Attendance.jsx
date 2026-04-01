import { useState, useEffect } from "react";
import { Check, X, Save, Users, Calendar, Search, CheckCircle2 } from "lucide-react";

export default function Attendance() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // 1. Fetch courses assigned to this faculty on load
  useEffect(() => {
    // In a real app, you'd fetch from: https://sams-zsar.onrender.com/courses/
    // For now, using mock data to show the UI
    setCourses([
      { id: 1, name: "Data Structures", code: "CS101" },
      { id: 2, name: "Database Management", code: "CS202" },
      { id: 3, name: "Web Development", code: "CS303" },
    ]);
  }, []);

  // 2. Mock fetching students when course changes
  const handleCourseChange = (courseId) => {
    setSelectedCourse(courseId);
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      setStudents([
        { id: 101, name: "Arjun Mehta", roll: "2024CS01", status: "present" },
        { id: 102, name: "Sanya Iyer", roll: "2024CS02", status: "present" },
        { id: 103, name: "Rohan Das", roll: "2024CS03", status: "present" },
        { id: 104, name: "Priya Sharma", roll: "2024CS04", status: "present" },
      ]);
      setIsLoading(false);
    }, 600);
  };

  const toggleStatus = (id) => {
    setStudents(students.map(s => 
      s.id === id ? { ...s, status: s.status === "present" ? "absent" : "present" } : s
    ));
  };

  const markAllPresent = () => {
    setStudents(students.map(s => ({ ...s, status: "present" })));
  };

  const handleSubmit = async () => {
    setMessage({ type: "info", text: "Saving attendance..." });
    // Logic to loop through 'students' and POST to https://sams-zsar.onrender.com/attendance/
    setTimeout(() => {
      setMessage({ type: "success", text: "Attendance marked successfully!" });
    }, 1500);
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.roll.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mark Attendance</h1>
          <p className="text-slate-500">Select a course and date to record attendance.</p>
        </div>
        
        {selectedCourse && students.length > 0 && (
          <button 
            onClick={handleSubmit}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95"
          >
            <Save size={18} />
            Submit Attendance
          </button>
        )}
      </div>

      {/* Selectors Card */}
      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Course / Subject</label>
          <div className="relative">
            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select 
              className="w-full rounded-xl border-slate-200 bg-slate-50 py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500/20"
              value={selectedCourse}
              onChange={(e) => handleCourseChange(e.target.value)}
            >
              <option value="">Select a course...</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="date" 
              className="w-full rounded-xl border-slate-200 bg-slate-50 py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500/20"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Quick Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or roll..."
              className="w-full rounded-xl border-slate-200 bg-slate-50 py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Success/Error Alerts */}
      {message.text && (
        <div className={`rounded-xl border p-4 ${message.type === 'success' ? 'border-green-200 bg-green-50 text-green-800' : 'border-blue-200 bg-blue-50 text-blue-800'}`}>
          {message.text}
        </div>
      )}

      {/* Student List Table */}
      {selectedCourse ? (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <div className="flex items-center gap-2 font-bold text-slate-700">
              <Users size={18} />
              <span>Student List ({filteredStudents.length})</span>
            </div>
            <button 
              onClick={markAllPresent}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <CheckCircle2 size={14} /> Mark All Present
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4">Roll No</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-600">{student.roll}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{student.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => toggleStatus(student.id)}
                          className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest transition-all ${
                            student.status === "present" 
                            ? "bg-green-100 text-green-700 ring-1 ring-green-600/20" 
                            : "bg-red-100 text-red-700 ring-1 ring-red-600/20"
                          }`}
                        >
                          {student.status === "present" ? <Check size={14} /> : <X size={14} />}
                          {student.status}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredStudents.length === 0 && !isLoading && (
            <div className="py-20 text-center text-slate-400">
              No students found for this course.
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 py-32 text-slate-400">
          <BookOpen size={48} className="mb-4 opacity-20" />
          <p className="text-lg font-medium">Please select a course to begin marking attendance.</p>
        </div>
      )}
    </div>
  );
}