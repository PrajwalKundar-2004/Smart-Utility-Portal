import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { motion } from 'framer-motion';

// Icons
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/50">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
    </svg>
);

const KeyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/50">
        <circle cx="7.5" cy="15.5" r="5.5"/>
        <path d="m21 2-9.6 9.6"/>
        <path d="m15.5 7.5 3 3L22 7l-3-3"/>
    </svg>
);

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/50">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
);

const EyeOpenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
        <circle cx="12" cy="12" r="3"/>
    </svg>
);

const EyeClosedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60">
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
        <line x1="2" x2="22" y1="2" y2="22"/>
    </svg>
);

const Lecturelogin = () => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showSecretKey, setShowSecretKey] = useState(false);
    const [lockoutTimer, setLockoutTimer] = useState(0);

    // Check localStorage on mount for existing lockout
    useEffect(() => {
        const expiry = localStorage.getItem('lectureLockoutExpiry');
        if (expiry) {
            const remaining = Math.ceil((parseInt(expiry) - Date.now()) / 1000);
            if (remaining > 0) {
                setLockoutTimer(remaining);
            } else {
                localStorage.removeItem('lectureLockoutExpiry');
            }
        }
    }, []);

    useEffect(() => {
        let interval = null;
        if (lockoutTimer > 0) {
            interval = setInterval(() => {
                setLockoutTimer((prev) => {
                    if (prev <= 1) {
                        localStorage.removeItem('lectureLockoutExpiry');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (interval) {
            clearInterval(interval);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [lockoutTimer]);

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
                localStorage.setItem("lectureName", data.name.trim());
                setTimeout(() => { navigate('/lecturedash', { replace: true }); }, 2000);
            } else {
                if (response.status === 429 || result.remainingSeconds) {
                    setLockoutTimer(result.remainingSeconds);
                    localStorage.setItem('lectureLockoutExpiry', Date.now() + result.remainingSeconds * 1000);
                    toast.error(result.message, { duration: 3000, position: "top-right", icon: "⏳" });
                } else {
                    toast.error(result.message, { duration: 2000, position: "top-right" });
                }
            }
        } catch (error) {
            toast.error("Server error", { duration: 2000, position: "top-right" });
            console.log(error);
        }
    };

    return (
        <>
            <Toaster />
            <style>{`
                input[type="password"]::-ms-reveal,
                input[type="password"]::-ms-clear { display: none; }
                input::-webkit-credentials-auto-fill-button { display: none !important; }

                @keyframes panBackground {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 100% 50%; }
                }
                .animate-pan {
                    background-image: url('./src/assets/college.jpg');
                    background-size: 130% auto;
                    background-repeat: no-repeat;
                    animation: panBackground 40s linear infinite alternate;
                }
                @media (max-width: 768px) {
                    .animate-pan { background-size: cover; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                .animate-float { animation: float 6s ease-in-out infinite; }
            `}</style>

            <main className="fixed inset-0 flex flex-col justify-center items-center animate-pan font-sans px-4 sm:px-6 overflow-y-auto">

                {/* Dark overlay for readability */}
                <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>

                {/* Floating ambient orbs */}
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none animate-float"></div>
                <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" style={{animationDelay: '3s', animation: 'float 8s ease-in-out infinite'}}></div>

                {/* Glass Card */}
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, type: 'spring', bounce: 0.3 }}
                    className="relative z-10 mx-auto w-[78vw] max-w-[240px] sm:w-full sm:max-w-[420px] backdrop-blur-xl bg-white/10 border border-white/25 shadow-[0_25px_60px_rgba(0,0,0,0.5)] rounded-2xl sm:rounded-3xl p-4 sm:p-10 flex flex-col items-center"
                >

                    {/* Inner top shimmer */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-t-3xl"></div>

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-center mb-5 sm:mb-10"
                    >
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-400/30 rounded-full px-3 py-1 mb-2 sm:mb-4">
                            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                            <span className="text-orange-300 text-[10px] sm:text-xs font-semibold tracking-widest uppercase">Staff Portal</span>
                        </div>
                        <h2 className="text-white text-lg sm:text-2xl font-extrabold tracking-tight drop-shadow-lg">
                            Smart College
                        </h2>
                        <p className="text-white/50 text-[11px] sm:text-sm font-medium mt-1">Utility Portal — Lecturer Access</p>
                    </motion.div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col items-center gap-1 sm:gap-3">
                        {/* Inner wrapper with side gaps */}
                        <div className="w-[85%] sm:w-[88%] flex flex-col gap-1 sm:gap-3">

                        {/* Name Field */}
                        <motion.div className="w-full"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3, duration: 0.4 }}
                        >
                            <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 h-9 sm:h-10 focus-within:border-white/50 focus-within:bg-white/15 transition-all duration-200">
                                <UserIcon />
                                <input
                                    type="text"
                                    placeholder="Your Name"
                                    className="flex-1 h-full bg-transparent border-none outline-none text-white placeholder-white/40 text-xs sm:text-sm font-medium"
                                    {...register("name", { required: "Name is required" })}
                                />
                            </div>
                            <div className="h-4 mt-0.5 ml-1">
                                {errors.name && <p className="text-red-300 text-[10px]">{errors.name.message}</p>}
                            </div>
                        </motion.div>

                        {/* Secret Key Field */}
                        <motion.div className="w-full"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4, duration: 0.4 }}
                        >
                            <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 h-9 sm:h-10 focus-within:border-white/50 focus-within:bg-white/15 transition-all duration-200 relative">
                                <KeyIcon />
                                <input
                                    type={showSecretKey ? "text" : "password"}
                                    placeholder="Secret Key"
                                    className="flex-1 h-full bg-transparent border-none outline-none text-white placeholder-white/40 text-xs sm:text-sm font-medium pr-7"
                                    {...register("secret_key", { required: "Secret Key is required" })}
                                />
                                <button type="button" onClick={() => setShowSecretKey(!showSecretKey)} className="absolute right-3 flex items-center justify-center h-full outline-none">
                                    {showSecretKey ? <EyeClosedIcon /> : <EyeOpenIcon />}
                                </button>
                            </div>
                            <div className="h-4 mt-0.5 ml-1">
                                {errors.secret_key && <p className="text-red-300 text-[10px]">{errors.secret_key.message}</p>}
                            </div>
                        </motion.div>

                        {/* Password Field */}
                        <motion.div className="w-full"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5, duration: 0.4 }}
                        >
                            <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 h-9 sm:h-10 focus-within:border-white/50 focus-within:bg-white/15 transition-all duration-200 relative">
                                <LockIcon />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    className="flex-1 h-full bg-transparent border-none outline-none text-white placeholder-white/40 text-xs sm:text-sm font-medium pr-7"
                                    {...register("password", { required: "Password is required" })}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 flex items-center justify-center h-full outline-none">
                                    {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                                </button>
                            </div>
                            <div className="h-4 mt-0.5 ml-1">
                                {errors.password && <p className="text-red-300 text-[10px]">{errors.password.message}</p>}
                            </div>
                        </motion.div>

                        {/* Submit Button */}
                        <motion.div className="flex justify-center"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.4 }}
                        >
                        <motion.button
                            disabled={isSubmitting || lockoutTimer > 0}
                            type="submit"
                            whileTap={{ scale: 0.93 }}
                            whileHover={{ scale: 1.04 }}
                            className={`w-[60%] h-8 sm:h-9 mt-1 text-white font-bold text-xs sm:text-sm rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-shadow duration-200 disabled:opacity-70 flex items-center justify-center gap-2 overflow-hidden
                                ${lockoutTimer > 0 ? 'bg-[#444] shadow-none hover:shadow-none cursor-not-allowed' : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-[0_0_30px_rgba(249,115,22,0.6)]'}`}
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin w-3 h-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                    </svg>
                                    <span>Authenticating...</span>
                                </>
                            ) : lockoutTimer > 0 ? (
                                <span>Try again in {lockoutTimer}s...</span>
                            ) : "Login"}
                        </motion.button>
                        </motion.div>

                        </div>
                    </form>

                    {/* Footer */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                        className="text-white/30 text-[11px] sm:text-xs text-center mt-5 sm:mt-6"
                    >
                        Access restricted to authorized staff only
                    </motion.p>
                </motion.div>
            </main>
        </>
    );
};

export default Lecturelogin;
