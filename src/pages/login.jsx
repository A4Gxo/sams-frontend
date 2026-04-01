import { useState } from "react";
import { Link } from "react-router-dom";
import { loginUser } from "../services/api";
import outrLogo from "../assets/Outr_logo.png";
import { ArrowRight, Lock, Mail, Loader2, ChevronDown } from "lucide-react"; // <-- Added ChevronDown here

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeRole, setActiveRole] = useState("student"); 
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await loginUser(email, password);
      console.log("Full Backend Response:", data);
      
      if (data.access_token) {
        // --- 1. SESSION SECURITY ---
        localStorage.setItem("token", data.access_token);
        
        // --- 2. ROLE NORMALIZATION ---
        const roleToSave = (data.role || activeRole).toLowerCase();
        localStorage.setItem("userRole", roleToSave);
        
        // --- 3. IDENTITY STORAGE ---
        const fullName = data.full_name || (data.first_name ? `${data.first_name} ${data.last_name || ''}` : "User");
        localStorage.setItem("userName", fullName.trim());

        // --- 4. AUTOMATIC ID FETCH & STORAGE ---
        if (roleToSave === "student" && data.student_id) {
          console.log("Saving Student ID:", data.student_id);
          localStorage.setItem("studentId", data.student_id.toString()); 
          
        } else if (roleToSave === "faculty" && data.faculty_id) {
          console.log("Saving Faculty ID:", data.faculty_id);
          localStorage.setItem("facultyId", data.faculty_id.toString());
        }

        // --- 5. NAVIGATION ---
        window.location.href = "/dashboard"; 
        
      } else {
        setError(data.detail || "Invalid email or password");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.response?.data?.detail || "Failed to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  const getTabClass = (role) => {
    const isActive = activeRole === role;
    return `flex-1 rounded-xl px-4 py-3 text-xs font-black transition-all duration-300 ${
      isActive
        ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
        : "bg-transparent text-slate-400 hover:bg-slate-800 hover:text-white"
    }`;
  };

  const roleLabel = activeRole === "faculty" ? "Faculty" : activeRole.charAt(0).toUpperCase() + activeRole.slice(1);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans overflow-x-hidden">
      
      {/* --- TOP SECTION: 60% VIDEO HERO --- */}
      <div className="relative w-full h-[60vh] shrink-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-60"
        >
          <source src="/campus-video.mp4" type="video/mp4" />
        </video>
        
        {/* THE MELT EFFECT */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"></div>

        {/* Welcome Text Overlay & Dropdown Arrow */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end translate-y-24 text-center px-4 z-20 pointer-events-none">
          <img 
            src={outrLogo} 
            alt="University Logo" 
            className="h-28 lg:h-36 w-auto mx-auto mb-4 drop-shadow-2xl" 
          />
          <h1 className="text-3xl lg:text-5xl font-black text-white tracking-tight leading-none mb-2 drop-shadow-lg">
            WELCOME TO OUTR
          </h1>
          <p className="text-xs lg:text-sm font-bold text-blue-400 uppercase tracking-[0.2em] drop-shadow-md mb-6">
            Student Attendance Portal
          </p>
          
          {/* THE BOUNCING ARROW IS HERE */}
          <ChevronDown size={28} className="text-white/30 animate-bounce drop-shadow-lg" />
        </div>
      </div>

      {/* --- BOTTOM SECTION: 40% LOGIN UI --- */}
      {/* pt-28 provides enough space so the bouncing arrow doesn't overlap the buttons */}
      <div className="flex-1 w-full flex flex-col items-center justify-center px-6 pt-24 pb-12 z-10 relative bg-slate-950">
        
        <div className="w-full max-w-[400px]">
          
          {/* Role Selector */}
          <div className="mb-8">
            <div className="flex gap-1 p-1.5 bg-slate-900 rounded-2xl border border-slate-800 shadow-inner">
              {['student', 'faculty', 'admin'].map((role) => (
                <button 
                  key={role} 
                  type="button" 
                  onClick={() => setActiveRole(role)} 
                  className={getTabClass(role)}
                >
                  {role === 'faculty' ? 'Staff' : role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Form Section */}
          <div>
            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm font-bold text-red-400">
                <div className="h-2 w-2 rounded-full bg-red-500 shrink-0 animate-pulse" />
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleLogin}>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{roleLabel} Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input
                    type="email"
                    required
                    className="w-full rounded-2xl border border-slate-800 bg-slate-900 pl-11 pr-5 py-4 text-sm font-bold text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10 transition-all"
                    placeholder="name@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between pl-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                  <button type="button" className="text-[10px] font-bold text-blue-500 hover:text-blue-400 transition-colors">
                    Forgot password?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full rounded-2xl border border-slate-800 bg-slate-900 pl-11 pr-16 py-4 text-sm font-bold text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10 transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-500 hover:text-white transition-colors bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700"
                  >
                    {showPassword ? "HIDE" : "SHOW"}
                  </button>
                </div>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 text-sm font-black text-white transition-all hover:bg-blue-500 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none mt-6 shadow-[0_0_20px_rgba(37,99,235,0.15)] hover:shadow-[0_0_25px_rgba(37,99,235,0.3)]"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>AUTHORIZING...</span>
                  </>
                ) : (
                  <>
                    <span>SECURE SIGN IN</span>
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          </div>
          
          {/* Footer Link */}
          <div className="mt-8 text-center pt-8 border-t border-slate-800/50">
            <p className="text-sm font-bold text-slate-500">
              Don't have an account?{" "}
              <Link to="/register" className="font-black text-slate-300 hover:text-blue-400 transition-colors ml-1">
                Request Access
              </Link>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}