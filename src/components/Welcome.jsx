import React from 'react'
import graduationCap from '../assets/graduation-cap.svg'
import chalkboard from '../assets/chalkboard-user.svg'
import { NavLink} from 'react-router-dom'

const Welcome = () => {
    return (
        <>
            <main className='bg-linear-to-r from-[rgb(213,228,245)] to-[rgb(193,211,237)] h-screen w-full '>
                <div className='flex items-center justify-center w-screen bg-purple-700 h-[5vh] sm:h-[10vh]'>
                    <h1 className='text-white  text-xl sm:text-2xl text-center '>Welcome To Smart Utility Portal . . .</h1>
                </div>
                <div className='flex justify-center item-end sm:items-end h-[15vh] sm:h-[30vh] '>
                    <h2 className='text-purple-900 text-2xl sm:text-4xl font-bold'>Are You  A Student Or <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;A Teacher?</h2>
                </div>
                <br />
                <div className='flex h-[10vh] sm:h-[20vh] w-full   justify-center items-end'>
                    <NavLink to="/signup" className='flex justify-around items-center bg-sky-500 text-white px-8 py-4 rounded-4xl text-xl font-bold hover:bg-purple-800 cursor-pointer min-h-10 sm:min-h-20  min-w-xs sm:min-w-100 '>
                    <img src={graduationCap} alt="Graduation Cap" className="max-w-8 sm:max-w-12 max-h-8 sm:max-h-12 fill-white"/>
                    <span className=' text-2xl sm:text-3xl font-bold '>I am a Student</span></NavLink>
                </div><br />

                 <div className='flex h-[10vh] sm:h-[20vh] w-full   justify-center items-end'>
                    <NavLink to="/lecturelogin" className='flex justify-around items-center bg-green-600 text-white px-8 py-4 rounded-4xl text-xl font-bold hover:bg-purple-800 cursor-pointer min-h-10 sm:min-h-20  min-w-xs sm:min-w-100'>
                    <img src={chalkboard} alt="Chalkboard" className="max-w-8 sm:max-w-12 max-h-8 sm:max-h-12 fill-white" />
                    <span className=' text-2xl sm:text-3xl font-bold ' >I am a Teacher</span></NavLink>
                </div>
            </main>
        </>
    )
}

export default Welcome
