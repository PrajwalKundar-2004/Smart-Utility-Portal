import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import logo1 from '../assets/logo1.png';

const Navbar2 = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const username = location.state?.username || localStorage.getItem("username") || "Student";
  const usn = location.state?.usn || localStorage.getItem("usn") || "";

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("usn");
    navigate("/studentlogin");
  };

  return (
    <nav className="sticky top-0 z-50 min-h-[56px] h-14 sm:min-h-[64px] sm:h-16 flex items-center justify-between bg-white shadow-sm border-b-2 border-black px-3 sm:px-8 lg:px-12 w-full">
      {/* Left side: Logo & College Name */}
      <div className="flex items-center gap-2.5 sm:gap-4 flex-1 min-w-0">
        <img
          src={logo1}
          alt="College Logo"
          className="h-9 sm:h-12 w-auto object-contain flex-shrink-0"
        />
        <div className="hidden sm:block text-sm md:text-base lg:text-xl font-bold text-black leading-tight truncate">
          Vivekananda College of Engineering & Technology, Puttur
        </div>
        <div className="block sm:hidden text-xs font-black text-black leading-tight truncate">
          VCET Student Portal
        </div>
      </div>

      {/* Right side: Nav Links & Logout */}
      <div className="flex items-center gap-3 sm:gap-6 font-medium flex-shrink-0 mr-6 sm:mr-12 lg:mr-20">
        <NavLink
          to="/studentdash"
          className={({ isActive }) =>
            `text-xs sm:text-base font-bold py-1 px-1.5 transition-colors ${
              isActive ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-600 hover:text-blue-600'
            }`
          }
        >
          Dashboard
        </NavLink>

        <button
          onClick={handleLogout}
          className="text-red-500 hover:text-red-600 font-bold transition-colors text-xs sm:text-base cursor-pointer py-1 px-1.5"
          title="Sign out of student portal"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar2;
