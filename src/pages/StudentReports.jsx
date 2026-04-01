import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, FileText, CheckCircle, XCircle, BarChart3, Loader2 } from 'lucide-react';

export default function Reports() {
  const userName = localStorage.getItem("userName") || "User";
  const token = localStorage.getItem("token");
  const studentId = localStorage.getItem("studentId");
  
  // Get the user's role to determine which API to call
  const rawRole = localStorage.getItem("userRole") || "student";
  const userRole = rawRole.toLowerCase().trim();

  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        let normalizedData = [];

        if (userRole === "faculty") {
          // --- FACULTY FETCH ---
          const res = await axios.get(`http://localhost:8000/faculty/reports-data`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          // Map the faculty backend keys to match the frontend table exactly
          normalizedData = (res.data.course_reports || []).map((course, index) => ({
            id: `fac-${index}`,
            subject: course.subject_name,
            totalClasses: course.total_classes,
            present: course.present,
            absent: course.absent,
            percentage: course.percentage
          }));

        } else {
          // --- STUDENT FETCH ---
          if (!studentId) {
            console.error("No student ID found!");
            setLoading(false);
            return;
          }
          const res = await axios.get(`http://localhost:8000/student/reports/${studentId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          normalizedData = res.data || [];
        }

        setAttendanceData(normalizedData);
      } catch (error) {
        console.error("Failed to load reports", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [token, studentId, userRole]);

  // --- AUTOMATIC MATH AGGREGATION ---
  // This works beautifully for BOTH Faculty and Students because we normalized the data above!
  const totalClassesOverall = attendanceData.reduce((acc, curr) => acc + curr.totalClasses, 0);
  const totalPresentOverall = attendanceData.reduce((acc, curr) => acc + curr.present, 0);
  const totalAbsentOverall = attendanceData.reduce((acc, curr) => acc + curr.absent, 0);
  const cumulativePercentage = totalClassesOverall > 0 
    ? ((totalPresentOverall / totalClassesOverall) * 100).toFixed(1) 
    : "0.0";

  // --- CSV DOWNLOAD LOGIC ---
  const handleDownloadReport = () => {
    const subjectHeader = userRole === "faculty" ? "Taught Subjects" : "Enrolled Subjects";
    const headers = [subjectHeader, "Total Classes", "Present", "Absent", "Attendance %"];
    
    const rows = attendanceData.map(row => 
      `"${row.subject}",${row.totalClasses},${row.present},${row.absent},"${row.percentage}%"`
    );
    
    rows.push(`"CUMULATIVE TOTAL",${totalClassesOverall},${totalPresentOverall},${totalAbsentOverall},"${cumulativePercentage}%"`);

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `SAMS_${userRole}_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Header & Download Button */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <FileText className="text-blue-600" size={32} /> 
            Academic Reports
          </h2>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">
            {userRole === "faculty" ? "Faculty Teaching Records" : "Detailed Attendance Records"}
          </p>
        </div>
        
        <button 
          onClick={handleDownloadReport}
          disabled={attendanceData.length === 0}
          className="group flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3.5 text-sm font-black text-white transition-all hover:bg-blue-600 active:scale-95 shadow-lg shadow-slate-200 disabled:opacity-50"
        >
          <Download size={18} className="transition-transform group-hover:-translate-y-1" />
          Download CSV Report
        </button>
      </div>

      {/* Cumulative Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Cumulative %</p>
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${cumulativePercentage >= 75 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              <BarChart3 size={24} />
            </div>
            <p className="text-3xl font-black text-slate-900">{cumulativePercentage}%</p>
          </div>
        </div>
        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Classes</p>
          <p className="text-3xl font-black text-slate-900 pl-1">{totalClassesOverall}</p>
        </div>
        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-green-600 mb-2 flex items-center gap-1"><CheckCircle size={14}/> Total Present</p>
          <p className="text-3xl font-black text-slate-900 pl-1">{totalPresentOverall}</p>
        </div>
        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-2 flex items-center gap-1"><XCircle size={14}/> Total Absent</p>
          <p className="text-3xl font-black text-slate-900 pl-1">{totalAbsentOverall}</p>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto p-4 sm:p-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="border-b-2 border-slate-50 pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {userRole === "faculty" ? "Taught Subjects" : "Enrolled Subjects"}
                </th>
                <th className="border-b-2 border-slate-50 pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Total Classes</th>
                <th className="border-b-2 border-slate-50 pb-4 text-[10px] font-black text-green-600 uppercase tracking-widest text-center">Present</th>
                <th className="border-b-2 border-slate-50 pb-4 text-[10px] font-black text-red-500 uppercase tracking-widest text-center">Absent</th>
                <th className="border-b-2 border-slate-50 pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Attendance %</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.length > 0 ? attendanceData.map((row) => (
                <tr key={row.id || row.subject} className="transition-colors hover:bg-slate-50/50 group">
                  <td className="border-b border-slate-50 py-6 text-sm font-black text-slate-900">{row.subject}</td>
                  <td className="border-b border-slate-50 py-6 text-sm font-bold text-slate-500 text-center">{row.totalClasses}</td>
                  <td className="border-b border-slate-50 py-6 text-sm font-black text-green-600 text-center">{row.present}</td>
                  <td className="border-b border-slate-50 py-6 text-sm font-black text-red-500 text-center">{row.absent}</td>
                  <td className="border-b border-slate-50 py-6 text-right">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-xs font-black tracking-widest ${row.percentage >= 75 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {row.percentage}%
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="py-20 text-center text-slate-400">
                    <BarChart3 size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-black uppercase tracking-widest text-xs">No records found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}