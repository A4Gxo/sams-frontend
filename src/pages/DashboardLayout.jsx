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
  // FIX 1: Default to false so the mobile menu isn't open blocking the screen on load
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

  // FIX 2: Automatically close the mobile sidebar whenever the user navigates to a new page
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
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-blue-200">
      
      {/* --- Mobile Sidebar Overlay --- */}
      {!isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* --- Sidebar --- */}
      {/* Notice lg:translate-x-0 ensures it's ALWAYS visible on desktop, regardless of isSidebarOpen state */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[280px] transform border-r border-slate-200/60 bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} shadow-[4px_0_24px_rgba(0,0,0,0.02)]`}>
        <div className="flex h-full flex-col">
          
          <div className="flex flex-col items-center justify-center gap-3 border-b border-slate-100 pb-6 pt-8 px-6">
            <img 
              src={outrLogo} 
              alt="OUTR Logo" 
              className="h-16 w-auto drop-shadow-md transition-transform hover:scale-105 duration-300" 
            />
            <div className="text-center">
              <h2 className="text-xl font-black tracking-tight text-slate-900 leading-none">OUTR SAMS</h2>
              <p className="mt-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-blue-600">Attendance Portal</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto custom-scrollbar">
            <div className="mb-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Main Menu</div>
            {menuItems
              .filter(item => item.roles.includes(userRole))
              .map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`group relative flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-300 overflow-hidden ${
                      isActive 
                        ? "bg-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.25)]" 
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {/* Active Indicator Bar */}
                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/30 rounded-r-full"></div>}
                    
                    <div className="flex items-center gap-3">
                      <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-white" : "text-slate-400 group-hover:text-blue-500 transition-colors"} />
                      {item.name}
                    </div>
                    {isActive && <ChevronRight size={16} className="opacity-60" />}
                  </Link>
                );
            })}
          </nav>

          <div className="mt-auto border-t border-slate-100 p-4">
            <button 
              onClick={handleLogout} 
              className="group flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-500 transition-all hover:bg-red-50 hover:text-red-600"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 group-hover:bg-red-100 transition-colors">
                <LogOut size={16} strokeWidth={2.5} className="group-hover:text-red-600" />
              </div>
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* --- Main Content Body --- */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/60 bg-white/70 px-4 sm:px-8 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:hidden transition-colors"
            >
              <Menu size={24} />
            </button>
            
            <div className="hidden items-center gap-2 text-sm font-bold text-slate-400 md:flex">
              <span className="hover:text-blue-600 transition-colors cursor-pointer">Dashboard</span>
              <ChevronRight size={14} className="opacity-50" />
              <span className="text-slate-900">{currentPage}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            
            {/* Search Bar - Expands on Focus */}
            <div className="relative hidden lg:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="w-[240px] focus:w-[320px] rounded-2xl border border-slate-200/60 bg-slate-50/50 py-2.5 pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 shadow-sm"
              />
            </div>

            <button className="relative hidden sm:flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>

            <div className="relative">
              <button 
                onClick={() => setProfileOpen(!isProfileOpen)}
                className={`group flex items-center gap-3 rounded-[2rem] border border-transparent p-1.5 transition-all hover:bg-white hover:shadow-sm hover:ring-1 hover:ring-slate-200 active:scale-95 sm:pl-4 lg:ml-2 ${isProfileOpen ? 'bg-white shadow-sm ring-1 ring-slate-200' : ''}`}
              >
                <div className="hidden text-right md:block mr-1">
                  <p className="text-sm font-black text-slate-900 leading-none">{userName}</p>
                  <p className="mt-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {userRole}
                  </p>
                </div>

                <div className="relative">
                  <img src={avatarUrl} alt="Profile" className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover border border-slate-200 shadow-sm group-hover:border-blue-200 transition-colors" />
                  <div className="absolute bottom-0 right-0 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full border-2 border-white bg-green-500 shadow-sm"></div>
                </div>
              </button>

              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)}></div>
                  
                  {/* FIX 3: Adjusted width so it doesn't overflow off tiny phone screens */}
                  <div className="absolute right-0 top-full mt-3 w-[calc(100vw-2rem)] sm:w-[320px] max-w-[320px] z-50 rounded-[2.5rem] bg-white p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] ring-1 ring-slate-100 animate-in fade-in slide-in-from-top-4 duration-200">
                    
                    <div className="flex flex-col items-center border-b border-slate-100/60 pb-6 text-center">
                      <img src={avatarUrl} alt="Profile" className="h-20 w-20 rounded-full object-cover shadow-lg border-4 border-white mb-4" />
                      <h3 className="text-lg font-black text-slate-900">{userName}</h3>
                      <p className="text-xs font-bold text-slate-500 mt-1 capitalize">{userRole} • Computer Science</p>
                    </div>

                    <div className="space-y-4 py-6">
                      <div className="flex items-center gap-4 text-sm font-semibold text-slate-600 group">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-blue-600 transition-colors group-hover:bg-blue-50"><BadgeCheck size={18} /></div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">System ID</p>
                          <p className="text-slate-900 font-bold">{userId}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm font-semibold text-slate-600 group">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-blue-600 transition-colors group-hover:bg-blue-50"><Mail size={18} /></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</p>
                          <p className="text-slate-900 font-bold truncate">{userEmail}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm font-semibold text-slate-600 group">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-blue-600 transition-colors group-hover:bg-blue-50"><Phone size={18} /></div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contact</p>
                          <p className="text-slate-900 font-bold">+91 7846831648</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 border-t border-slate-100/60 pt-6">
                      <button className="flex-1 rounded-2xl bg-slate-900 py-3.5 text-xs font-black text-white transition-all hover:bg-slate-800 active:scale-95 shadow-md">
                        Edit Profile
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="flex-1 rounded-2xl bg-red-50 py-3.5 text-xs font-black text-red-600 transition-all hover:bg-red-100 active:scale-95"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 relative">
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}