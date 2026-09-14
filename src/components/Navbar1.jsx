import React from 'react';
import logo1 from '../assets/logo1.png';
import { NavLink, useNavigate } from 'react-router-dom';

const Navbar1 = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("role");
        localStorage.removeItem("token");
        navigate("/lecturelogin");
    };

    return (
       <nav className="sticky top-0 z-50 min-h-[56px] h-14 sm:min-h-[64px] sm:h-16 flex items-center justify-between bg-white shadow-sm border-b-2 border-black px-4 sm:px-8 lg:px-12 w-full">

    {/* Left side */}
    <div className="flex items-center gap-3 sm:gap-4 flex-1">
        <img
            src={logo1}
            alt="College Logo"
            className="h-9 sm:h-12 w-auto object-contain flex-shrink-0"
        />

        <div className="hidden sm:block text-sm md:text-base lg:text-xl font-bold text-black leading-tight">
            Vivekananda College of Engineering & Technology, Puttur
        </div>
    </div>

    {/* Right side */}
    <div className="flex items-center gap-3 sm:gap-6 font-medium flex-shrink-0">
        <NavLink
            to="/lecturedash"
            className="text-blue-500 hover:text-blue-600 transition-colors text-sm sm:text-base py-1 px-1"
        >
            Dashboard
        </NavLink>

        <button
            onClick={handleLogout}
            className="text-red-500 hover:text-red-600 transition-colors text-sm sm:text-base cursor-pointer py-1 px-1"
        >
            Logout
        </button>
    </div>

</nav>
    );
};

export default Navbar1;