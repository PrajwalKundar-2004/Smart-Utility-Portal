import React from 'react'
import logo1 from "../assets/logo1.png";
import {NavLink ,useLocation,useNavigate } from "react-router-dom";
const Studdash = () => {
  const location = useLocation();
  console.log(location.state);
  const username = location.state?.username || localStorage.getItem("username");
  const usn= location.state?.usn || localStorage.getItem("usn");
  // removes session during logout and redirect to login page
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("usn"); 
    navigate("/studentlogin");
  }
  return (
    <main className="w-screen h-screen bg-sky-50">
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

      <div className='h-[10vh] flex items-center w-[55vw] justify-center'> 
        <h1 className="text-3xl font-bold mb-8 text-center md:text-left">Your Dashboard</h1>
      </div>

      <div className="grid grid-cols-[400px_400px] grid-rows-[200px_200px] gap-6 items-center justify-center h-[80vh]">

        <div className="group flex flex-col items-center justify-around rounded-[35px] text-center text-slate-800 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl shadow-md bg-linear-to-r from-white to-[rgba(112,177,230,0.277)] border border-white/50 h-5/6">
          <div>
            <span className="block text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">📊</span>
            <h3 className="text-xl font-bold mb-2">Semester Results</h3>
            <p className="text-slate-500 mb-6">View your grade cards and performance history.</p>
          </div>
          <NavLink to="/student/results" className="w-1/2 h-1/5 flex items-center justify-center bg-blue-300 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-105">
            Check Results
          </NavLink>
        </div>

        <div className="group flex flex-col items-center justify-around rounded-[35px] text-center text-slate-800 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl shadow-md bg-linear-to-r from-white to-[rgba(112,177,230,0.277)] border border-white/50 h-5/6">
          <div>
            <span className="block text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">📢</span>
            <h3 className="text-xl font-bold mb-2">Notice Board</h3>
            <p className="text-slate-500 mb-6">Stay updated with events and college circulars.</p>
          </div>
          <NavLink to="/student/notices" className="w-1/2 h-1/5 flex items-center justify-center bg-blue-300 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-105">
            View Notices
          </NavLink>
        </div>

        <div className="group flex flex-col items-center justify-around rounded-[35px] text-center text-slate-800 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl shadow-md bg-linear-to-r from-white to-[rgba(112,177,230,0.277)] border border-white/50 h-5/6">
          <div>
            <span className="block text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">📝</span>
            <h3 className="text-xl font-bold mb-2">Assignments</h3>
            <p className="text-slate-500 mb-6">Track submissions and pending homework.</p>
          </div>
          <NavLink to="/student/assignments" className="w-1/2 h-1/5 flex items-center bg-blue-300 justify-center text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-105">
            View Assignments
          </NavLink>
        </div>

        <div className="group flex flex-col items-center justify-around rounded-[35px] text-center text-slate-800 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl shadow-md bg-linear-to-r from-white to-[rgba(112,177,230,0.277)] border border-white/50 h-5/6">
          <div>
            <span className="block text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">✅</span>
            <h3 className="text-xl font-bold mb-2">Attendance</h3>
            <p className="text-slate-500 mb-6">Monitor your daily and monthly attendance.</p>
          </div>
          <NavLink to="/student/attendances" className="w-1/2 h-1/5 flex items-center bg-blue-300 justify-center text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-105">
            Check Attendance
          </NavLink>
        </div>
      </div>
    </main>
  )
}

export default Studdash
