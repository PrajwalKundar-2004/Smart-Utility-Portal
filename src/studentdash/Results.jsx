import React from 'react'
import Navbar2 from '../components/Navbar2'
import { useEffect, useState } from "react";

const Results = () => {
  const [result, setResult] = useState(null);
  const subjects = [
    "web",
    "dbms",
    "os",
    "maths",
    "c",
    "c_lab",
    "web_and_dbms_lab"
  ];
  useEffect(() => {
    const fetchResult = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/student/studentresult",
        {
          headers: {
            Authorization:`Bearer ${token}`
          }
        }
      );
      const data = await res.json();
      setResult(data);
    };

    fetchResult();

  }, []);

  if (!result)
    return (
      <div>
     <Navbar2 />
      <div className="w-screen h-[85vh] text-white font-bold text-2xl text-center mt-10 flex items-center justify-center bg-linear-to-br from-blue-900 via-purple-900 to-slate-900">
        Result Have Not Been published yet
      </div>
      </div>
    );
  return (
    <div>
      <Navbar2 />
      <div className="h-[85vh] w-screen flex justify-center items-center bg-linear-to-br from-blue-900 via-purple-900 to-slate-900 p-6">

        <div className="w-1/2 mx-auto bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20">

          <h1 className="text-2xl text-white font-bold mb-4 text-center">
            Student Result
          </h1>

          <div className="text-white mb-4">
            USN: {result.usn}
          </div>

          <table className="w-full text-white border border-white/20">

            <thead>
              <tr className="bg-white/20">
                <th className="p-2">Subject</th>
                <th className="p-2">Internal</th>
                <th className="p-2">External</th>
                <th className="p-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map(sub => (
                <tr key={sub} className="text-center border-t border-white/20">
                  <td className="p-2 uppercase">{sub}</td>
                  <td>{result[`${sub}_internal`]}</td>
                  <td>{result[`${sub}_external`]}</td>
                  <td>{result[`${sub}_total`]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-white mt-4">
            <p>Total Marks: {result.total_marks}</p>
            <p>Percentage: {result.percentage.toFixed(2)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Results
