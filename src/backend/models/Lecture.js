import mongoose from 'mongoose';
const { Schema } = mongoose;

const lectureSchema = new mongoose.Schema({
    secretKey: { type: String, required: true },
    password: { type: String, required: true },
    subjects: [{ name: { type: String, required: true } }]
});
export default mongoose.model('Lecture', lectureSchema);