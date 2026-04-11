import dotenv from "dotenv";
dotenv.config({path:"./src/backend/.env"});
import express from "express";
import connectDB from "./config/db.js";
import lectureRoutes from "./routes/lectureRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import cors from "cors";
const app = express()
app.use(cors());

const port = process.env.port || 3000;
connectDB();
app.use(express.json());
// connect routes
app.use('/api/lecture',lectureRoutes);
app.use('/api/student',studentRoutes);

app.listen(port, () => {
  console.log(`server running on port ${port}`)
})
