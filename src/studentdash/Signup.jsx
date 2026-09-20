import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { motion } from 'framer-motion';
import graduationCap from '../assets/graduation-cap.svg';
import padlock from '../assets/padlock.png';
import user from '../assets/user.png';
import toast, { Toaster } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

const Signup = () => {
    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
    const password = watch("create_password", "");
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const onSubmit = async (data) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/student/signup`, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    usn: data.usn,
                    create_password: data.create_password,
                    username: data.username
                })
            });

            const result = await response.json();
            if (result.success) {
                toast.success("Signed up successfully!", { duration: 2000, position: "top-right" });
                setTimeout(() => navigate("/studentlogin"), 2000);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("An error occurred during signup");
        }
    }

    const EyeOpenIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 hover:text-purple-600 transition-colors">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
            <circle cx="12" cy="12" r="3"/>
        </svg>
    );

    const EyeClosedIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 hover:text-purple-600 transition-colors">
            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
            <line x1="2" x2="22" y1="2" y2="22"/>
        </svg>
    );

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { 
            opacity: 1, 
            y: 0, 
            transition: { type: "spring", stiffness: 300, damping: 24 } 
        }
    };

    return (
        <>
            <style>{`
                input[type="password"]::-ms-reveal,
                input[type="password"]::-ms-clear { display: none; }
                input::-webkit-credentials-auto-fill-button { display: none !important; }
            `}</style>
            <Toaster />
            {/* Background Container */}
            <main className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-[#a18cd1] to-[#fbc2eb] relative overflow-hidden font-sans">
                
                {/* Subtle animated floating shapes for eye-catchiness */}
                <div className="absolute top-0 left-10 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
                <div className="absolute top-20 right-10 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-10 left-1/3 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>

                {/* Glassmorphism Card */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="relative z-10 w-full max-w-[270px] sm:max-w-[450px] bg-white/80 backdrop-blur-2xl border border-white/60 shadow-2xl rounded-[30px] sm:rounded-[40px] p-4 sm:p-10 flex flex-col items-center"
                >
                    
                    {/* Header */}
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex flex-col items-center mb-4 sm:mb-6"
                    >
                        <motion.div 
                            whileHover={{ rotate: 360, scale: 1.1 }}
                            transition={{ duration: 0.6 }}
                            className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center shadow-lg mb-2 sm:mb-4 border border-white"
                        >
                            <img src={graduationCap} alt="Graduation Cap" className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" />
                        </motion.div>
                        <h1 className="text-xl sm:text-3xl font-extrabold text-slate-800 tracking-tight text-center">Student Sign Up</h1>
                        <p className="text-slate-700 mt-1 text-[12px] sm:text-[14px] font-medium text-center">Create your Smart Portal account</p>
                    </motion.div>

                    {/* Form */}
                    <motion.form 
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        onSubmit={handleSubmit(onSubmit)} 
                        className="w-[88%] sm:w-[90%] space-y-1"
                    >
                        
                        {/* Username */}
                        <motion.div variants={itemVariants} className="w-full">
                            <div className="flex items-center bg-white rounded-xl h-9 sm:h-[42px] shadow-sm border border-slate-200 px-3 hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-purple-400">
                                <img src={user} alt="user" className="w-[18px] h-[18px] opacity-60 mr-3" />
                                <input 
                                    type="text" 
                                    placeholder="Username" 
                                    className="w-full h-full bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 text-xs sm:text-sm font-medium"
                                    {...register("username", { required: "Username is required" })}
                                />
                            </div>
                            <div className="h-5 sm:h-[22px] mt-0.5 ml-3 flex items-start">
                                {errors.username && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-[10px] sm:text-[11px] font-bold tracking-wide">{errors.username.message}</motion.p>}
                            </div>
                        </motion.div>

                        {/* USN */}
                        <motion.div variants={itemVariants} className="w-full">
                            <div className="flex items-center bg-white rounded-xl h-9 sm:h-[42px] shadow-sm border border-slate-200 px-3 hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-purple-400">
                                <input 
                                    type="text" 
                                    placeholder="USN (e.g. 4VP21CS001)" 
                                    className="w-full h-full bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 text-xs sm:text-sm font-medium uppercase"
                                    {...register("usn", { required: "USN is required" })}
                                />
                            </div>
                            <div className="h-5 sm:h-[22px] mt-0.5 ml-3 flex items-start">
                                {errors.usn && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-[10px] sm:text-[11px] font-bold tracking-wide">{errors.usn.message}</motion.p>}
                            </div>
                        </motion.div>

                        {/* Password */}
                        <motion.div variants={itemVariants} className="w-full">
                            <div className="flex items-center bg-white rounded-xl h-9 sm:h-[42px] shadow-sm border border-slate-200 px-3 hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-purple-400 relative">
                                <img src={padlock} alt="padlock" className="w-[18px] h-[18px] opacity-60 mr-3" />
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="Create a Password" 
                                    className="w-full h-full bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 text-xs sm:text-sm font-medium pr-10"
                                    {...register("create_password", { 
                                        required: "Password is required",
                                        minLength: { value: 8, message: "Min 8 characters" },
                                        maxLength: { value: 15, message: "Max 15 characters" }
                                    })}
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 flex items-center justify-center h-full outline-none"
                                >
                                    {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                                </button>
                            </div>
                            <div className="h-5 sm:h-[22px] mt-0.5 ml-3 flex items-start">
                                {errors.create_password && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-[10px] sm:text-[11px] font-bold tracking-wide">{errors.create_password.message}</motion.p>}
                            </div>
                        </motion.div>

                        {/* Confirm Password */}
                        <motion.div variants={itemVariants} className="w-full">
                            <div className="flex items-center bg-white rounded-xl h-9 sm:h-[42px] shadow-sm border border-slate-200 px-3 hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-purple-400 relative">
                                <img src={padlock} alt="padlock" className="w-[18px] h-[18px] opacity-60 mr-3" />
                                <input 
                                    type={showConfirmPassword ? "text" : "password"} 
                                    placeholder="Confirm Password" 
                                    className="w-full h-full bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 text-xs sm:text-sm font-medium pr-10"
                                    {...register("confirm_password", {
                                        required: "Please confirm password",
                                        validate: value => value === password || "Passwords do not match"
                                    })}
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 flex items-center justify-center h-full outline-none"
                                >
                                    {showConfirmPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                                </button>
                            </div>
                            <div className="h-5 sm:h-[22px] mt-0.5 ml-3 flex items-start">
                                {errors.confirm_password && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-[10px] sm:text-[11px] font-bold tracking-wide">{errors.confirm_password.message}</motion.p>}
                            </div>
                        </motion.div>

                        {/* Submit Button */}
                        <motion.div variants={itemVariants} className="flex justify-center mt-4 mb-2">
                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={isSubmitting} 
                                type="submit" 
                                className="w-[60%] bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-extrabold text-sm sm:text-lg h-9 sm:h-[40px] rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70 flex justify-center items-center gap-3"
                            >
                                {isSubmitting ? "Creating..." : "Sign Up"}
                            </motion.button>
                        </motion.div>
                    </motion.form>

                    {/* Footer Link */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        className="mt-8 text-center"
                    >
                        <span className="text-slate-800 text-xs sm:text-[15px] font-semibold">
                            Already have an account?{' '}
                            <Link to="/studentlogin" className="font-extrabold text-purple-800 hover:text-purple-600 hover:underline transition-colors">
                                Login here
                            </Link>
                        </span>
                    </motion.div>
                </motion.div>
            </main>

            <style>
                {`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                `}
            </style>
        </>
    );
};

export default Signup;
