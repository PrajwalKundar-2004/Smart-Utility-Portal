import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {  
        type: String,
        required: true,
        trim: true
    },
    postedBy: {
        type: String,
        default: 'Lecturer',
        trim: true
    },
    updatedBy: {
        type: String,
        trim: true
    },
    subject: {
        type: String,
        default: 'General'
    },
    priority: {
        type: String,
        enum: ['normal', 'important', 'urgent'],
        default: 'normal'
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedBy: {
        type: String,
        trim: true
    },
    deletedAt: {
        type: Date
    }
}, { timestamps: true });

const Notice = mongoose.model('Notice', noticeSchema);
export default Notice;