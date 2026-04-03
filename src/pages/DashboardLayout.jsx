import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Navigate, Outlet } from "react-router-dom";
import { 
  LayoutDashboard, Users, BookOpen, CheckSquare, 
  BarChart3, LogOut, Bell, Search, Menu, X, ChevronRight,
  GraduationCap, ClipboardList, MapPin, Fingerprint, 
  Mail, Phone, BadgeCheck, FileSpreadsheet
} from "lucide-react";
import outrLogo from "../assets/Outr_logo.png"; 

export default function DashboardLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false); 
  
  const location = useLocation();
  const navigate = useNavigate();
  
  const token = localStorage.getItem("token");
  const rawRole = localStorage.getItem("userRole") || "student";
  const userRole = rawRole.toLowerCase(); 
  const userName = localStorage.getItem("userName") || "Gyanaranjan Moharana";
  const userEmail = localStorage.getItem("userEmail") || `${userName.split(' ')[0].toLowerCase()}@sams.edu`;
  const userId = localStorage.getItem("userId") || "SAMS-849201";

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (!token) return <Navigate to="/" replace />;

  const menuItems = [
    { name: "Overview", path: "/dashboard", icon: LayoutDashboard, roles: ["admin", "faculty", "student","external_student","external_faculty"] },
    { name: "Manage Students", path: "/dashboard/students", icon: Users, roles: ["admin"] },
    { name: "Manage Faculty", path: "/dashboard/faculty", icon: GraduationCap, roles: ["admin"] },
    { name: "Assign Subjects", path: "/dashboard/assign", icon: BookOpen, roles: ["admin"] },
    { name: "Pending Approvals", path: "/dashboard/approvals", icon: ClipboardList, roles: ["admin"] },
    { name: "Mark Attendance", path: "/dashboard/attendance", icon: CheckSquare, roles: ["faculty"] },
    { name: "Start GPS Session", path: "/dashboard/start-session", icon: MapPin, roles: ["faculty"] },
    { name: "GPS Check-In", path: "/dashboard/check-in", icon: Fingerprint, roles: ["student","external_student"] },
    { name: "Reports", path: "/dashboard/reports", icon: BarChart3, roles: ["admin", "faculty", "student"] },
    { name: "Semester Summaries", path: "/dashboard/summaries", icon: FileSpreadsheet, roles: ["admin", "faculty"] },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const currentPage = menuItems.find(item => item.path === location.pathname)?.name || "Overview";
  const avatarUrl = `https://ui-avatars.com/api/?name=${userName.replace(' ', '+')}&background=0f172a&color=fff&size=128&bold=true`;

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
      
      {/* --- Mobile Sidebar Overlay --- */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity duration-300" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* --- Sidebar --- */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-slate-200/60 bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-full flex-col">
          
          <div className="flex flex-col items-center justify-center gap-2 border-b border-slate-100 pb-6 pt-8 px-6">
            <img 
              src={outrLogo} 
              alt="OUTR Logo" 
              className="h-14 w-auto drop-shadow-md" 
            />
            <div className="text-center">
              <h2 className="text-lg font-black tracking-tight text-slate-900">OUTR SAMS</h2>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600">Attendance Portal</p>
            </div>
            {/* Close button for mobile */}
            <button onClick={() => setSidebarOpen(false)} className="absolute right-4 top-4 text-slate-400 lg:hidden">
                <X size={20} />
            </button>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            <div className="mb-2 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Main Menu</div>
            {menuItems
              .filter(item => item.roles.includes(userRole))
              .map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                      isActive 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} className={isActive ? "text-white" : "text-slate-400 group-hover:text-blue-500"} />
                      {item.name}
                    </div>
                  </Link>
                );
            })}
          </nav>

          <div className="border-t border-slate-100 p-4">
            <button 
              onClick={handleLogout} 
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        
        <header className="flex h-16 sm:h-20 shrink-0 items-center justify-between border-b border-slate-200/60 bg-white/80 px-4 sm:px-8 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={20} />
            </button>
            
            <h1 className="text-sm font-bold text-slate-900 sm:text-base lg:hidden truncate max-w-[150px]">
                {currentPage}
            </h1>

            <div className="hidden items-center gap-2 text-sm font-bold text-slate-400 lg:flex">
              <span>Dashboard</span>
              <ChevronRight size={14} />
              <span className="text-slate-900">{currentPage}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500">
              <Bell size={18} />
            </button>

            <div className="relative">
              <button 
                onClick={() => setProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 rounded-full border border-slate-200 p-1 pr-3 hover:bg-slate-50"
              >
                <img src={avatarUrl} alt="User" className="h-8 w-8 rounded-full border border-slate-200" />
                <ChevronRight size={14} className={`text-slate-400 transition-transform ${isProfileOpen ? 'rotate-90' : ''}`} />
              </button>

              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)}></div>
                  <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-80 z-50 rounded-3xl bg-white p-5 shadow-2xl ring-1 ring-slate-100 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex flex-col items-center border-b pb-4 text-center">
                      <img src={avatarUrl} alt="Avatar" className="h-16 w-16 rounded-full mb-3 shadow-md" />
                      <p className="font-black text-slate-900">{userName}</p>
                      <p className="text-[10px] uppercase tracking-widest text-blue-600 font-bold">{userRole}</p>
                    </div>
                    <div className="py-4 space-y-3">
                        <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                            <Mail size={14} className="text-slate-400" />
                            <span className="truncate">{userEmail}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                            <BadgeCheck size={14} className="text-slate-400" />
                            <span>{userId}</span>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="w-full rounded-xl bg-red-50 py-3 text-xs font-black text-red-600 hover:bg-red-100 transition-colors">
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}