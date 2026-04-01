import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  CheckSquare, 
  BarChart3, 
  LogOut,
  MapPin,      
  Fingerprint,
  UserCircle,
  ClipboardList // Added for Pending Approvals
} from "lucide-react"; 

export default function Sidebar() {
  const location = useLocation();
  
  // Normalize the role to lowercase to prevent "Admin" vs "admin" bugs
  const rawRole = localStorage.getItem("userRole") || "";
  const userRole = rawRole.toLowerCase(); 

  const menuItems = [
    { 
      name: "Overview", 
      path: "/dashboard", 
      icon: LayoutDashboard, 
      roles: ["admin", "faculty", "student"] 
    },
    { 
      name: "Manage Students", 
      path: "/dashboard/students", 
      icon: Users, 
      roles: ["admin"] 
    },
    { 
      name: "Manage Faculty", 
      path: "/dashboard/faculty", 
      icon: GraduationCap, 
      roles: ["admin"] 
    },
    { 
      name: "Assign Subjects", 
      path: "/dashboard/courses", 
      icon: BookOpen, 
      roles: ["admin"] 
    },
    // --- NEW PENDING APPROVALS TAB ---
    { 
      name: "Pending Approvals", 
      path: "/dashboard/approvals", 
      icon: ClipboardList, 
      roles: ["admin"] 
    },
    // ---------------------------------
    { 
      name: "Mark Attendance", 
      path: "/dashboard/attendance", 
      icon: CheckSquare, 
      roles: ["faculty"] 
    },
    { 
      name: "Start GPS Session", 
      path: "/dashboard/start-session", 
      icon: MapPin, 
      roles: ["faculty"] 
    },
    { 
      name: "GPS Check-In", 
      path: "/dashboard/check-in", 
      icon: Fingerprint, 
      roles: ["student"] 
    },
    { 
      name: "Reports", 
      path: "/dashboard/reports", 
      icon: BarChart3, 
      roles: ["admin", "faculty", "student"] 
    },
  ];

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="w-72 h-screen bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
      {/* Brand Logo */}
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/20">
            S
          </div>
          <span className="text-2xl font-black text-white tracking-tight">SAMS</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        {menuItems
          .filter((item) => item.roles.includes(userRole)) 
          .map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-200 ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-900/40" 
                    : "hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 mt-auto border-t border-slate-800 space-y-2">
        {/* Role Badge */}
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
           <UserCircle size={20} className="text-blue-400" />
           <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Logged in as</span>
              <span className="text-xs font-bold text-white capitalize">{userRole}</span>
           </div>
        </div>

        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 text-red-400 font-bold hover:bg-red-500/10 rounded-xl transition-colors text-sm"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
}