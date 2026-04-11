import React from 'react'
import { NavLink, useLocation ,useNavigate} from 'react-router-dom'
import logo1 from '../assets/logo1.png'

const Navbar2 = () => {
     // removes session during logout and redirect to login page
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("usn"); 
    navigate("/studentlogin");
  }
    const location = useLocation();
    console.log(location.state);
    const username = location.state?.username || localStorage.getItem("username");
    const usn = location.state?.usn || localStorage.getItem("usn");
    return (
        <div>
            <nav className="sticky top-0 z-50 flex items-center justify-between  bg-white shadow-sm border-b-2 border-black h-[10vh]">
                 <div className="flex items-center gap-4">
                   <img src={logo1} alt="College Logo" className="h-12.5 w-auto object-contain" />
                   <div className="text-xl font-bold text-primary leading-tight">
                     Vivekananda College of Engineering & Technology, Puttur
                   </div>
                 </div>
                 <div className="flex items-center gap-8 font-medium w-1/3 justify-center">
                   <span className="hidden md:inline">Welcome, <strong>{username}</strong> ({usn})</span>
                   <NavLink to="/studentdash" className="text-blue-500 hover:text-blue-600 transition-colors">Dashboard</NavLink>
                   <button onClick={handleLogout} className="text-red-500 hover:text-red-600 transition-colors">Logout</button>
                 </div>
               </nav>
        </div>
    )
}

export default Navbar2
