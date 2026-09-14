import express from 'express';
import Lecture from '../models/Lecture.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Notice from '../models/Notice.js';
import Result from '../models/Result.js';
import Student from '../models/Student.js';
import Attendance from '../models/Attendance.js';
import AttendanceSheet from '../models/AttendanceSheet.js';
import Assignment from '../models/Assignment.js';
import multer from 'multer';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import { checkRateLimit, recordFailedAttempt, clearFailedAttempts } from '../middleware/rateLimiter.js';

// Multer memory storage for direct Cloudinary streaming
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 } // 25 MB max limit
});

const router = express.Router();
router.post('/login', checkRateLimit, async (req, res) => {
    try {
        const { secret_key, password } = req.body;
        // Fetch the single lecturer credential from DB
        const lecturer = await Lecture.findOne();
        if (!lecturer) {
            return res.status(500).json({
                message: 'Lecturer credentials not configured on server',
                success: false
            });
        }

        // check secret key using bcrypt
        const isSecretMatch = await bcrypt.compare(secret_key, lecturer.secretKey);
        if (!isSecretMatch) {
            recordFailedAttempt(req.clientIp);
            return res.status(401).json({
                message: 'Invalid secret key',
                success: false
            });
        }
        
        // check password using bcrypt
        const isPasswordMatch = await bcrypt.compare(password, lecturer.password);
        if (!isPasswordMatch) {
            recordFailedAttempt(req.clientIp);
            return res.status(401).json({
                message: 'Invalid password',
                success: false
            });
        }
        
        // success - clear attempts
        clearFailedAttempts(req.clientIp);
        
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
// ── Notice Management ──────────────────────────────────────────────
// POST notice with postedBy, title, message, subject, priority
router.post('/notice', async (req, res) => {
    try {
        const { title, message, postedBy, subject, priority } = req.body;
        if (!title || !message) {
            return res.status(400).json({ success: false, message: 'Title and message are required' });
        }
        const notice = new Notice({
            title: title.trim(),
            message: message.trim(),
            postedBy: postedBy ? postedBy.trim() : 'Lecturer',
            subject: subject || 'General Announcement',
            priority: priority || 'normal'
        });
        await notice.save();
        res.json({
            message: "Notice posted successfully",
            success: true,
            notice
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// GET all notices for lecturer dashboard
router.get('/notices', async (req, res) => {
    try {
        const notices = await Notice.find({}).sort({ createdAt: -1 });
        res.json({ success: true, notices });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error loading notices' });
    }
});

// UPDATE notice
router.put('/notice/:id', async (req, res) => {
    try {
        const { title, message, priority, updatedBy, subject } = req.body;
        const notice = await Notice.findById(req.params.id);
        if (!notice) {
            return res.status(404).json({ success: false, message: 'Notice not found' });
        }
        if (title !== undefined) notice.title = title.trim();
        if (message !== undefined) notice.message = message.trim();
        if (priority !== undefined) notice.priority = priority;
        if (subject !== undefined) notice.subject = subject.trim();
        notice.updatedBy = (updatedBy && updatedBy.trim()) ? updatedBy.trim() : 'Lecturer';
        await notice.save();
        res.json({
            success: true,
            message: 'Notice updated successfully',
            notice
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Failed to update notice' });
    }
});

// DELETE (Soft-delete / Withdraw) notice with audit trail of who deleted it
router.delete('/notice/:id', async (req, res) => {
    try {
        const { deletedBy } = req.body || {};
        const notice = await Notice.findById(req.params.id);
        if (!notice) {
            return res.status(404).json({ success: false, message: 'Notice not found' });
        }
        notice.isDeleted = true;
        notice.deletedBy = (deletedBy && deletedBy.trim()) ? deletedBy.trim() : 'Lecturer';
        notice.deletedAt = new Date();
        await notice.save();
        res.json({
            success: true,
            message: 'Notice withdrawn successfully',
            notice
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete notice' });
    }
});

// RESTORE withdrawn notice
router.put('/notice/:id/restore', async (req, res) => {
    try {
        const notice = await Notice.findById(req.params.id);
        if (!notice) {
            return res.status(404).json({ success: false, message: 'Notice not found' });
        }
        notice.isDeleted = false;
        notice.deletedBy = undefined;
        notice.deletedAt = undefined;
        await notice.save();
        res.json({
            success: true,
            message: 'Notice restored to active circulars',
            notice
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to restore notice' });
    }
});

// PERMANENT DELETE notice
router.delete('/notice/:id/permanent', async (req, res) => {
    try {
        await Notice.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Notice permanently deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete notice' });
    }
});
// ── Student Results Management ─────────────────────────────────────
// GET student results sheet for a specific subject
router.get('/results-sheet/:subject', async (req, res) => {
    try {
        const { subject } = req.params;
        const students = await Student.find({}, 'username usn').sort({ usn: 1 });
        const results = await Result.find({});
        
        // Map results by USN
        const resultMap = {};
        let detectedColumns = [];
        
        results.forEach(r => {
            resultMap[r.usn] = r;
            const subData = r.subjects?.find(s => s.subject && s.subject.toLowerCase() === subject.toLowerCase());
            if (subData && subData.columns && subData.columns.length > 0 && detectedColumns.length === 0) {
                detectedColumns = subData.columns.map(c => c.name);
            }
        });

        // Ensure default columns include 'Internal Marks', 'External Marks', 'Total'
        let columns = detectedColumns.length > 0 ? [...detectedColumns] : ['Internal Marks', 'External Marks', 'Total'];
        // Ensure Total column is present if not already in columns
        if (!columns.some(c => c.trim().toLowerCase() === 'total')) {
            columns.push('Total');
        }

        // Build records array
        const records = students.map(st => {
            const r = resultMap[st.usn];
            const subData = r?.subjects?.find(s => s.subject && s.subject.toLowerCase() === subject.toLowerCase());
            const marks = {};
            
            columns.forEach(col => {
                const colLower = col.trim().toLowerCase();
                const foundCol = subData?.columns?.find(c => c.name.trim().toLowerCase() === colLower);
                if (foundCol !== undefined && foundCol.value !== null) {
                    marks[col] = foundCol.value;
                } else if (colLower === 'total' && subData?.total !== null && subData?.total !== undefined) {
                    marks[col] = subData.total;
                } else {
                    // Check legacy fields
                    const normSub = subject.toLowerCase().replace(/[^a-z0-9_]/g, '');
                    if (colLower.includes('internal') && r && r[`${normSub}_internal`] !== undefined) {
                        marks[col] = r[`${normSub}_internal`];
                    } else if (colLower.includes('external') && r && r[`${normSub}_external`] !== undefined) {
                        marks[col] = r[`${normSub}_external`];
                    } else if (colLower === 'total' && r && r[`${normSub}_total`] !== undefined) {
                        marks[col] = r[`${normSub}_total`];
                    } else {
                        marks[col] = 0;
                    }
                }
            });

            const resolvedTotal = subData?.total !== undefined && subData?.total !== null 
                ? subData.total 
                : (marks['Total'] !== undefined ? Number(marks['Total']) : 0);

            return {
                usn: st.usn,
                studentName: st.username,
                marks: marks,
                total: resolvedTotal
            };
        });

        res.json({
            success: true,
            subject,
            columns,
            records
        });
    } catch (error) {
        console.error('Error fetching results sheet:', error);
        res.status(500).json({ success: false, message: 'Server error loading sheet' });
    }
});

// POST save student results sheet (upsert by USN)
router.post('/result/save-sheet', async (req, res) => {
    try {
        const { subject, columns, records } = req.body;
        if (!subject || !records || !Array.isArray(records)) {
            return res.status(400).json({ success: false, message: 'Invalid payload' });
        }

        for (const rec of records) {
            if (!rec.usn) continue;

            let doc = await Result.findOne({ usn: rec.usn });
            if (!doc) {
                doc = new Result({
                    usn: rec.usn,
                    studentName: rec.studentName,
                    subjects: []
                });
            }
            if (!doc.subjects) doc.subjects = [];

            const colEntries = (columns || []).map(col => ({
                name: col,
                value: rec.marks && rec.marks[col] !== '' && !isNaN(Number(rec.marks[col])) 
                    ? Number(rec.marks[col]) 
                    : 0
            }));
            
            // Explicit Total column (or manual total provided)
            const explicitTotalCol = colEntries.find(c => {
                const n = c.name.trim().toLowerCase();
                return n === 'total' || n === 'total marks' || n === 'total obtained';
            });
            const subjectTotal = explicitTotalCol 
                ? explicitTotalCol.value 
                : (rec.total !== undefined && !isNaN(Number(rec.total)) ? Number(rec.total) : 0);

            const subIndex = doc.subjects.findIndex(s => s.subject && s.subject.toLowerCase() === subject.toLowerCase());
            const subjectData = {
                subject: subject,
                columns: colEntries,
                total: subjectTotal
            };

            if (subIndex > -1) {
                doc.subjects[subIndex] = subjectData;
            } else {
                doc.subjects.push(subjectData);
            }

            // Guarantee Mongoose marks nested array as modified
            doc.markModified('subjects');

            if (rec.studentName) doc.studentName = rec.studentName;

            // Backward compatibility for known fields (web, dbms, os, maths, c, etc.)
            const normSub = subject.toLowerCase().replace(/[^a-z0-9_]/g, '');
            colEntries.forEach(c => {
                const normCol = c.name.toLowerCase();
                if (normCol.includes('internal')) doc[`${normSub}_internal`] = c.value;
                else if (normCol.includes('external')) doc[`${normSub}_external`] = c.value;
            });
            if (subjectTotal !== null) {
                doc[`${normSub}_total`] = subjectTotal;
            }

            // Compute overall total_marks & percentage ONLY if explicit totals exist
            let overallTotal = 0;
            let countWithTotal = 0;
            doc.subjects.forEach(s => { 
                if (s.total !== null && s.total !== undefined) {
                    overallTotal += s.total;
                    countWithTotal++;
                }
            });
            doc.total_marks = countWithTotal > 0 ? overallTotal : null;
            doc.percentage = countWithTotal > 0 ? (overallTotal / countWithTotal) : null;

            await doc.save();
        }

        res.json({
            success: true,
            message: 'Results saved successfully in database'
        });
    } catch (error) {
        console.error('Error saving results sheet:', error);
        res.status(500).json({ success: false, message: 'Server error saving marks' });
    }
});

// ── Attendance Management ───────────────────────────────────────────
// POST record attendance session
router.post('/attendance', async (req, res) => {
    try {
        const { subject, date, records } = req.body;
        if (!subject || !records || !Array.isArray(records)) {
            return res.status(400).json({ success: false, message: 'Subject and records are required' });
        }

        const sessionDate = date ? new Date(date) : new Date();
        const attendance = new Attendance({
            subject,
            date: sessionDate,
            records: records.map(r => ({
                usn: r.usn,
                studentName: r.studentName || r.name || '',
                status: r.status === 'absent' ? 'absent' : 'present'
            }))
        });

        await attendance.save();
        res.json({
            success: true,
            message: `Attendance saved successfully for ${subject}`,
            attendance
        });
    } catch (error) {
        console.error('Error saving attendance:', error);
        res.status(500).json({ success: false, message: 'Server error saving attendance' });
    }
});

// GET attendance history for a subject
router.get('/attendance/:subject', async (req, res) => {
    try {
        const { subject } = req.params;
        const sessions = await Attendance.find({ 
            subject: { $regex: new RegExp(`^${subject}$`, 'i') } 
        }).sort({ date: -1 });

        res.json({
            success: true,
            subject,
            totalSessions: sessions.length,
            sessions
        });
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ success: false, message: 'Server error fetching attendance' });
    }
});

// ── Attendance Spreadsheet Management ──────────────────────────────────
// GET student attendance sheet for a specific subject
router.get('/attendance-sheet/:subject', async (req, res) => {
    try {
        const { subject } = req.params;
        const students = await Student.find({}, 'username usn').sort({ usn: 1 });
        const sheets = await AttendanceSheet.find({});
        
        // Map attendance sheet records by USN
        const sheetMap = {};
        let detectedColumns = [];
        
        sheets.forEach(s => {
            sheetMap[s.usn] = s;
            const subData = s.subjects?.find(sub => sub.subject && sub.subject.toLowerCase() === subject.toLowerCase());
            if (subData && subData.columns && subData.columns.length > 0 && detectedColumns.length === 0) {
                detectedColumns = subData.columns.map(c => c.name);
            }
        });

        // Default columns requested by user: 'Internal', 'External', 'Total'
        let columns = detectedColumns.length > 0 ? [...detectedColumns] : ['Internal', 'External', 'Total'];
        if (!columns.some(c => c.trim().toLowerCase() === 'total')) {
            columns.push('Total');
        }

        // Build student records array
        const records = students.map(st => {
            const sDoc = sheetMap[st.usn];
            const subData = sDoc?.subjects?.find(sub => sub.subject && sub.subject.toLowerCase() === subject.toLowerCase());
            const attendance = {};
            
            columns.forEach(col => {
                const colLower = col.trim().toLowerCase();
                const foundCol = subData?.columns?.find(c => c.name.trim().toLowerCase() === colLower);
                if (foundCol !== undefined && foundCol.value !== null) {
                    attendance[col] = foundCol.value;
                } else if (colLower === 'total' && subData?.total !== null && subData?.total !== undefined) {
                    attendance[col] = subData.total;
                } else {
                    attendance[col] = 0;
                }
            });

            const resolvedTotal = subData?.total !== undefined && subData?.total !== null 
                ? subData.total 
                : (attendance['Total'] !== undefined ? Number(attendance['Total']) : 0);

            return {
                usn: st.usn,
                studentName: st.username,
                attendance: attendance,
                total: resolvedTotal
            };
        });

        res.json({
            success: true,
            subject,
            columns,
            records
        });
    } catch (error) {
        console.error('Error fetching attendance sheet:', error);
        res.status(500).json({ success: false, message: 'Server error loading attendance sheet' });
    }
});

// POST save student attendance sheet (upsert by USN)
router.post('/attendance/save-sheet', async (req, res) => {
    try {
        const { subject, columns, records } = req.body;
        if (!subject || !records || !Array.isArray(records)) {
            return res.status(400).json({ success: false, message: 'Invalid payload' });
        }

        for (const rec of records) {
            const { usn, studentName, attendance, total } = rec;
            if (!usn) continue;

            let sheetDoc = await AttendanceSheet.findOne({ usn });
            if (!sheetDoc) {
                sheetDoc = new AttendanceSheet({
                    usn,
                    studentName: studentName || '',
                    subjects: []
                });
            }

            if (!sheetDoc.subjects) sheetDoc.subjects = [];

            // Format columns array for this subject
            const colArray = (columns || []).map(colName => ({
                name: colName,
                value: attendance && attendance[colName] !== undefined && attendance[colName] !== '' 
                    ? attendance[colName] 
                    : 0
            }));

            const resolvedTotal = attendance && attendance['Total'] !== undefined && attendance['Total'] !== '' 
                ? Number(attendance['Total']) 
                : (total !== undefined ? Number(total) : 0);

            // Find or insert subject record
            const subIndex = sheetDoc.subjects.findIndex(
                s => s.subject && s.subject.toLowerCase() === subject.toLowerCase()
            );

            const subjectEntry = {
                subject: subject,
                columns: colArray,
                total: resolvedTotal
            };

            if (subIndex >= 0) {
                sheetDoc.subjects[subIndex] = subjectEntry;
            } else {
                sheetDoc.subjects.push(subjectEntry);
            }

            sheetDoc.markModified('subjects');
            await sheetDoc.save();
        }

        res.json({
            success: true,
            message: `Attendance sheet saved successfully for ${subject}`
        });
    } catch (error) {
        console.error('Error saving attendance sheet:', error);
        res.status(500).json({ success: false, message: 'Server error saving attendance sheet' });
    }
});

// ── Aggregated Student Overview ─────────────────────────────────────
// GET comprehensive overview of all students (marks + attendance per subject)
router.get('/students-overview', async (req, res) => {
    try {
        const students = await Student.find({}, 'username usn email').sort({ usn: 1 });
        const lecturer = await Lecture.findOne();
        const configuredSubjects = (lecturer?.subjects || []).map(s => s.name);
        
        const results = await Result.find({});
        const attendanceDocs = await Attendance.find({});
        const attendanceSheets = await AttendanceSheet.find({});

        // Gather all unique subject names
        const subjectSet = new Set(configuredSubjects);
        results.forEach(r => {
            r.subjects?.forEach(s => {
                if (s.subject) subjectSet.add(s.subject);
            });
        });
        attendanceDocs.forEach(a => {
            if (a.subject) subjectSet.add(a.subject);
        });
        attendanceSheets.forEach(sheet => {
            sheet.subjects?.forEach(s => {
                if (s.subject) subjectSet.add(s.subject);
            });
        });

        const allSubjects = Array.from(subjectSet);

        // Map results and attendance sheets by USN
        const resultMap = {};
        results.forEach(r => { resultMap[r.usn] = r; });

        const sheetMap = {};
        attendanceSheets.forEach(s => { sheetMap[s.usn] = s; });

        // Build comprehensive overview per student
        const overview = students.map(st => {
            const r = resultMap[st.usn];
            const sDoc = sheetMap[st.usn];

            let combinedTotalMarks = 0;
            let subjectsWithMarksCount = 0;
            let totalAttendedAll = 0;
            let totalClassesAll = 0;
            let totalAttPctSum = 0;
            let subjectsWithAttCount = 0;

            const subjectBreakdown = allSubjects.map(subName => {
                // Result data
                const subResult = r?.subjects?.find(s => s.subject && s.subject.toLowerCase() === subName.toLowerCase());
                const totalMarks = subResult?.total !== undefined && subResult?.total !== null
                    ? subResult.total
                    : (subResult?.columns?.find(c => c.name.trim().toLowerCase() === 'total')?.value ?? null);

                if (totalMarks !== null && totalMarks !== undefined) {
                    combinedTotalMarks += Number(totalMarks);
                    subjectsWithMarksCount++;
                }

                // Attendance data: 1. Check AttendanceSheet
                const subAttSheet = sDoc?.subjects?.find(s => s.subject && s.subject.toLowerCase() === subName.toLowerCase());

                // Attendance data: 2. Check daily Attendance sessions
                const subjectAttendanceDocs = attendanceDocs.filter(a => 
                    a.subject && a.subject.toLowerCase() === subName.toLowerCase()
                );
                const totalSessions = subjectAttendanceDocs.length;
                let attendedSessions = 0;
                
                subjectAttendanceDocs.forEach(session => {
                    const record = session.records?.find(rec => rec.usn === st.usn);
                    if (record && record.status === 'present') {
                        attendedSessions++;
                    }
                });

                totalAttendedAll += attendedSessions;
                totalClassesAll += totalSessions;

                let attendancePct = 0.0;
                let hasAttRecord = false;

                if (subAttSheet && (subAttSheet.total !== undefined || (subAttSheet.columns && subAttSheet.columns.length > 0))) {
                    attendancePct = Number(subAttSheet.total) || 0;
                    hasAttRecord = true;
                } else if (totalSessions > 0) {
                    attendancePct = Number(((attendedSessions / totalSessions) * 100).toFixed(1));
                    hasAttRecord = true;
                } else {
                    // Default to 0.0% when no attendance has been recorded
                    attendancePct = 0.0;
                    hasAttRecord = false;
                }

                if (hasAttRecord) {
                    totalAttPctSum += attendancePct;
                    subjectsWithAttCount++;
                }

                return {
                    subject: subName,
                    columns: subResult?.columns || [],
                    totalMarks: totalMarks !== null ? totalMarks : 0,
                    hasMarks: totalMarks !== null,
                    totalClasses: totalSessions,
                    attendedClasses: attendedSessions,
                    attendancePercentage: attendancePct,
                    attendanceColumns: subAttSheet?.columns || []
                };
            });

            // Overall attendance percentage across updated subjects (defaults to 0.0% if none updated)
            const overallAttendancePct = subjectsWithAttCount > 0
                ? Number((totalAttPctSum / subjectsWithAttCount).toFixed(1))
                : (totalClassesAll > 0 ? Number(((totalAttendedAll / totalClassesAll) * 100).toFixed(1)) : 0.0);

            const combinedPercentage = subjectsWithMarksCount > 0
                ? Number((combinedTotalMarks / subjectsWithMarksCount).toFixed(1))
                : (r?.percentage ? Number(r.percentage.toFixed(1)) : 0);

            return {
                usn: st.usn,
                username: st.username,
                email: st.email || '',
                subjects: subjectBreakdown,
                combinedTotalMarks,
                subjectsWithMarksCount,
                combinedPercentage,
                overallAttended: totalAttendedAll,
                overallTotalClasses: totalClassesAll,
                overallAttendancePercentage: overallAttendancePct
            };
        });

        res.json({
            success: true,
            totalStudents: overview.length,
            subjects: allSubjects,
            students: overview
        });
    } catch (error) {
        console.error('Error fetching students overview:', error);
        res.status(500).json({ success: false, message: 'Server error fetching students overview' });
    }
});

// Legacy upload student result
router.post('/result', async (req, res) => {
    try {
        const marks = req.body;
        marks.web_total = (marks.web_internal || 0) + (marks.web_external || 0);
        marks.os_total = (marks.os_internal || 0) + (marks.os_external || 0);
        marks.dbms_total = (marks.dbms_internal || 0) + (marks.dbms_external || 0);
        marks.maths_total = (marks.maths_internal || 0) + (marks.maths_external || 0);
        marks.c_total = (marks.c_internal || 0) + (marks.c_external || 0);
        marks.c_lab_total = (marks.web_and_dbms_lab_internal || 0) + (marks.web_and_dbms_lab_external || 0);
        marks.web_and_dbms_lab_total = (marks.web_and_dbms_lab_internal || 0) + (marks.web_and_dbms_lab_external || 0);
        marks.total_marks = marks.web_total + marks.os_total + marks.dbms_total + marks.maths_total + marks.c_total + marks.c_lab_total + marks.web_and_dbms_lab_total;
        marks.percentage = marks.total_marks / 7;

        await Result.findOneAndUpdate({ usn: marks.usn }, { ...marks }, { upsert: true });
        res.json({ message: "Result uploaded successfully", success: true });
    } catch (err) {
        res.status(500).json({ message: "Failed to upload result", success: false });
    }
});

// ── Subject Management ──────────────────────────────────────────────
// GET all subjects
router.get('/subjects', async (req, res) => {
    try {
        const lecturer = await Lecture.findOne();
        res.json({ success: true, subjects: lecturer?.subjects || [] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST add a new subject
router.post('/subjects', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name?.trim()) return res.status(400).json({ success: false, message: 'Subject name required' });
        const lecturer = await Lecture.findOne();
        lecturer.subjects.push({ name: name.trim() });
        await lecturer.save();
        res.json({ success: true, subjects: lecturer.subjects });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// PUT edit a subject by _id
router.put('/subjects/:id', async (req, res) => {
    try {
        const { name } = req.body;
        const lecturer = await Lecture.findOne();
        const subject = lecturer.subjects.id(req.params.id);
        if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
        subject.name = name.trim();
        await lecturer.save();
        res.json({ success: true, subjects: lecturer.subjects });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// DELETE a subject by _id
router.delete('/subjects/:id', async (req, res) => {
    try {
        const lecturer = await Lecture.findOne();
        lecturer.subjects.pull({ _id: req.params.id });
        await lecturer.save();
        res.json({ success: true, subjects: lecturer.subjects });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Middleware to handle multer file upload errors cleanly as JSON
const handleAssignmentUpload = (req, res, next) => {
    upload.any()(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'Attachment size exceeds the 25MB limit.'
                });
            }
            return res.status(400).json({
                success: false,
                message: `Upload error: ${err.message}`
            });
        } else if (err) {
            return res.status(400).json({
                success: false,
                message: err.message || 'File upload error'
            });
        }
        next();
    });
};

// ─── ASSIGNMENTS MANAGEMENT ──────────────────────────────────────────────
// POST create a new assignment (with up to 5 PDF/Photo attachments, total size < 25MB)
router.post('/assignment', handleAssignmentUpload, async (req, res) => {
    try {
        const {
            title,
            description,
            subject,
            type = 'text',
            targetAudience = 'all',
            selectedStudents,
            dueDate,
            totalMarks,
            createdBy
        } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ success: false, message: 'Assignment title is required' });
        }
        if (!subject || !subject.trim()) {
            return res.status(400).json({ success: false, message: 'Subject is required' });
        }

        let parsedSelectedStudents = [];
        if (targetAudience === 'selected') {
            if (typeof selectedStudents === 'string') {
                try {
                    parsedSelectedStudents = JSON.parse(selectedStudents);
                } catch (e) {
                    parsedSelectedStudents = selectedStudents.split(',').map(s => s.trim()).filter(Boolean);
                }
            } else if (Array.isArray(selectedStudents)) {
                parsedSelectedStudents = selectedStudents;
            }
            if (parsedSelectedStudents.length === 0) {
                return res.status(400).json({ success: false, message: 'Please select at least one student' });
            }
        }

        // Validate Due Date (must be current or future)
        if (dueDate) {
            const parsedDueDate = new Date(dueDate);
            if (isNaN(parsedDueDate.getTime())) {
                return res.status(400).json({ success: false, message: 'Invalid due date format' });
            }
            if (parsedDueDate.getTime() < Date.now() - 2 * 60 * 1000) {
                return res.status(400).json({
                    success: false,
                    message: 'Due date cannot be in the past. Please select a current or future date and time.'
                });
            }
        }

        // Handle uploaded files (up to 5, total size < 25MB)
        const uploadedFiles = req.files || [];
        if (uploadedFiles.length > 5) {
            return res.status(400).json({
                success: false,
                message: 'A maximum of 5 attachments are allowed per assignment.'
            });
        }

        const MAX_TOTAL_BYTES = 25 * 1024 * 1024; // 25 MB
        const totalSizeBytes = uploadedFiles.reduce((acc, f) => acc + (f.size || 0), 0);
        if (totalSizeBytes > MAX_TOTAL_BYTES) {
            const totalMb = (totalSizeBytes / (1024 * 1024)).toFixed(2);
            return res.status(400).json({
                success: false,
                message: `Total attachments size is ${totalMb} MB, which exceeds the 25 MB limit.`
            });
        }

        // Upload all attachments to Cloudinary in parallel
        const attachments = await Promise.all(
            uploadedFiles.map(async (f) => {
                const originalName = f.originalname;
                const isPdf = f.mimetype === 'application/pdf' || originalName.toLowerCase().endsWith('.pdf');
                const fileType = isPdf ? 'pdf' : 'photo';
                const uploadResult = await uploadToCloudinary(f.buffer, originalName, 'assignments');
                const sizeStr = (f.size > 1024 * 1024)
                    ? `${(f.size / (1024 * 1024)).toFixed(2)} MB`
                    : `${(f.size / 1024).toFixed(1)} KB`;
                return {
                    fileUrl: uploadResult.url,
                    filePublicId: uploadResult.public_id,
                    fileName: originalName,
                    fileSize: sizeStr,
                    fileType
                };
            })
        );

        // Determine main type
        let finalType = type;
        if (attachments.length > 0) {
            const hasPdf = attachments.some(a => a.fileType === 'pdf');
            finalType = hasPdf ? 'pdf' : 'photo';
        }

        const assignment = new Assignment({
            title: title.trim(),
            description: description ? description.trim() : '',
            subject: subject.trim(),
            type: finalType,
            attachments,
            fileUrl: attachments.length > 0 ? attachments[0].fileUrl : null,
            filePublicId: attachments.length > 0 ? attachments[0].filePublicId : null,
            fileName: attachments.length > 0 ? attachments[0].fileName : null,
            fileSize: attachments.length > 0 ? attachments[0].fileSize : null,
            targetAudience,
            selectedStudents: parsedSelectedStudents,
            dueDate: dueDate ? new Date(dueDate) : null,
            totalMarks: Number(totalMarks) || 0,
            createdBy: (createdBy && createdBy.trim()) ? createdBy.trim() : 'Lecturer'
        });

        await assignment.save();

        res.status(201).json({
            success: true,
            message: 'Assignment posted successfully',
            assignment
        });
    } catch (error) {
        console.error('Error creating assignment:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to post assignment' });
    }
});

// GET all assignments posted by lecturers (optionally filter by subject and createdBy)
router.get('/assignments', async (req, res) => {
    try {
        const { subject, createdBy } = req.query;
        const query = { isDeleted: { $ne: true } };
        if (subject && subject.trim()) {
            query.subject = new RegExp(`^${subject.trim()}$`, 'i');
        }
        if (createdBy && createdBy.trim()) {
            query.createdBy = new RegExp(`^${createdBy.trim()}$`, 'i');
        }
        const assignments = await Assignment.find(query).sort({ createdAt: -1 });
        res.json({ success: true, assignments });
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch assignments' });
    }
});

// PUT edit an existing assignment
router.put('/assignment/:id', handleAssignmentUpload, async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment || assignment.isDeleted) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }

        const {
            title,
            description,
            dueDate,
            totalMarks,
            targetAudience,
            selectedStudents,
            keptAttachments
        } = req.body;

        if (title && title.trim()) {
            assignment.title = title.trim();
        }
        if (description !== undefined) {
            assignment.description = description.trim();
        }
        if (dueDate !== undefined) {
            assignment.dueDate = dueDate ? new Date(dueDate) : null;
        }
        if (totalMarks !== undefined) {
            assignment.totalMarks = Number(totalMarks) || 0;
        }
        if (targetAudience) {
            assignment.targetAudience = targetAudience;
            if (targetAudience === 'selected') {
                let parsed = [];
                if (typeof selectedStudents === 'string') {
                    try {
                        parsed = JSON.parse(selectedStudents);
                    } catch (e) {
                        parsed = selectedStudents.split(',').map(s => s.trim()).filter(Boolean);
                    }
                } else if (Array.isArray(selectedStudents)) {
                    parsed = selectedStudents;
                }
                assignment.selectedStudents = parsed;
            } else {
                assignment.selectedStudents = [];
            }
        }

        // Process attachments: kept attachments + newly uploaded files
        let finalAttachments = [];
        if (keptAttachments !== undefined) {
            try {
                finalAttachments = typeof keptAttachments === 'string' ? JSON.parse(keptAttachments) : keptAttachments;
            } catch (e) {
                finalAttachments = assignment.attachments || [];
            }
        } else {
            finalAttachments = assignment.attachments || [];
        }

        const uploadedFiles = req.files || [];
        if (finalAttachments.length + uploadedFiles.length > 5) {
            return res.status(400).json({
                success: false,
                message: 'A maximum of 5 attachments are allowed per assignment.'
            });
        }

        const MAX_TOTAL_BYTES = 25 * 1024 * 1024;
        const newFilesBytes = uploadedFiles.reduce((acc, f) => acc + (f.size || 0), 0);
        if (newFilesBytes > MAX_TOTAL_BYTES) {
            return res.status(400).json({
                success: false,
                message: 'Newly uploaded attachments exceed the 25 MB limit.'
            });
        }

        if (uploadedFiles.length > 0) {
            const newUploaded = await Promise.all(
                uploadedFiles.map(async (f) => {
                    const originalName = f.originalname;
                    const isPdf = f.mimetype === 'application/pdf' || originalName.toLowerCase().endsWith('.pdf');
                    const fileType = isPdf ? 'pdf' : 'photo';
                    const uploadResult = await uploadToCloudinary(f.buffer, originalName, 'assignments');
                    const sizeStr = (f.size > 1024 * 1024)
                        ? `${(f.size / (1024 * 1024)).toFixed(2)} MB`
                        : `${(f.size / 1024).toFixed(1)} KB`;
                    return {
                        fileUrl: uploadResult.url,
                        filePublicId: uploadResult.public_id,
                        fileName: originalName,
                        fileSize: sizeStr,
                        fileType
                    };
                })
            );
            finalAttachments = [...finalAttachments, ...newUploaded];
        }

        assignment.attachments = finalAttachments;
        if (finalAttachments.length > 0) {
            assignment.fileUrl = finalAttachments[0].fileUrl;
            assignment.filePublicId = finalAttachments[0].filePublicId;
            assignment.fileName = finalAttachments[0].fileName;
            assignment.fileSize = finalAttachments[0].fileSize;
            const hasPdf = finalAttachments.some(a => a.fileType === 'pdf');
            assignment.type = hasPdf ? 'pdf' : 'photo';
        } else {
            assignment.fileUrl = null;
            assignment.filePublicId = null;
            assignment.fileName = null;
            assignment.fileSize = null;
            assignment.type = 'text';
        }

        await assignment.save();

        res.json({
            success: true,
            message: 'Assignment updated successfully',
            assignment
        });
    } catch (error) {
        console.error('Error updating assignment:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to update assignment' });
    }
});

// DELETE (soft-delete) an assignment
router.delete('/assignment/:id', async (req, res) => {
    try {
        const { deletedBy } = req.body || {};
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }
        assignment.isDeleted = true;
        assignment.deletedBy = (deletedBy && deletedBy.trim()) ? deletedBy.trim() : 'Lecturer';
        assignment.deletedAt = new Date();
        await assignment.save();
        res.json({ success: true, message: 'Assignment deleted successfully' });
    } catch (error) {
        console.error('Error deleting assignment:', error);
        res.status(500).json({ success: false, message: 'Failed to delete assignment' });
    }
});

// ── Remove Student from Portal ──────────────────────────────────────
// DELETE a student by USN - erases credentials, requiring re-signup to log in again
router.delete('/student/:usn', async (req, res) => {
    try {
        const { usn } = req.params;
        if (!usn || !usn.trim()) {
            return res.status(400).json({ success: false, message: 'USN parameter is required' });
        }

        const normalizedUsn = usn.trim();
        const usnRegex = new RegExp(`^${normalizedUsn}$`, 'i');

        // 1. Delete student from Student collection (erases login credentials)
        const deletedStudent = await Student.findOneAndDelete({ usn: usnRegex });
        if (!deletedStudent) {
            return res.status(404).json({
                success: false,
                message: `Student with USN "${usn}" not found in database.`
            });
        }

        // 2. Clean up associated AttendanceSheet and Result documents
        await AttendanceSheet.deleteMany({ usn: usnRegex });
        await Result.deleteMany({ usn: usnRegex });

        // 3. Remove student from daily attendance session records
        await Attendance.updateMany(
            {},
            { $pull: { records: { usn: usnRegex } } }
        );

        // 4. Remove student from targeted assignments
        await Assignment.updateMany(
            { selectedStudents: usnRegex },
            { $pull: { selectedStudents: usnRegex } }
        );

        res.json({
            success: true,
            message: `Student ${deletedStudent.username} (${deletedStudent.usn}) removed successfully. Login credentials erased.`,
            removedUsn: deletedStudent.usn
        });
    } catch (error) {
        console.error('Error removing student:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error while removing student'
        });
    }
});

export default router;
