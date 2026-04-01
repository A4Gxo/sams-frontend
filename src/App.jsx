import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// 1. Layout & Core Auth
import DashboardLayout from "./pages/DashboardLayout";
import Login from "./pages/login";
import Register from "./pages/Register";
import RoleGuard from "./pages/RoleGuard"; 

// 2. Dashboard Sub-Pages
import AdminDashboard from "./pages/AdminDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import Students from "./pages/Students";
import Faculty from "./pages/Faculty"; 
import Courses from "./pages/Courses";
import SessionCalendar from "./pages/SessionCalendar"; // Note: Check if your file is named SessionCalendar.jsx or SessionCalender.jsx
// --- CRITICAL FIX: Ensure this points to your new Manual Marking file ---
import MarkAttendance from "./pages/MarkAttendance"; 
import StudentReports from "./pages/StudentReports"; // This is the same component but it will detect role and render accordingly
import Reports from "./pages/Reports";
import FacultyReports from "./pages/FacultyReports";
import PendingApprovals from "./pages/PendingApprovals";
import SystemLogs from "./pages/SystemLogs";
import AssignSubjects from "./pages/AssignSubjects";
// 3. GPS Attendance Pages
import StartSession from "./pages/StartSession";
import CheckIn from "./pages/CheckIn";
import AttendanceSummaries from "./pages/AttendanceSummaries";

export default function App() {
  const token = localStorage.getItem("token");
  const rawRole = localStorage.getItem("userRole") || "";
  const userRole = rawRole.toLowerCase().trim();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          
          {/* Main Landing Route based on Role */}
          <Route 
            index 
            element={
              userRole === "admin" ? <AdminDashboard /> : 
              userRole === "faculty" ? <FacultyDashboard /> : 
              userRole === "student" ? <StudentDashboard /> :
              <Navigate to="/login" /> 
            } 
          />
          
          <Route path="logs" element={<SystemLogs />} />
          
          {/* Manage Students - Admin & Faculty Access */}
          <Route path="students" element={
            <RoleGuard allowedRoles={["admin", "faculty"]}><Students /></RoleGuard>
          } />

          {/* Manage Faculty - Admin ONLY */}
          <Route path="faculty" element={
            <RoleGuard allowedRoles={["admin"]}><Courses /></RoleGuard>
          } />

          {/* Assign Subjects - Admin ONLY */}
          <Route path="assign" element={
            <RoleGuard allowedRoles={["admin"]}><AssignSubjects /></RoleGuard>
          } />

          {/* Pending Approvals - Admin ONLY */}
          <Route path="approvals" element={
            <RoleGuard allowedRoles={["admin"]}><PendingApprovals /></RoleGuard>
          } />

          {/* --- FIXED: Faculty Manual Attendance --- */}
          <Route path="attendance" element={
            <RoleGuard allowedRoles={["faculty"]}>
              <MarkAttendance />
            </RoleGuard>
          } />

          {/* --- FIXED: Faculty Calendar History --- */}
          <Route path="history" element={
            <RoleGuard allowedRoles={["faculty"]}>
              <SessionCalendar />
            </RoleGuard>
          } />
          {/* Add this wherever your other /dashboard routes are! */}
<Route path="/dashboard/summaries" element={<AttendanceSummaries />} />
          {/* Assign Subjects Button -> Should load the new Grid UI we built */}

          <Route path="start-session" element={
            <RoleGuard allowedRoles={["faculty"]}><StartSession /></RoleGuard>
          } />

          {/* Student Check-In Tools */}
          <Route path="check-in" element={
            <RoleGuard allowedRoles={["student"]}><CheckIn /></RoleGuard>
          } />
          
          {/* Dynamic Routing for Reports */}
<Route 
  path="/dashboard/reports" 
  element={
    userRole === "admin" ? <Reports /> :
    userRole === "faculty" ? <FacultyReports /> :
    <StudentReports />
  } 
/>
          
        </Route>

        {/* Fallback for 404s */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}