import mongoose from 'mongoose';
const { Schema } = mongoose;

const studentSchema = new mongoose.Schema({
    username: { type: String, required: true },
    usn: { type: String, required: true ,unique:true},
    password: { type: String, required: true}, 
});

export default mongoose.model('Student', studentSchema);