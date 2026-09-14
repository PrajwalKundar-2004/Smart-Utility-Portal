import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from 'framer-motion';

// Icons
const UserIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

const PadlockIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
);

const Studentlogin = () => {
    const { register, handleSubmit, watch, formState: { errors, isSubmitting, isValid } } = useForm({
        mode: 'onChange'
    });
    const navigate = useNavigate();
    const [isLampOn, setIsLampOn] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [lockoutTimer, setLockoutTimer] = useState(0);

    const usnValue = watch("usn", "");
    const passwordValue = watch("password", "");
    const isFormValid = isValid && Boolean(usnValue && usnValue.trim().length > 0) && Boolean(passwordValue && passwordValue.trim().length > 0);

    // Check localStorage on mount for existing lockout
    useEffect(() => {
        const expiry = localStorage.getItem('studentLockoutExpiry');
        if (expiry) {
            const remaining = Math.ceil((parseInt(expiry) - Date.now()) / 1000);
            if (remaining > 0) {
                setLockoutTimer(remaining);
            } else {
                localStorage.removeItem('studentLockoutExpiry');
            }
        }
    }, []);

    useEffect(() => {
        let interval = null;
        if (lockoutTimer > 0) {
            interval = setInterval(() => {
                setLockoutTimer((prev) => {
                    if (prev <= 1) {
                        localStorage.removeItem('studentLockoutExpiry');
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

    const EyeOpenIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
            <circle cx="12" cy="12" r="3"/>
        </svg>
    );

    const EyeClosedIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
            <line x1="2" x2="22" y1="2" y2="22"/>
        </svg>
    );

    const onSubmit = async (data) => {
        if (!isFormValid || lockoutTimer > 0) return;
        try {
            const response = await fetch('http://localhost:3000/api/student/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usn: data.usn,
                    password: data.password
                })
            });
            const result = await response.json();
            if (result.success) {
                toast.success("Logged in successfully!", { duration: 2000, position: "top-right" });
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
                if (response.status === 429 || result.remainingSeconds) {
                    setLockoutTimer(result.remainingSeconds);
                    localStorage.setItem('studentLockoutExpiry', Date.now() + result.remainingSeconds * 1000);
                    toast.error(result.message, { duration: 3000, position: "top-right", icon: "⏳" });
                } else {
                    toast.error(result.message, { duration: 2000, position: "top-right" });
                }
            }
        } catch (error) {
            toast.error("Server error", { duration: 2000, position: "top-right" });
        }
    }

    const toggleLamp = () => {
        setIsLampOn(prev => !prev);
    };

    return (
        <>
            <style>{`
                input[type="password"]::-ms-reveal,
                input[type="password"]::-ms-clear { display: none; }
                input::-webkit-credentials-auto-fill-button { display: none !important; }
                input[type="password"]::-webkit-textfield-decoration-container { visibility: hidden; }
            `}</style>
            <Toaster />
            <main className="min-h-screen w-full bg-[#0a0a0a] flex flex-col lg:flex-row items-center justify-center relative overflow-hidden font-sans">
                
                {/* Ambient glow in the room when lamp is on */}
                <div className={`absolute inset-0 bg-[#ffcc00]/5 transition-opacity duration-1000 pointer-events-none ${isLampOn ? 'opacity-100' : 'opacity-0'}`}></div>

                {/* Fireflies / Ambient particles */}
                <AnimatePresence>
                    {isLampOn && (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                            className="absolute inset-0 pointer-events-none"
                        >
                            {[...Array(15)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-[8px] h-[8px] bg-[#ffea75] rounded-full shadow-[0_0_15px_rgba(255,234,117,1)]"
                                    initial={{
                                        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                                        y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
                                        opacity: Math.random() * 0.5 + 0.3
                                    }}
                                    animate={{
                                        y: [null, Math.random() * -150 - 50],
                                        opacity: [0.1, 1, 0.1]
                                    }}
                                    transition={{
                                        duration: Math.random() * 8 + 8,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* LAMP SECTION */}
                <div className="relative w-full lg:w-1/2 h-[45vh] lg:h-screen flex flex-col justify-end lg:justify-center items-center z-10 pb-10 lg:pb-0">
                    <div className="relative flex flex-col items-center scale-[0.65] lg:scale-100 origin-bottom lg:origin-center transition-transform duration-500">
                        
                        {/* Lamp Shade (Reverted to previous design) */}
                        <div className="w-48 h-20 bg-[#1f1f1f] rounded-t-[100px] z-20 relative flex justify-center items-end pb-1 shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                            {/* Inner bulb glow */}
                            <div className={`w-36 h-3 rounded-full blur-sm transition-all duration-300 ${isLampOn ? 'bg-[#ffeaa7] shadow-[0_0_30px_rgba(255,204,0,1)]' : 'bg-[#333]'}`}></div>
                        </div>

                        {/* Light Cone */}
                        <div 
                            className={`absolute top-20 w-[180vw] lg:w-[900px] h-[100vh] pointer-events-none transition-all duration-700 origin-top z-10 ${isLampOn ? 'opacity-100' : 'opacity-0'}`}
                            style={{
                                background: 'linear-gradient(to bottom, rgba(255, 234, 167, 0.4) 0%, rgba(255, 204, 0, 0.1) 40%, rgba(0,0,0,0) 100%)',
                                clipPath: 'polygon(calc(50% - 96px) 0, calc(50% + 96px) 0, 100% 100%, 0 100%)',
                            }}
                        ></div>

                        {/* Pull String (Draggable and Elastic) */}
                        <motion.div 
                            className="absolute top-20 right-[50px] z-30 flex flex-col items-center cursor-grab active:cursor-grabbing"
                            drag="y"
                            dragConstraints={{ top: 0, bottom: 60 }}
                            dragElastic={0.4}
                            dragSnapToOrigin={true}
                            onDragEnd={(e, info) => {
                                // Trigger toggle if pulled down by more than 15px
                                if (info.offset.y > 15) {
                                    toggleLamp();
                                }
                            }}
                            // Keep click as a fallback just in case
                            onClick={toggleLamp} 
                        >
                            {/* String line */}
                            <div className="w-[2px] h-20 bg-[#444] shadow-sm"></div>
                            {/* String knob */}
                            <div className={`w-[14px] h-[18px] rounded-full transition-colors duration-300 border border-[#222] ${isLampOn ? 'bg-[#ffcc00] shadow-[0_0_12px_rgba(255,204,0,0.9)]' : 'bg-[#777]'}`}></div>
                        </motion.div>

                        {/* Lamp Stand */}
                        <div className="w-3 h-64 lg:h-[400px] bg-[#111] z-0 shadow-inner border-l border-[#222]"></div>
                        
                        {/* Lamp Base */}
                        <div className="w-32 h-4 bg-[#111] rounded-t-2xl z-0 border-t border-[#222]"></div>
                    </div>

                    {/* Hint text if off */}
                    {!isLampOn && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1, duration: 1 }}
                            className="absolute bottom-2 lg:bottom-1/4 text-center pointer-events-none"
                        >
                            <p className="text-gray-300 tracking-[0.2em] text-sm font-bold animate-pulse">PULL STRING TO LOGIN</p>
                        </motion.div>
                    )}
                </div>

                {/* FORM SECTION */}
                <div className="w-full lg:w-1/2 h-[55vh] lg:h-screen flex items-start lg:items-center justify-center p-3 lg:p-8 z-20">
                    <AnimatePresence>
                        {isLampOn && (
                            <motion.div 
                                key="login-form"
                                initial={{ opacity: 0, y: 40, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.96 }}
                                transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
                                className="w-full max-w-[300px] lg:max-w-[400px] min-h-[380px] lg:min-h-[420px] bg-[#161616] border border-[#2c2c2c] rounded-2xl py-7 lg:py-10 flex flex-col items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.7)] relative"
                            >
                                {/* Subtle yellow glow behind card */}
                                <div className="absolute -inset-[1px] bg-gradient-to-b from-[#ffcc00]/10 to-transparent rounded-2xl opacity-50 pointer-events-none blur-sm"></div>
                                
                                <div className="relative z-10 w-[75%] lg:w-[85%]">
                                    <div className="text-center mb-8 lg:mb-12">
                                        <h2 className="text-xl lg:text-[26px] font-extrabold text-white mb-2 tracking-tight">Welcome Back</h2>
                                        <p className="text-gray-400 text-xs lg:text-[13px] font-medium">Enter your details to access your account</p>
                                    </div>

                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 lg:space-y-5">
                                        {/* USN Input */}
                                        <div className="w-full">
                                            <div className="flex items-center bg-[#0a0a0a] rounded-xl h-10 lg:h-[44px] border border-[#333] px-4 focus-within:border-[#ffcc00] transition-colors shadow-inner">
                                                <UserIcon className="w-4 h-4 text-gray-500 mr-3" />
                                                <input 
                                                    type="text" 
                                                    placeholder="USN" 
                                                    required
                                                    className="w-full h-full bg-transparent border-none outline-none text-white placeholder-gray-600 text-xs lg:text-sm font-medium uppercase"
                                                    {...register("usn", { 
                                                        required: "USN is required",
                                                        validate: value => (value && value.trim().length > 0) || "USN is required"
                                                    })}
                                                />
                                            </div>
                                            <div className="h-4 mt-1 ml-1 flex items-start">
                                                {errors.usn && <p className="text-red-500 text-[10px] lg:text-[11px] font-bold">{errors.usn.message}</p>}
                                            </div>
                                        </div>

                                        {/* Password Input */}
                                        <div className="w-full">
                                            <div className="flex items-center bg-[#0a0a0a] rounded-xl h-10 lg:h-[44px] border border-[#333] px-4 focus-within:border-[#ffcc00] transition-colors shadow-inner relative">
                                                <PadlockIcon className="w-4 h-4 text-gray-500 mr-3" />
                                                <input 
                                                    type={showPassword ? "text" : "password"} 
                                                    placeholder="Password" 
                                                    required
                                                    className="w-full h-full bg-transparent border-none outline-none text-white placeholder-gray-600 text-xs lg:text-sm font-medium pr-8"
                                                    {...register("password", { 
                                                        required: "Password is required",
                                                        validate: value => (value && value.trim().length > 0) || "Password is required"
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
                                            <div className="h-4 mt-1 ml-1 flex items-start">
                                                {errors.password && <p className="text-red-500 text-[10px] lg:text-[11px] font-bold">{errors.password.message}</p>}
                                            </div>
                                        </div>

                                        {/* Submit */}
                                        <div className="flex justify-center pt-2">
                                            <button 
                                                type="submit"
                                                disabled={!isFormValid || isSubmitting || lockoutTimer > 0}
                                                className={`w-[70%] h-9 lg:h-[40px] font-extrabold text-sm lg:text-[15px] rounded-xl transition-all duration-300 flex justify-center items-center gap-2 transform ${
                                                    lockoutTimer > 0
                                                        ? 'bg-[#222] text-gray-500 shadow-none border border-[#333] cursor-not-allowed'
                                                        : isSubmitting
                                                        ? 'bg-neutral-800 text-neutral-400 cursor-wait shadow-none border border-neutral-700'
                                                        : isFormValid
                                                        ? 'bg-white text-black shadow-[0_0_25px_rgba(255,255,255,0.85)] hover:shadow-[0_0_35px_rgba(255,255,255,1)] hover:bg-neutral-100 cursor-pointer active:scale-[0.98]'
                                                        : 'bg-[#222] text-gray-500 border border-[#333] shadow-none cursor-not-allowed opacity-50'
                                                }`}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Signing in...
                                                    </>
                                                ) : lockoutTimer > 0 ? (
                                                    `Try again in ${lockoutTimer}s...`
                                                ) : (
                                                    "Sign In"
                                                )}
                                            </button>
                                        </div>
                                    </form>

                                    <div className="mt-6 text-center">
                                        <span className="text-gray-500 text-xs lg:text-[13px] font-medium">
                                            Don't have an account?{' '}
                                            <Link to="/signup" className="text-[#ffcc00] hover:text-[#ffdb4d] hover:underline font-bold transition-colors">
                                                Sign Up
                                            </Link>
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </>
    );
}

export default Studentlogin;
