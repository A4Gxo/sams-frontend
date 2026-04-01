import React, { useState, useEffect } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import axios from 'axios';

export default function FacultyAnalytics() {
  // 1. Create state to hold the real data
  const [chartData, setChartData] = useState([]);

  // 2. Fetch the data when the component loads
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("token");
        // Ensure this URL perfectly matches your Python backend route
        const res = await axios.get("http://127.0.0.1:8000/faculty/analytics", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setChartData(res.data);
      } catch (error) {
        console.error("Failed to load analytics data", error);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm mt-8 animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <div className="mb-6">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Course Analytics</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
          Students, Classes & Overall Attendance
        </p>
      </div>

      {/* CHART SECTION */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData} 
            margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
          >
            <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="course" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} 
              dy={10}
            />
            {/* Left Y-Axis for Students & Classes */}
            <YAxis 
              yAxisId="left" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 12 }} 
            />
            {/* Right Y-Axis for Attendance Percentage */}
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#10b981', fontSize: 12 }} 
              domain={[0, 100]}
              tickFormatter={(tick) => `${tick}%`}
            />
            
            <Tooltip 
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              cursor={{ fill: '#f8fafc' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold', color: '#64748b' }} />
            
            <Bar yAxisId="left" dataKey="students" name="Total Students" barSize={30} fill="#1e3a8a" radius={[6, 6, 0, 0]} />
            <Bar yAxisId="left" dataKey="classesTaken" name="Classes Taken" barSize={30} fill="#94a3b8" radius={[6, 6, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="attendance" name="Attendance %" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
    </div>
  );
}