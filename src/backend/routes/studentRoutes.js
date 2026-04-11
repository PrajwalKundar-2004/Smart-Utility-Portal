import express from 'express';
import Student from '../models/Student.js';
import bcrypt from 'bcryptjs';
const router = express.Router();
import jwt from 'jsonwebtoken';
import Notice from '../models/Notice.js';
import authMiddleware from '../middleware/authMiddleware.js';
import Result from '../models/Result.js';
// sign up route
router.post('/signup', async (req, res) => {
    try {
        const { usn, create_password, username } = req.body;
        // Check if the user already exists
        const existing = await Student.findOne({ usn });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "USN already registered"
            });
        }
        const hashedPassword = await bcrypt.hash(create_password, 10);
        // create student
        const student = new Student({
            usn: usn,
            username:username,
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
router.post('/login', async (req, res) => {
    try {
        const { username, usn, password } = req.body;
        // check if student exists
        const student = await Student.findOne({ usn: usn });
        if (!student) {
            return res.status(400).json({
                success: false,
                message: "USN does not exist"
            });
        }
        // check password
        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Incorrect password"
            });
        }
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
        const notices = await Notice.find({}).sort({ createdAt: -1 });
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
router.get('/studentresult',authMiddleware, async (req, res) => {
    const usn=req.student.usn;
    const result=await Result.findOne({usn:usn});
    res.json(result);
})
export default router;