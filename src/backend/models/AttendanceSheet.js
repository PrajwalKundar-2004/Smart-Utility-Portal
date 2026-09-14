import mongoose from "mongoose";

const columnSchema = new mongoose.Schema({
    name: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed, default: 0 }
}, { _id: false });

const subjectAttendanceSchema = new mongoose.Schema({
    subject: { type: String, required: true },
    columns: [columnSchema],
    total: { type: mongoose.Schema.Types.Mixed, default: 0 }
}, { _id: false });

const attendanceSheetSchema = new mongoose.Schema({
    usn: {
        type: String,
        required: true,
        unique: true
    },
    studentName: {
        type: String
    },
    subjects: [subjectAttendanceSchema]
}, { strict: false, timestamps: true });

export default mongoose.model("AttendanceSheet", attendanceSheetSchema);
