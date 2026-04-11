import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Signup from './studentdash/Signup.jsx';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Studentlogin from './studentdash/Studentlogin.jsx';
import Lecturelogin from './lecturedash/Lecturelogin.jsx';
import Studdash from './studentdash/Studdash.jsx';
import Lectdash from './lecturedash/Lectdash.jsx';
import { Navigate } from 'react-router-dom';

import Notice from './lecturedash/Notice.jsx';
import Result from './lecturedash/Result.jsx';
import Assignment from './lecturedash/Assignment.jsx';
import Attendance from './lecturedash/Attendance.jsx';

import Notices from './studentdash/Notices.jsx';
import Attendances from './studentdash/Attendances.jsx';
import Results from './studentdash/Results.jsx';
import Assignments from './studentdash/Assignments.jsx';

// token checking function
const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

const router = createBrowserRouter([
  {
    path: "/",
    element: token? role === "student" ? <Navigate to="/studentdash" replace /> : <Navigate to="/lecturedash" replace /> : <App />,
     
  },
  {
    path: "/signup",
    element:<Signup/>,
  },
  {
    path: "/studentlogin",
    element:<Studentlogin/>,
  },
  {
    path: "/lecturelogin",
    element:<Lecturelogin/>,
  },
  {
    path: "/studentdash",
    element:<Studdash />,
  },
  {
    path: "/lecturedash",
    element:<Lectdash />,
  },
   {
    path: "/lecture/notice",
    element:<Notice />,
  },
   {
    path: "/lecture/result",
    element:<Result/>,
  },
   {
    path: "/lecture/assignment",
    element:<Assignment/>,
  },
   {
    path: "/lecture/attendance",
    element:<Attendance/>,
  },
   {
    path: "/student/attendances",
    element:<Attendances/>,
  },
   {
    path: "/student/notices",
    element:<Notices/>,
  },
   {
    path: "/student/results",
    element:<Results/>,
  },
   {
    path: "/student/assignments",
    element:<Assignments/>,
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
