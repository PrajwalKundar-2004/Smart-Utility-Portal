import express from 'express';
import Student from '../models/Student.js';
import bcrypt from 'bcryptjs';
const router = express.Router();
import jwt from 'jsonwebtoken';
import Notice from '../models/Notice.js';
import authMiddleware from '../middleware/authMiddleware.js';
import Result from '../models/Result.js';
import Assignment from '../models/Assignment.js';
import AttendanceSheet from '../models/AttendanceSheet.js';
import Attendance from '../models/Attendance.js';
import { checkRateLimit, recordFailedAttempt, clearFailedAttempts } from '../middleware/rateLimiter.js';
// sign up route
router.post('/signup', async (req, res) => {
    try {
        const { usn, create_password, username } = req.body;
        // Normalize USN to uppercase so login always matches regardless of how user typed it
        const normalizedUsn = (usn || '').trim().toUpperCase();
        if (!normalizedUsn) {
            return res.status(400).json({ success: false, message: "USN is required" });
        }
        // Check if the user already exists
        const existing = await Student.findOne({ usn: normalizedUsn });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "USN already registered"
            });
        }
        const hashedPassword = await bcrypt.hash(create_password, 10);
        // create student
        const student = new Student({
            usn: normalizedUsn,
            username: username,
            password: hashedPassword
        });
        await student.save();
        res.json({
            success: true,
            message: "Student registered successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// login route
router.post('/login', checkRateLimit, async (req, res) => {
    try {
        const { username, password } = req.body;
        const usn = (req.body.usn || '').trim().toUpperCase();
        // check if student exists
        const student = await Student.findOne({ usn: usn });
        if (!student) {
            recordFailedAttempt(req.clientIp);
            return res.status(400).json({
                success: false,
                message: "USN does not exist"
            });
        }
        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) {
            recordFailedAttempt(req.clientIp);
            return res.status(400).json({
                success: false,
                message: "Incorrect password"
            });
        }
        
        // success - clear attempts
        clearFailedAttempts(req.clientIp);
        // create jwt token
        const token = jwt.sign(
            {
                role: "student",
                iat: Date.now(),
                usn: student.usn
            },
            process.env.jwt_student_key
        );
        // success
        res.json({
            success: true,
            message: "Login successful",
            student: {
                usn: student.usn,
                username: student.username
            },
            token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});
// get notices for students
router.get('/notices', async (req, res) => {
    try {
        const notices = await Notice.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 });
        res.json(notices);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});
// get result for specific student
router.get('/studentresult', authMiddleware, async (req, res) => {
    try {
        const usn = req.student.usn;
        const usnRegex = new RegExp(`^${usn}$`, 'i');
        const result = await Result.findOne({ usn: usnRegex });
        res.json(result);
    } catch (error) {
        console.error('Error fetching student result:', error);
        res.status(500).json({ message: 'Server error fetching results' });
    }
});

// GET all students (for lecture dashboard - no passwords returned)
router.get('/all', async (req, res) => {
    try {
        const students = await Student.find({}, 'username usn -_id');
        res.json({ success: true, students });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET assignments targeted to this specific student (or all students)
router.get('/assignments', authMiddleware, async (req, res) => {
    try {
        const usn = req.student.usn;
        const assignments = await Assignment.find({
            isDeleted: { $ne: true },
            $or: [
                { targetAudience: 'all' },
                { selectedStudents: usn }
            ]
        }).sort({ createdAt: -1 });
        res.json({ success: true, assignments });
    } catch (error) {
        console.error('Error fetching student assignments:', error);
        res.status(500).json({ success: false, message: 'Server error fetching assignments' });
    }
});

// GET attendance data for the logged-in student
router.get('/attendance', authMiddleware, async (req, res) => {
    try {
        const usn = req.student.usn;
        const usnRegex = new RegExp(`^${usn}$`, 'i');

        // 1. Fetch spreadsheet-based attendance for this student
        const sheet = await AttendanceSheet.findOne({ usn: usnRegex });

        // 2. Fetch daily attendance sessions
        const allSessions = await Attendance.find({}).sort({ date: -1 });
        
        // Compute daily session attendance stats per subject
        const sessionStatsBySubject = {};
        allSessions.forEach(session => {
            const sub = session.subject;
            if (!sub) return;
            if (!sessionStatsBySubject[sub]) {
                sessionStatsBySubject[sub] = { totalClasses: 0, attendedClasses: 0 };
            }
            sessionStatsBySubject[sub].totalClasses++;
            const rec = session.records?.find(r => r.usn && r.usn.toLowerCase() === usn.toLowerCase());
            if (rec && rec.status === 'present') {
                sessionStatsBySubject[sub].attendedClasses++;
            }
        });

        res.json({
            success: true,
            sheet: sheet || null,
            sessionStats: sessionStatsBySubject
        });
    } catch (error) {
        console.error('Error fetching student attendance:', error);
        res.status(500).json({ success: false, message: 'Server error fetching attendance' });
    }
});

export default router;