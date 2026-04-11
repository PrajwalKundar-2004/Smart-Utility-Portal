import React from 'react'
import logo1 from '../assets/logo1.png'
import { NavLink, useNavigate } from 'react-router-dom';

const Navbar1 = () => {
    const navigate = useNavigate();
    // removes session during logout and redirect to login page
    const handleLogout = () => {
        localStorage.removeItem("role");
        localStorage.removeItem("token");
        navigate("/lecturelogin");
    };
    return (
        <div>
            <nav className="sticky top-0 z-50 flex items-center justify-between  bg-white shadow-sm border-b-2 border-black h-[15vh]">
                <div className="flex items-center gap-4 w-1/2">
                    <img src={logo1} alt="College Logo" className="h-12.5 w-auto object-contain" />
                    <div className="text-xl font-bold text-black text-primary leading-tight">
                        Vivekananda College of Engineering & Technology,Puttur
                    </div>
                </div>
                <div className="flex items-center gap-8 font-medium w-1/4 justify-center">
                    <NavLink to="/lecturedash" className="text-blue-500 hover:text-blue-600 transition-colors">Dashboard</NavLink>
                    <button onClick={handleLogout} className="text-red-500 hover:text-red-600 transition-colors" >
                        Logout
                    </button>
                </div>
            </nav>
        </div>
    )
}

export default Navbar1
