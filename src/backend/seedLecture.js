import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Lecture from './models/Lecture.js';
import connectDB from './config/db.js';

// Load env vars
dotenv.config({ path: './src/backend/.env' });

const seedLecture = async () => {
    try {
        await connectDB();
        
        // Define default credentials
        const plainPassword = "admin123";
        const plainSecretKey = "@vcetMcaLecture";

        // Hash credentials securely
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);
        const hashedSecretKey = await bcrypt.hash(plainSecretKey, salt);

        // Delete any existing lecturer documents (to enforce a single truth)
        await Lecture.deleteMany();
        console.log("Cleared existing lecturer credentials.");

        // Save new secured credentials
        const lecture = new Lecture({
            secretKey: hashedSecretKey,
            password: hashedPassword
        });

        await lecture.save();
        
        console.log("=========================================");
        console.log("✅ Secure Lecturer Credentials Seeded!");
        console.log(`Password: ${plainPassword}`);
        console.log(`Secret Key: ${plainSecretKey}`);
        console.log("=========================================");

        process.exit(0);
    } catch (error) {
        console.error("Error seeding lecturer credentials:", error);
        process.exit(1);
    }
};

seedLecture();
