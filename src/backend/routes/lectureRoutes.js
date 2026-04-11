import express from 'express';
import Lecture from '../models/Lecture.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Notice from '../models/Notice.js';
import Result from '../models/Result.js';

const router = express.Router();
router.post('/login', async (req, res) => {
    try {
        const { secret_key, password } = req.body;
        // check secret key
        if (secret_key !== process.env.secretKey) {
            return res.status(401).json({
                message: 'Invalid secret key',
                success: false
            });
        }
        // check password 
        const isMatch = await bcrypt.compare(password, process.env.lecturePassword);
        if (!isMatch) {
            return res.status(401).json({
                message: 'Invalid password',
                success: false
            });
        }
        // create jwt token
        const token = jwt.sign(
            {
                role: "lecturer",
                iat: Date.now()
            },
            process.env.jwt_secret);
        // success
        res.json({
            message: 'Login successful',
            success: true,
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            message: 'Server error',
            success: false
        });
    }
});
//sending notice to students
router.post('/notice', async (req, res) => {
    try {
        const notice = new Notice(req.body);
        await notice.save();
        res.json({
            message: "Notice posted successfully",
            success: true
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
        });
    }
});
// upload student result
router.post('/result', async (req, res) => {
    const marks = req.body
    marks.web_total = marks.web_internal + marks.web_external;
    marks.os_total = marks.os_internal + marks.os_external;
    marks.dbms_total = marks.dbms_internal + marks.dbms_external;
    marks.maths_total = marks.maths_internal + marks.maths_external;
    marks.c_total = marks.c_internal + marks.c_external;
    marks.c_lab_total = marks.web_and_dbms_lab_internal + marks.web_and_dbms_lab_external;
    marks.web_and_dbms_lab_total = marks.web_and_dbms_lab_internal + marks.web_and_dbms_lab_external;
    // total marks
    marks.total_marks = marks.web_total + marks.os_total + marks.dbms_total + marks.maths_total + marks.c_total + marks.c_lab_total + marks.web_and_dbms_lab_total;

    // percentage
    marks.percentage = marks.total_marks/7;
    // sending result
    await Result.findOneAndUpdate({
        usn: marks.usn
    },
        {
           ...marks 
        },
        {
            upsert: true
        });
    res.json({
        message: "Result uploaded successfully",
        success: true
    });
})
export default router;
