import jwt from "jsonwebtoken";
import Student from "../models/Student.js";

const authMiddleware = async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header) {
        return res.status(401).json({ message: "Unauthorized User" });
    }
    const token = header.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.jwt_student_key);
        // Verify student account still exists in DB
        if (decoded.usn) {
            const studentExists = await Student.findOne({ usn: decoded.usn });
            if (!studentExists) {
                return res.status(401).json({ 
                    success: false,
                    accountDeleted: true,
                    message: "Student account no longer exists. Please sign up again." 
                });
            }
        }
        req.student = decoded;
        next();
    } catch {
        return res.status(401).json({ message: "Unauthorized User" });
    }
};
export default authMiddleware;