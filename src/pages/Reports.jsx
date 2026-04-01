import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, BookOpen, Building2, GraduationCap, Download, Loader2, 
  Search, CalendarDays, UserCheck, ClipboardList 
} from 'lucide-react';

export default function AdminReports() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); 
  const [searchTerm, setSearchTerm] = useState('');

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchMasterReport();
  }, []);

  const fetchMasterReport = async () => {
    try {
      const response = await axios.get("https://sams-zsar.onrender.com/admin/master-report", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReportData(response.data);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
      alert("Could not load analytics data.");
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!reportData) return;
    let csvContent = "data:text/csv;charset=utf-8,";

    // Export different data based on the active tab!
    if (activeTab === 'students') {
      csvContent += "Student ID,First Name,Last Name,Email,Department,Year\n";
      reportData.all_students.forEach(s => {
        csvContent += `${s.student_id},${s.first_name},${s.last_name},${s.email},${s.department_name},${s.year_of_study}\n`;
      });
    } else if (activeTab === 'faculty') {
      csvContent += "Faculty ID,First Name,Last Name,Email,Department\n";
      reportData.all_faculty.forEach(f => {
        csvContent += `${f.faculty_id},${f.first_name},${f.last_name},${f.email},${f.department_name}\n`;
      });
    } else if (activeTab === 'attendance') {
      csvContent += "Session ID,Date,Course,Faculty,Present,Total Enrolled,Attendance %\n";
      reportData.attendance_logs.forEach(l => {
        csvContent += `${l.session_id},${l.date},${l.course_name},${l.faculty_name},${l.students_present},${l.total_enrolled},${l.attendance_percentage}%\n`;
      });
    } else {
      // Default Overview Export
      csvContent += "Report Category,Metric,Value\n";
      csvContent += `Overview,Total Students,${reportData.overview.total_students}\n`;
      csvContent += `Overview,Total Faculty,${reportData.overview.total_faculty}\n`;
      csvContent += `Overview,Total Courses,${reportData.overview.total_courses}\n`;
      csvContent += `Overview,Total Classes Held,${reportData.overview.total_classes_held}\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sams_${activeTab}_report.csv`);
    document.body.appendChild(link);
    link.click();
  };

  // Filter helper for the tables
  const filterData = (dataArray, keys) => {
    if (!searchTerm) return dataArray;
    return dataArray.filter(item => 
      keys.some(key => String(item[key]).toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-blue-600 w-12 h-12" /></div>;
  }

  const TABS = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'courses', label: 'Courses', icon: ClipboardList },
    { id: 'students', label: 'All Students', icon: Users },
    { id: 'faculty', label: 'All Faculty', icon: GraduationCap },
    { id: 'attendance', label: 'Class Logs', icon: CalendarDays }
  ];

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-10">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <BookOpen className="text-blue-600" size={36} />
            Master Analytics
          </h1>
          <p className="text-slate-500 font-bold mt-2">Comprehensive data for all Students, Faculty, and Courses.</p>
        </div>
        <button onClick={downloadCSV} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black hover:bg-blue-600 transition-colors shadow-lg active:scale-95">
          <Download size={20} />
          Export {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} CSV
        </button>
      </div>

      {/* TOP STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Students</p>
          <h3 className="text-4xl font-black text-slate-900 mt-2">{reportData.overview.total_students}</h3>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Faculty</p>
          <h3 className="text-4xl font-black text-slate-900 mt-2">{reportData.overview.total_faculty}</h3>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Courses</p>
          <h3 className="text-4xl font-black text-slate-900 mt-2">{reportData.overview.total_courses}</h3>
        </div>
        <div className="bg-blue-600 text-white p-6 rounded-[2rem] shadow-lg">
          <p className="text-sm font-black text-blue-200 uppercase tracking-widest">Classes Held</p>
          <h3 className="text-4xl font-black mt-2">{reportData.overview.total_classes_held}</h3>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex flex-wrap gap-2 border-b-2 border-slate-100 pb-4">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button 
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-black transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-100'}`}
            >
              <Icon size={18} /> {tab.label}
            </button>
          )
        })}
      </div>

      {/* SEARCH BAR (Only show on list tabs) */}
      {['students', 'faculty', 'attendance', 'courses'].includes(activeTab) && (
        <div className="relative">
          <Search className="absolute left-4 top-4 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
      {/* TAB CONTENT: OVERVIEW (Year Breakdown) */}
      {activeTab === 'overview' && (
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
          <h3 className="text-xl font-black text-slate-900 mb-6">Student Distribution by Year</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {reportData.by_year.map(yearData => (
              <div key={yearData.year} className="p-6 bg-slate-50 rounded-2xl text-center border border-slate-100 hover:border-blue-200 transition-colors">
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Year {yearData.year}</p>
                <p className="text-4xl font-black text-slate-900">{yearData.count}</p>
                <p className="text-xs font-bold text-slate-400 mt-2">Students</p>
              </div>
            ))}
            {reportData.by_year.length === 0 && (
                <p className="col-span-full text-center text-slate-400 font-bold py-4">No student year data available.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: DEPARTMENTS */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportData.by_department.map(dept => (
            <div key={dept.department_id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="text-slate-400" />
                <h3 className="text-xl font-black text-slate-900">{dept.department_name}</h3>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl mb-2">
                <span className="font-bold text-slate-500">Students Enrolled</span>
                <span className="font-black text-slate-900 text-xl">{dept.student_count}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                <span className="font-bold text-slate-500">Assigned Faculty</span>
                <span className="font-black text-slate-900 text-xl">{dept.faculty_count}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT: COURSES */}
      {activeTab === 'courses' && (
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Course Code</th>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Course Name</th>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Active Enrollments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportData.by_course.map(course => (
                <tr key={course.course_id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-6 font-bold text-slate-500">{course.course_code}</td>
                  <td className="p-6 font-black text-slate-900">{course.course_name}</td>
                  <td className="p-6 font-black text-blue-600 text-right text-lg">{course.enrolled_students}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB CONTENT: STUDENTS */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Student</th>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Email</th>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Dept & Year</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filterData(reportData.all_students, ['first_name', 'last_name', 'email', 'department_name']).map(s => (
                <tr key={s.student_id} className="hover:bg-slate-50">
                  <td className="p-6 font-black text-slate-900">{s.first_name} {s.last_name}</td>
                  <td className="p-6 font-bold text-slate-500">{s.email}</td>
                  <td className="p-6 font-bold text-blue-600">{s.department_name} • Year {s.year_of_study}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB CONTENT: FACULTY */}
      {activeTab === 'faculty' && (
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Faculty Name</th>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Email</th>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Department</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filterData(reportData.all_faculty, ['first_name', 'last_name', 'email', 'department_name']).map(f => (
                <tr key={f.faculty_id} className="hover:bg-slate-50">
                  <td className="p-6 font-black text-slate-900">Prof. {f.first_name} {f.last_name}</td>
                  <td className="p-6 font-bold text-slate-500">{f.email}</td>
                  <td className="p-6 font-bold text-blue-600">{f.department_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB CONTENT: ATTENDANCE LOGS */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Course & Faculty</th>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filterData(reportData.attendance_logs, ['course_name', 'faculty_name', 'date']).map(log => (
                <tr key={log.session_id} className="hover:bg-slate-50">
                  <td className="p-6 font-black text-slate-900">{log.date}</td>
                  <td className="p-6">
                    <p className="font-black text-slate-900">{log.course_name}</p>
                    <p className="font-bold text-slate-500 text-sm">By {log.faculty_name}</p>
                  </td>
                  <td className="p-6 text-right">
                    <p className="font-black text-blue-600 text-lg">{log.students_present} / {log.total_enrolled}</p>
                    <p className="font-bold text-slate-400 text-xs">{log.attendance_percentage}% Present</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* KEEP EXISTING DEPARTMENTS, COURSES, AND OVERVIEW CODE BELOW */}
      {/* ... (Overview, Departments, and Courses UI remain similar to the previous version, just styled to match) ... */}
      
    </div>
  );
}