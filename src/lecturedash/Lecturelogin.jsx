import React from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useForm } from "react-hook-form"
import { useState } from 'react'

const Lecturelogin = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm();
    const navigate = useNavigate();
    // const [showPassword, setShowPassword] = useState(false);

    const onSubmit = async (data) => {
        try {
            const response = await fetch('http://localhost:3000/api/lecture/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    secret_key: data.secret_key,
                    password: data.password
                })
            });
            const result = await response.json();

            if (result.success) {
                toast.success("Logged in successfully!", { duration: 2000, position: "top-right" });
                localStorage.setItem('token', result.token);
                localStorage.setItem("role", "lecture");
                setTimeout(() => { navigate('/lecturedash', { replace: true }); }, 2000);
            } else {
                toast.error(result.message, { duration: 2000, position: "top-right" });
            }
        } catch (error) {
            toast.error("Server error", { duration: 2000, position: "top-right" });
            console.log(error);
        }
    }

    return (
        <>
            <Toaster />
            {/* INLINE CSS FIX: This bypasses all Tailwind config issues */}
            <style>
                {`
                @keyframes panBackground {
                    0% { background-position: 0% 50%; }
                    
                    100% { background-position: 100% 50%; }
                }

                .animate-pan {
                    background-image: url('./src/assets/college.jpg'); /* Ensure path is correct */
                    background-size: 130% auto; /* Image is wider than screen to allow movement */
                    background-repeat: no-repeat;
                    animation: panBackground 40s linear infinite alternate;
                    // animation: panBackgoround 40s ease-in-out infinite;
                }

                @media (max-width: 768px) {
                    .animate-pan {
                        background-size: cover; /* Adjust for mobile height */
                    }
                }
                `}
            </style>

            <main 
            // className="min-h-screen w-full flex justify-center items-center animate-pan font-sans overflow-hidden"
            className="min-h-screen w-full flex justify-center items-center animate-pan font-sans px-4 sm:px-6"
            >

                {/* Darker Overlay to help the glass card stand out */}
                {/* <div className="absolute inset-0 bg-black/30 pointer-events-none"></div> */}

                {/* Glass Card */}
                <div 
                // className="relative w-full max-w-sm p-10 rounded-[20px] backdrop-blur-[15px] bg-white/10 border border-white/40 shadow-[0_25px_45px_rgba(0,0,0,0.4)] z-10 flex flex-col items-center"
                
                className="relative w-full max-w-sm sm:max-w-md p-6 sm:p-8 md:p-10 rounded-[20px] backdrop-blur-[15px] bg-white/10 border border-white/40 shadow-[0_25px_45px_rgba(0,0,0,0.4)] z-10 overflow-hidden group">

                    <div className="flex h-auto sm:h-[15vh] justify-center items-center py-4 sm:py-0">
                        <h2 
                        // className="text-white text-[20px] font-semibold text-center tracking-wide drop-shadow-lg"
                        className='text-white text-lg sm:text-[20px] font-semibold text-center tracking-wide mb-6 sm:mb-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]'
                        
                        >
                            Smart College Utility Portal
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4 sm:gap-5 ">
                        <div className="w-full">
                            <input
                                type="text"
                                placeholder="Secret Key"
                                // className="w-full p-4 bg-white/20 border-none outline-none rounded-[35px] text-base text-white text-center placeholder-white/70 shadow-lg transition-all focus:bg-white/30"
                                className='peer w-full p-3 sm:p-4 bg-white/20 border-none outline-none rounded-[35px] text-base text-black shadow-[0_5px_15px_rgba(0,0,0,0.5)] transition-all duration-300 focus:bg-white/30 focus:shadow-[0_8px_20px_rgba(0,0,0,0.1)] '
                                {...register("secret_key", { required: { value: true, message: "Secret Key is required" } })}
                            />
                            {errors.secret_key && <p className="text-white  text-xs mt-1 ml-4">{errors.secret_key.message}</p>}
                        </div>

                        <div className="w-full">
                            <input
                                // type={showPassword ? "text" : "password"}
                                // placeholder="Password"
                                type="password"
                                placeholder='Passowrd'
                                // className="w-full p-4 bg-white/20 border-none outline-none rounded-[35px] text-base text-white text-center placeholder-white/70 shadow-lg transition-all focus:bg-white/30"

                                className='peer w-full p-3 sm:p-4 bg-white/20 border-none outline-none rounded-[35px] text-base text-black shadow-[0_5px_15px_rgba(0,0,0,0.5)] transition-all duration-300 focus:bg-white/30 focus:shadow-[0_8px_20px_rgba(0,0,0,0.1)] '
                                {...register("password", { required: { value: true, message: "Password is required" } })}
                            />
                            {/* <button className='w-1/6 p-4 bg-white/20 border-none outline-none rounded-[35px] text-base text-white text-center placeholder-white/70 shadow-lg transition-all focus:bg-white/30' type='button' onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? "Hide" : "Show"}</button> */}
                        </div>
                            {errors.password && <p className="text-white text-xs mt-1 ml-4">{errors.password.message}</p>}
                        
                        <button
                            disabled={isSubmitting}
                            type="submit"
                            // className="w-full p-3 bg-[rgba(255,85,0,0.7)] border-none outline-none rounded-[35px] text-white text-lg font-bold cursor-pointer transition-all hover:bg-[rgba(255,85,0,0.9)] hover:-translate-y-1 active:scale-95 shadow-xl"
                            className='peer w-full p-3 sm:p-4 mt-2 bg-[rgba(255,85,0,0.7)] border-none outline-none rounded-[35px] text-white text-base sm:text-lg font-bold cursor-pointer text-center transition-all hover:bg-[rgba(255,85,0,0.9)] hover:-translate-y-1 active:scale-95 shadow-xl'
                        >
                            {isSubmitting ? "Authenticating..." : "Login"}
                        </button>
                    </form>
                </div>
            </main>
        </>
    )
}

export default Lecturelogin
