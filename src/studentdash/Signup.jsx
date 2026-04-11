import React from 'react'
import { useForm } from "react-hook-form"
import graduationCap from '../assets/graduation-cap.svg'
import padlock from '../assets/padlock.png'
import user from '../assets/user.png'
import toast, { Toaster } from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'


const Signup = () => {
    const {
        register,
        handleSubmit,
        watch,
        setError,
        formState: { errors, isSubmitting },
    } = useForm();
    const password = watch("create_password", "");
    const navigate = useNavigate();
    // const [showPassword, setShowPassword] = useState(false);

    const onSubmit = async (data) => {
        try {
            const response = await fetch('http://localhost:3000/api/student/signup', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    usn: data.usn,
                    create_password: data.create_password,
                    username: data.username
                })
            });

            const result = await response.json();
            if (result.success) {
                toast.success("Signed up successfully!", {
                    duration: 2000,
                    position: "top-right",
                })
                console.log(data)
                setTimeout(() => {
                    navigate("/studentlogin")
                }, 2000);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("An error occurred during signup");
        }
    }
    return (
        <>
            <Toaster />
            <main className='bg-linear-to-r from-[rgb(213,228,245)] to-[rgb(193,211,237)] h-screen w-full flex items-center justify-center gap-10'>

                <div className='bg-linear-to-r from-[rgb(213,228,245)] to-[rgb(193,211,237)] w-1/2 rounded-2xl  h-[95vh] flex flex-col items-center  gap-3'>
                    <div className='flex h-[8vh] w-full bg justify-center items-center gap-4 bg-white rounded-t-2xl '>
                        <img src={graduationCap} alt="Graduation Cap" className='w-4 h-4' /> <h2>Smart Portal</h2>
                    </div>
                    <section className="flex flex-col justify-end items-center h-[12vh] w-full">
                        <h1 className="text-3xl font-bold font-sans text-purple-900">Student Sign Up</h1>
                        <p className="text-gray-600">Access the Smart Portal</p>
                    </section>
                    <div className='flex flex-col justify-center items-center align-middle h-[50vh] w-full'>
                        <form onSubmit={handleSubmit(onSubmit)} className='h-full w-3/4 '>
                            <div className='flex w-full items-center justify-center  gap-4 bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200 h-[8vh]'>
                                <img src={user} alt="user" className="w-6 h-6" />
                                <input type="text" placeholder='Username' className='w-3/4 h-1/2 px-2 border border-gray-300 rounded-md focus:outline-none '{...register("username", { required: { value: true, message: "Username is required" } })} />
                            </div>
                            {errors.username && <p className='text-red-700 text-sm self-start'>{errors.username.message}</p>}
                            <br />

                            <div className="flex w-full items-center justify-center  gap-4 bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200 h-[8vh]">
                                <input
                                    type="text"
                                    placeholder="Enter Your USN(25MC0..)"
                                    {...register("usn", { required: { value: true, message: "USN is Required" } })}
                                    className="w-3/4 h-1/2 px-2 border border-gray-300 rounded-md focus:outline-none "
                                />
                            </div>
                            {errors.usn && <p className="text-red-700 text-sm mt-1">{errors.usn.message}</p>}
                            <br />
                            <div className="flex w-full items-center justify-center  gap-4 bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200 h-[8vh]">
                                <img src={padlock} alt="padlock" className="w-6 h-6" />
                                <input
                                    // type={showPassword ? "text" : "password"}
                                    type='password'
                                    placeholder="Create a Password"
                                    {...register("create_password", { required: { value: true, message: "Password is Required" }, minLength: { value: 8, message: "Password must be at least 8 characters long" }, maxLength: { value: 15, message: "Password must be less than 15 characters long" } })}
                                    className="w-3/4 h-1/2 px-2 border border-gray-300 rounded-md focus:outline-none "
                                />
                                {/* <button className='bg-sky-100 rounded-[5px] border-0 p-1' type='button' onClick={()=>setShowPassword(!showPassword)}>
                                    {showPassword ? "Hide" : "Show"}</button> */}
                            </div>
                            {errors.create_password && <p className="text-red-700 text-sm mt-1">{errors.create_password.message}</p>}
                            <br />


                            <div className="flex w-full items-center justify-center  gap-4 bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200 h-[8vh]">
                                <img src={padlock} alt="padlock" className="w-6 h-6" />
                                <input
                                    // type={showPassword ? "text" : "password"}
                                    type='password'
                                    placeholder="Confirm Your Password"
                                    {...register("confirm_password", {
                                        required: { value: true, message: "Please confirm your password" }
                                        , validate: value => value === password || "Passwords do not match"
                                    })}
                                    className="w-3/4 h-1/2 px-2 border border-gray-300 rounded-md focus:outline-none "
                                />
                                 {/* <button className='bg-sky-100 rounded-[5px] border-0 p-1' type='button' onClick={()=>setShowPassword(!showPassword)}>
                                    {showPassword ? "Hide" : "Show"}</button> */}
                            </div>
                            {errors.confirm_password && <p className="text-red-700 text-sm mt-1">{errors.confirm_password.message}</p>}

                            <br />
                            <div className='flex justify-center  text-center h-[8vh]'>
                                <button disabled={isSubmitting} type="submit" className='cursor-pointer bg-purple-300 font-bold px-4 py-2    rounded-3xl w-1/2 text-2xl text-purple-900 hover:bg-purple-200 focus:bg-purple-700'>Sign Up</button>
                            </div>
                            <div className='flex justify-center'>
                                <Link to="/studentlogin" className="text-purple-700 hover:text-purple-900">Already have an account? Login</Link>
                            </div>
                        </form>
                    </div>
                </div>

            </main>

        </>
    )
}

export default Signup
