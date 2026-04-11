import React from 'react'
import Navbar1 from '../components/Navbar1'
import { useForm } from 'react-hook-form'
import toast, { Toaster } from 'react-hot-toast'

const Result = () => {
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm();
  const onSubmit = async (data) => {
    const sendData = {
      usn: data.usn,
      web_internal: Number(data.web_internal),
      web_external: Number(data.web_external),
      c_internal: Number(data.c_internal),
      c_external: Number(data.c_external),
      dbms_internal: Number(data.dbms_internal),
      dbms_external: Number(data.dbms_external),
      os_internal: Number(data.os_internal),
      os_external: Number(data.os_external),
      maths_internal: Number(data.maths_internal),
      maths_external: Number(data.maths_external),
      web_and_dbms_lab_internal: Number(data.web_and_dbms_lab_internal),
      web_and_dbms_lab_external: Number(data.web_and_dbms_lab_external),
      c_lab_internal: Number(data.c_lab_internal),
      c_lab_external: Number(data.c_lab_external),
        };
    const res = await fetch("http://localhost:3000/api/lecture/result", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sendData)
    })
    const result = await res.json();
    if (result.success) {
      toast.success(result.message);
      reset();
    } else {
      toast.error("Upload Failed");
    }
  }
  const subjects = [
    "web",
    "dbms",
    "os",
    "maths",
    "c",
    "c_lab",
    "web_and_dbms_lab"
  ]
  return (
    <div>
      <Navbar1 />
      <Toaster />
      <div className=' w-screen h-[85vh] flex justify-around items-center bg-linear-to-br from-blue-300 via-purple-300 to-slate-300 p-6'>
        <div className='w-1/2  mx-auto bg-white/10 backdrop-blur-lg rounded-r-2xl p-6 border border-white/20'>
          <h1 className='text-2xl text-white font-bold mb-6 text-center'>Result Update</h1>
          <form action="" onSubmit={handleSubmit(onSubmit)} className='grid grid-cols-2 gap-4'>
            <input
              {...register("usn")}
              placeholder="Student USN"
              className="col-span-2 p-2 rounded bg-white/20 text-zinc-600 font-bold"
            />
            {subjects.map(subject => (
              <React.Fragment key={subject}>

                {/* Obtained marks internal */}
                <input type='number'
                  {...register(`${subject}_internal`, { required: { value: true, message: "Plaease fill this field" } })}
                  placeholder={`${subject.toUpperCase()} Internal`}
                  className="p-2 rounded bg-white/20 text-zinc-600 font-bold"
                />
              
                {/* external obtained */}
                <input type='number'
                  {...register(`${subject}_external`, { required: { value: true, message: "Plaease fill this field" } })}
                  placeholder={`${subject.toUpperCase()} External`}
                  className="p-2 rounded bg-white/20 text-zinc-600 font-bold"
                />
             

              </React.Fragment>
            ))}

            <button
              disabled={isSubmitting}
              className="col-span-2 bg-blue-600 hover:bg-blue-500 text-white p-2 rounded"
            >
              Upload Result
            </button>
          </form>
        </div>
      </div>

    </div>
  )
}

export default Result
