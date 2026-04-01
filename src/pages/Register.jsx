import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, Loader2, Globe } from "lucide-react";
import outrLogo from "../assets/Outr_logo.png";

export default function Register() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'external_student', // Default
    institution: ''
  });

  const [status, setStatus] = useState("idle"); 
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setStatus("loading");
    
    // --- PAYLOAD FORMATTING FIX ---
    // Ensure the payload exactly matches the ExternalRegisterRequest Pydantic model
    const payload = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        username: formData.email.trim(), // The backend expects 'email' based on your route definition
        password: formData.password,
        role: formData.role,
        institution: formData.institution.trim()
        
    };

    try {
      // Point to the correct external registration endpoint
      await axios.post('http://localhost:8000/auth/register', payload);
      setStatus("success");
    } catch (err) {
      console.error("Registration Error:", err.response?.data); // Helpful for debugging
      const detail = err.response?.data?.detail;
      
      if (Array.isArray(detail)) {
          // Extracts the specific field that failed Pydantic validation
          const missingField = detail[0].loc[detail[0].loc.length - 1];
          const errorType = detail[0].msg;
          setErrorMsg(`Validation error on '${missingField}': ${errorType}`);
      } else {
          setErrorMsg(detail || 'Registration failed. Please check your inputs.');
      }
      setStatus("error");
    }
  };

  // --- SUCCESS STATE: PENDING APPROVAL ---
  if (status === "success") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-10 text-center space-y-6 animate-in zoom-in-95">
          <div className="w-24 h-24 mx-auto bg-green-100 text-green-500 rounded-[2rem] flex items-center justify-center mb-4 shadow-inner">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-black text-slate-900">Request Sent!</h2>
          <p className="text-slate-500 font-medium leading-relaxed">
            Your application for the workshop/internship has been submitted. 
            <br/><br/>
            <strong className="text-slate-800">Please wait for the SAMS Administrator to approve your account.</strong> You will be able to log in once approved.
          </p>
          <button 
            onClick={() => navigate("/login")}
            className="mt-6 w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black hover:bg-blue-600 transition-all shadow-xl active:scale-95"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // --- REGISTRATION FORM ---
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
        
        <div className="px-10 pt-10 pb-6 text-center">
          <img src={outrLogo} alt="Logo" className="mx-auto mb-4 h-16 w-auto opacity-80" />
          <div className="inline-flex items-center justify-center gap-2 mb-2 text-blue-600">
            <Globe size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest">External Portal</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Join Event</h2>
          <p className="text-sm font-bold text-slate-400 mt-1">Register for Workshops & Internships</p>
        </div>

        <div className="px-10 pb-10">
          {errorMsg && status === "error" && (
            <div className="mb-6 rounded-2xl bg-red-50 border border-red-100 p-4 text-sm font-bold text-red-600 animate-in shake">
                {errorMsg}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                <input name="first_name" required className="w-full rounded-2xl bg-slate-50 px-4 py-3.5 text-sm font-bold outline-none border-2 border-transparent focus:border-blue-500/10 transition-all" onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                <input name="last_name" required className="w-full rounded-2xl bg-slate-50 px-4 py-3.5 text-sm font-bold outline-none border-2 border-transparent focus:border-blue-500/10 transition-all" onChange={handleChange} />
              </div>
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <input name="email" type="email" required className="w-full rounded-2xl bg-slate-50 px-4 py-3.5 text-sm font-bold outline-none border-2 border-transparent focus:border-blue-500/10 transition-all" onChange={handleChange} />
            </div>
            
            <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <input name="password" type="password" required className="w-full rounded-2xl bg-slate-50 px-4 py-3.5 text-sm font-bold outline-none border-2 border-transparent focus:border-blue-500/10 transition-all" onChange={handleChange} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Role</label>
                <select name="role" className="w-full rounded-2xl bg-slate-50 px-4 py-3.5 text-sm font-bold outline-none border-2 border-transparent focus:border-blue-500/10 transition-all cursor-pointer" value={formData.role} onChange={handleChange}>
                  <option value="external_student">Guest Student</option>
                  <option value="external_faculty">Guest Speaker</option>
                </select>
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your College/Company</label>
                <input name="institution" required placeholder="e.g. MIT, Google" className="w-full rounded-2xl bg-slate-50 px-4 py-3.5 text-sm font-bold outline-none border-2 border-transparent focus:border-blue-500/10 transition-all" onChange={handleChange} />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={status === "loading"} 
              className={`w-full flex items-center justify-center gap-2 rounded-[2rem] py-5 mt-4 text-sm font-black text-white shadow-xl active:scale-95 transition-all ${
                status === "loading" ? 'bg-slate-300 cursor-not-allowed' : 'bg-slate-900 hover:bg-blue-600'
              }`}
            >
              {status === "loading" ? <><Loader2 className="animate-spin" size={18} /> Processing...</> : 'Submit Application'}
            </button>
          </form>

          <p className="mt-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
            Already approved? <Link to="/login" className="text-blue-600 hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}