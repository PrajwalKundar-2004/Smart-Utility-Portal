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
app.use(express.urlencoded({ extended: true }));
import { getSignedDownloadUrl } from "./config/cloudinary.js";
// connect routes
app.use('/api/lecture',lectureRoutes);
app.use('/api/student',studentRoutes);

// Stream and view attachments (PDFs and images)
app.get('/api/attachment/view', async (req, res) => {
  try {
    const { publicId, format = 'pdf', fileName, download } = req.query;
    if (!publicId) {
      return res.status(400).send('Missing publicId parameter');
    }

    const isPdf = format.toLowerCase() === 'pdf' || (fileName && fileName.toLowerCase().endsWith('.pdf'));
    const resourceType = 'image';
    const signedUrl = getSignedDownloadUrl(publicId, isPdf ? 'pdf' : format, resourceType);

    const response = await fetch(signedUrl);
    if (!response.ok) {
      return res.redirect(signedUrl);
    }

    const contentType = response.headers.get('content-type') || (isPdf ? 'application/pdf' : 'image/jpeg');
    const disposition = download === 'true' ? 'attachment' : 'inline';
    const safeName = (fileName || (isPdf ? 'document.pdf' : 'image.jpg')).replace(/["\r\n]/g, '');

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `${disposition}; filename="${safeName}"`);

    const arrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error('Error viewing attachment:', err);
    res.status(500).send('Error loading attachment');
  }
});

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});

