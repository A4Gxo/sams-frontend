import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Later, you can add logic here to clear user tokens or session data
    // localStorage.removeItem("authToken");
    
    // Redirect back to the Login page
    navigate("/");
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      {/* Brand / Logo Area */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">
          S
        </div>
        <span className="text-xl font-bold text-gray-800 tracking-tight">
          SAMS
        </span>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-sm font-semibold text-gray-700">Admin User</span>
          <span className="text-xs text-gray-500">Administrator</span>
        </div>
        
        {/* Profile Avatar Placeholder */}
        <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
          A
        </div>

        <button
          onClick={handleLogout}
          className="ml-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}