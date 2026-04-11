// import React from 'react'
// import toast, { Toaster } from 'react-hot-toast'
// import { Navigate, useNavigate } from 'react-router-dom'
// import { useForm } from "react-hook-form"

// const Studentlogin = () => {
//     const {
//         register,
//         handleSubmit,
//         watch,
//         setError,
//         formState: { errors, isSubmitting },
//     } = useForm();
//     const navigate = useNavigate();

//     const onSubmit = async (data) => {
//       try {
//             const response = await fetch('http://localhost:3000/api/student/login', {  
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({
//                     username: data.username,
//                     usn: data.usn,
//                     password: data.password
//                 })
//             });
//             const result = await response.json();
//             if (result.success) {
//                 toast.success("Logged in successfully!", {
//                     duration: 2000,
//                     position: "top-right",
//                 });
//                 // save token
//                 localStorage.setItem('token', result.token);
//                 localStorage.setItem("role", "student");
//                 localStorage.setItem("username", result.student.username);
//                 localStorage.setItem("usn", result.student.usn);
//                 console.log(localStorage.getItem('studentToken'));
//                 setTimeout(() => {
//                     navigate("/studentdash",{
//                         replace: true,
//                     state: {
//                         usn: result.student.usn,
//                         username: result.username,
//                     }
//                 });
//                 }, 2000);
//             } else {
//                 toast.error(result.message, {
//                     duration: 2000,
//                     position: "top-right",
//                 });
//             }
//         } catch (error) {
//             toast.error("Server error", {
//                 duration: 2000,
//                 position: "top-right",
//             });
//         }
//     }
//     return (
// <>
//     <Toaster />
//     <main className="min-h-screen min-w-screen flex justify-center items-center bg-linear-to-br from-blue-900 via-purple-900 to-slate-900 animate-gradient-bg font-sans">
//         <div className="w-95 h-[60vh] p-10 rounded-[20px] backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl flex flex-col  items-center gap-2">
//             <div className='flex h-[15vh] justify-center items-center'>
//                 <h2 className="text-white text-2xl font-bold text-center  drop-shadow-md">Smart Portal Login</h2>
//             </div>

//             <form onSubmit={handleSubmit(onSubmit)} className='h-3/4 w-3/4 flex flex-col justify-start 
//             items-center gap-4'>
//                 <input type="text" placeholder='Username' className='w-full h-8  text-center  rounded-full bg-white/20 text-white placeholder-white/70 outline-none border border-transparent  focus:border-blue-400 focus:bg-white/30 transition '{...register("username", { required: { value: true, message: "Username is required" } })} />
//                 {errors.username && <p className='text-red-500 text-sm self-start'>{errors.username.message}</p>}

//                 <input type="text" placeholder='USN' className='w-full h-8 text-center rounded-full bg-white/20 text-white placeholder-white/70 outline-none border border-transparent focus:border-blue-400 focus:bg-white/30 transition ' {...register("usn", { required: { value: true, message: "USN is required" } })} />
//                 {errors.usn && <p className='text-red-500 text-sm self-start'>{errors.usn.message}</p>}

//                 <input type="text" placeholder='Password' className='w-full h-8 text-center  rounded-full bg-white/20 text-white placeholder-white/70 outline-none border border-transparent focus:border-blue-400 focus:bg-white/30 transition' {...register("password", { required: { value: true, message: "Password is required" } })} />
//                 {errors.password && <p className='text-red-500 text-sm self-start'>{errors.password.message}</p>}

//                 <button disabled={isSubmitting} type='submit' className='w-full p-3 bg-blue-600 rounded-full h-8 text-white font-bold hover:bg-blue-500 transition shadow-lg transform hover:scale-105'>Login</button>
//             </form>
//         </div>
//     </main>
// </>

//     )
// }

// export default Studentlogin
import React from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { Navigate, useNavigate } from 'react-router-dom'
import { useForm } from "react-hook-form"
import { useState } from 'react'

const Studentlogin = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm();
    const navigate = useNavigate();
    // const [showPassword, setShowPassword] = useState(false);

    const onSubmit = async (data) => {
        try {
            const response = await fetch('http://localhost:3000/api/student/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: data.username,
                    usn: data.usn,
                    password: data.password
                })
            });
            const result = await response.json();
            if (result.success) {
                toast.success("Logged in successfully!", {
                    duration: 2000,
                    position: "top-right",
                });
                localStorage.setItem('token', result.token);
                localStorage.setItem("role", "student");
                localStorage.setItem("username", result.student.username);
                localStorage.setItem("usn", result.student.usn);

                setTimeout(() => {
                    navigate("/studentdash", {
                        replace: true,
                        state: {
                            usn: result.student.usn,
                            username: result.username,
                        }
                    });
                }, 2000);
            } else {
                toast.error(result.message, {
                    duration: 2000,
                    position: "top-right",
                });
            }
        } catch (error) {
            toast.error("Server error", {
                duration: 2000,
                position: "top-right",
            });
        }
    }

    return (
        <>
            <Toaster />
            {/* Inline CSS to handle the animation without touching config files */}
            <style>
                {`
                @keyframes panBackground {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 100% 50%; }
                }

                .animate-pan-bg {
                    background-image: url('./src/assets/college.jpg');
                    background-size: 140% auto; /* Larger than screen to allow sliding */
                    background-repeat: no-repeat;
                    animation: panBackground 20s linear infinite alternate;
                }

                @media (max-width: 768px) {
                    .animate-pan-bg {
                        background-size: auto 110%; /* Mobile height adjustment */
                    }
                }
                `}
            </style>

            <main className="min-h-screen w-full flex justify-center items-center animate-pan-bg font-sans overflow-hidden relative">

                {/* Dark overlay to make the glass card pop against the moving photo */}
                <div className="absolute inset-0 bg-black/30 z-0 pointer-events-none"></div>

                <div className="relative w-full max-w-sm p-10 rounded-[20px] backdrop-blur-[15px] bg-white/10 border border-white/40 shadow-[0_25px_45px_rgba(0,0,0,0.4)] z-10 overflow-hidden group">
                    <div className='flex h-[15vh] justify-center items-center'>
                        <h2 className="text-white text-[20px] font-semibold text-center tracking-wide mb-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                            Smart College Utility Portal
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className='w-full flex flex-col gap-5'>
                        {/* <div className="w-full">
                            <input
                                type="text"
                                placeholder='Username'
                                className='peer w-full p-4 bg-white/20 border-none outline-none rounded-[35px] text-base text-white text-center placeholder-white/70 shadow-lg transition-all duration-300 focus:bg-white/30'
                                {...register("username", { required: { value: true, message: "Username is required" } })}
                            />
                            {errors.username && <p className='text-white text-xs mt-1 ml-4'>{errors.username.message}</p>}
                        </div> */}

                        <div className="w-full">
                            <input
                                type="text"
                                placeholder='USN'
                                className=' peer w-full p-4 bg-white/20 border-none outline-none rounded-[35px] text-base text-white  placeholder-white/70 shadow-lg transition-all duration-300 focus:bg-white/30'
                                {...register("usn", { required: { value: true, message: "USN is required" } })}
                            />
                            {errors.usn && <p className='text-white text-xs mt-1 ml-4'>{errors.usn.message}</p>}

                        </div>


                        <div className="w-full flex">
                            <input
                                // type={showPassword ? "text" : "password"}
                                type='password'
                                // type='password'
                                placeholder='Password'
                                className='peer w-full p-4 bg-white/20 border-none outline-none rounded-[35px] text-base text-white  placeholder-white/70 shadow-lg transition-all duration-300 focus:bg-white/30'
                                {...register("password", { required: { value: true, message: "Password is required" } })}
                            />
                            {/* <button className='w-1/6 p-4 bg-white/20 border-none outline-none rounded-[35px] text-base text-white text-center placeholder-white/70 shadow-lg transition-all focus:bg-white/30' type='button' onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? "Hide" : "Show"}</button> */}

                        </div>
                      
                            {errors.password && <p className='text-white text-xs mt-1 ml-4'>{errors.password.message}</p>}
                        <button
                            disabled={isSubmitting}
                            type='submit'
                            className='peer w-full mt-2 p-3 bg-[rgba(255,85,0,0.7)] border-none outline-none rounded-[35px] text-white text-base font-bold cursor-pointer transition-all duration-300 hover:bg-[rgba(255,85,0,0.9)] hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.3)] active:scale-95'
                        >
                            {isSubmitting ? "Logging in..." : "Login"}
                        </button>
                    </form>
                </div>
            </main>
        </>
    )
}

export default Studentlogin
