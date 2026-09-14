import mongoose from "mongoose";

const attendanceRecordSchema = new mongoose.Schema({
    usn: {
        type: String,
        required: true
    },
    studentName: {
        type: String
    },
    status: {
        type: String,
        enum: ['present', 'absent'],
        default: 'present'
    }
}, { _id: false });

const attendanceSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    records: [attendanceRecordSchema]
}, { timestamps: true });

export default mongoose.model("Attendance", attendanceSchema);
