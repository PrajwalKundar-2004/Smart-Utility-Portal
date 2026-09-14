import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Signup from './studentdash/Signup.jsx';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate
} from "react-router-dom";
import Studentlogin from './studentdash/Studentlogin.jsx';
import Lecturelogin from './lecturedash/Lecturelogin.jsx';
import Studdash from './studentdash/Studdash.jsx';
import Lectdash from './lecturedash/Lectdash.jsx';

import Notice from './lecturedash/Notice.jsx';
import Result from './lecturedash/Result.jsx';
import Assignment from './lecturedash/Assignment.jsx';
import Attendance from './lecturedash/Attendance.jsx';
import StudentList from './lecturedash/StudentList.jsx';
import ChatRoom from './lecturedash/ChatRoom.jsx';

import Notices from './studentdash/Notices.jsx';
import Attendances from './studentdash/Attendances.jsx';
import Results from './studentdash/Results.jsx';
import Assignments from './studentdash/Assignments.jsx';

const ProtectedStudentRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  return token && role === 'student' ? children : <Navigate to="/studentlogin" replace />;
};

const ProtectedLectureRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  return token && role === 'lecture' ? children : <Navigate to="/lecturelogin" replace />;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  if (token) {
    return role === 'student' ? <Navigate to="/studentdash" replace /> : <Navigate to="/lecturedash" replace />;
  }
  return children;
};

const RootRedirect = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  if (token) {
    return role === 'student' ? <Navigate to="/studentdash" replace /> : <Navigate to="/lecturedash" replace />;
  }
  return <Navigate to="/signup" replace />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootRedirect />,
  },
  {
    path: "/signup",
    element: <PublicRoute><Signup/></PublicRoute>,
  },
  {
    path: "/studentlogin",
    element: <PublicRoute><Studentlogin/></PublicRoute>,
  },
  {
    path: "/lecturelogin",
    element: <PublicRoute><Lecturelogin/></PublicRoute>,
  },
  {
    path: "/studentdash",
    element: <ProtectedStudentRoute><Studdash /></ProtectedStudentRoute>,
  },
  {
    path: "/lecturedash",
    element: <ProtectedLectureRoute><Lectdash /></ProtectedLectureRoute>,
  },
  {
    path: "/lecture/notice",
    element: <ProtectedLectureRoute><Notice /></ProtectedLectureRoute>,
  },
  {
    path: "/lecture/result",
    element: <ProtectedLectureRoute><Result/></ProtectedLectureRoute>,
  },
  {
    path: "/lecture/assignment",
    element: <ProtectedLectureRoute><Assignment/></ProtectedLectureRoute>,
  },
  {
    path: "/lecture/attendance",
    element: <ProtectedLectureRoute><Attendance/></ProtectedLectureRoute>,
  },
  {
    path: "/lecture/students",
    element: <ProtectedLectureRoute><StudentList/></ProtectedLectureRoute>,
  },
  {
    path: "/lecture/chat",
    element: <ProtectedLectureRoute><ChatRoom/></ProtectedLectureRoute>,
  },
  {
    path: "/student/attendances",
    element: <ProtectedStudentRoute><Attendances/></ProtectedStudentRoute>,
  },
  {
    path: "/student/notices",
    element: <ProtectedStudentRoute><Notices/></ProtectedStudentRoute>,
  },
  {
    path: "/student/results",
    element: <ProtectedStudentRoute><Results/></ProtectedStudentRoute>,
  },
  {
    path: "/student/assignments",
    element: <ProtectedStudentRoute><Assignments/></ProtectedStudentRoute>,
  },
  {
    path: "/student/chat",
    element: <ProtectedStudentRoute><ChatRoom/></ProtectedStudentRoute>,
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
