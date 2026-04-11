import React from 'react'
import logo1 from "../assets/logo1.png";
import { NavLink,useNavigate} from "react-router-dom";
import Navbar1 from '../components/Navbar1';
const Lectdash = () => {
  const navigate = useNavigate();
  // removes session during logout and redirect to login page
  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    navigate("/lecturelogin");
  };
  return (
    <main className='w-screen h-screen bg-sky-50'>
      <nav className="sticky top-0 z-50 flex items-center justify-between  bg-white shadow-sm border-b-2 border-black h-[15vh]">
        <div className="flex items-center gap-4 w-1/2">
          <img src={logo1} alt="College Logo" className="h-12.5 w-auto object-contain" />
          <div className="text-xl font-bold text-black text-primary leading-tight">
            Vivekananda College of Engineering & Technology, Puttur
          </div>
        </div>
        <div className="flex items-center gap-8 font-medium w-1/4 justify-center">
          <NavLink to="/lecturedash" className="text-blue-500 hover:text-blue-600 transition-colors">Dashboard</NavLink>
          <button onClick={handleLogout} className="text-red-500 hover:text-red-600 transition-colors" >
            Logout
          </button>
        </div>
      </nav>

      {/* <Navbar1/> */}
      <div className='h-[10vh] flex items-center w-[55vw] justify-center '>
        <h1 className="text-3xl font-bold mb-8 text-center">Manage Content</h1>
      </div>

      <div className="grid grid-cols-[400px_400px] grid-rows-[200px_200px] gap-6 items-center justify-center h-[75vh] ">
        <NavLink to="/lecture/result" className="group block p-8 rounded-[35px] text-center text-slate-800 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl shadow-md bg-linear-to-r from-white to-[rgba(112,177,230,0.277)]">
          <span className="block text-5xl mb-4">📈</span>
          <h3 className="text-xl font-bold mb-2">Update Results</h3>
          <p className="text-slate-500">Upload student marks</p>
        </NavLink>

        <NavLink
          to="/lecture/notice"
          className="group block p-8 rounded-[35px] text-center text-slate-800 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl shadow-md bg-linear-to-r from-white to-[rgba(112,177,230,0.277)]">
          <span className="block text-5xl mb-4">📣</span>
          <h3 className="text-xl font-bold mb-2">Post Notices</h3>
          <p className="text-slate-500">Create new circulars</p>
        </NavLink>

        <NavLink to="/lecture/assignment" className="group block p-8 rounded-[35px] text-center text-slate-800 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl shadow-md bg-linear-to-r from-white to-[rgba(112,177,230,0.277)]" >
          <span className="block text-5xl mb-4">📤</span>
          <h3 className="text-xl font-bold mb-2">Assignments</h3>
          <p className="text-slate-500">Upload new assignments</p>
        </NavLink>

        <NavLink to="/lecture/attendance" className="group block p-8 rounded-[35px] text-center text-slate-800 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl shadow-md bg-linear-to-r from-white to-[rgba(112,177,230,0.277)]" >
          <span className="block text-5xl mb-4">📅</span>
          <h3 className="text-xl font-bold mb-2">Update Attendance</h3>
          <p className="text-slate-500">Mark daily attendance</p>
        </NavLink>
      </div>
    </main>
  )
}
export default Lectdash
