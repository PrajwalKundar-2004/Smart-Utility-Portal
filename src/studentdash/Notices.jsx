import React from 'react'
import Navbar2 from '../components/Navbar2'
import { useState, useEffect } from 'react'

const Notices = () => {
    const [notices, setNotices] = useState([]);
    useEffect(() => {
        fetch("http://localhost:3000/api/student/notices")
            .then(res => res.json())
            .then(data => setNotices(data))
            .catch(err => console.error("Error fetching notices:", err));
    }, []);

    return (
        <div>
            <Navbar2 />
            <div className="h-[90vh] bg-linear-to-br from-sky-50 to-blue-100 p-6">

                <div className="w-full flex flex-col items-center h-full">

                    {/* Page Title */}
                    <h2 className="text-3xl font-bold text-blue-700 mb-6 text-center h-1/6 flex items-center justify-center">
                        📢Student Notices
                    </h2>

                    {/* No notice message */}
                    {notices.length === 0 && (
                        <div className="text-center text-gray-500 text-lg">
                            No notices available
                        </div>
                    )}

                    {/* Notice Cards */}
                    <div className="space-y-4 w-5/6 flex flex-col gap-5 mx-auto">

                        {notices.map((notice) => (

                            <div
                                key={notice._id}
                                className="bg-white shadow-md hover:shadow-xl transition duration-300 rounded-xl p-5 border-l-4 border-blue-500" >

                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                    {notice.title}
                                </h3>

                                <p className="text-gray-600 mb-3">
                                    {notice.message}
                                </p>
                                <small className="text-gray-400">
                                    {new Date(notice.createdAt).toLocaleString()}
                                </small>
                            </div>
                        ))}

                    </div>

                </div>
            </div>
        </div>
    )
}

export default Notices
