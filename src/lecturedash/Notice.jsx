import React from 'react'
import Navbar1 from '../components/Navbar1'
import { useForm } from "react-hook-form";

const Notice = () => {
    const { register, handleSubmit, reset } = useForm();
    const onSubmit = async (data) => {
        try {
            const response = await fetch("http://localhost:3000/api/lecture/notice",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                }
            );
            const result = await response.json();
            alert(result.message);
            reset();
        }
        catch (error) {
            console.log(error);
        }

    };
    return (
        <main>
            <Navbar1/>
            <div className="h-[85vh] w-full flex items-center justify-center bg-linear-to-br from-sky-100 to-blue-200 p-4">

                <div className="bg-white shadow-xl rounded-2xl p-8 w-1/2 border border-blue-100 h-[70vh] flex flex-col gap-6">

                    <h2 className="text-2xl font-bold text-center text-blue-600 mb-6 h-[5vh]">
                        Post Notice
                    </h2>
                    <form onSubmit={handleSubmit(onSubmit)} className=" flex flex-col gap-10 ">

                        {/* Title */}
                        <div className='w-full h-[15vh]'>
                            <label className="block text-lg font-medium text-gray-700 mb-1">
                                Notice Title
                            </label>

                            <input
                                {...register("title")}
                                placeholder="Enter notice title"
                                required
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition" />
                        </div>
                        {/* Message */}
                        <div className='w-full h-[20vh]'>
                            <label className="block text-lg font-medium text-gray-700 mb-1">
                                Notice Message
                            </label>

                            <textarea
                                {...register("message")}
                                placeholder="Enter notice message"
                                required
                                rows="4"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition resize-none"
                            />
                        </div>
                        {/* Button */}
                        <div className='w-full h-[18vh]'>
                        <button
                            type="submit"
                            className="w-full h-1/2 bg-blue-500 text-white font-semibold py-2 rounded-lg hover:bg-blue-600 transition duration-300 shadow-md hover:shadow-lg flex items-center justify-center">
                            Send Notice
                        </button>
                        </div>
                    </form>
                </div>
            </div>
       </main>
    )
}

export default Notice
