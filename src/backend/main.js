import dotenv from "dotenv";
dotenv.config({path:"./src/backend/.env"});
import express from "express";
import connectDB from "./config/db.js";
import lectureRoutes from "./routes/lectureRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { initChatSocket } from "./socket/chatSocket.js";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
const app = express()
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

initChatSocket(io);

const port = process.env.port || 3000;
connectDB();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
import { getSignedDownloadUrl } from "./config/cloudinary.js";
// connect routes
app.use('/api/lecture',lectureRoutes);
app.use('/api/student',studentRoutes);
app.use("/api/chat", chatRoutes); 
// Stream and view attachments (PDFs and images)
app.get('/api/attachment/view', async (req, res) => {
  try {
    let { publicId, format = '', fileName, download, resourceType, url } = req.query;

    // If url is provided instead of publicId, extract publicId from Cloudinary URL
    if (!publicId && url) {
      try {
        const parsedUrl = new URL(url);
        const pathname = decodeURIComponent(parsedUrl.pathname);
        const match = pathname.match(/\/(?:raw|image|video)\/upload\/(?:v\d+\/)?(.+)$/);
        if (match && match[1]) {
          publicId = match[1];
          if (pathname.includes('/raw/')) resourceType = 'raw';
          else if (pathname.includes('/image/')) resourceType = 'image';
        }
      } catch (e) {
        console.error('Error parsing attachment URL in /api/attachment/view:', e);
      }
    }

    if (!publicId) {
      return res.status(400).send('Missing publicId or url parameter');
    }

    const isPdf = format.toLowerCase() === 'pdf' ||
      (fileName && fileName.toLowerCase().endsWith('.pdf')) ||
      publicId.toLowerCase().endsWith('.pdf');

    const actualResourceType = resourceType || (isPdf ? 'raw' : 'image');
    const signedUrl = getSignedDownloadUrl(publicId, isPdf ? '' : format, actualResourceType);

    let response = await fetch(signedUrl);

    // Fallback: If 404 or not OK, try alternative resource type
    if (!response.ok) {
      const fallbackType = actualResourceType === 'raw' ? 'image' : 'raw';
      const fallbackSignedUrl = getSignedDownloadUrl(publicId, isPdf ? 'pdf' : format, fallbackType);
      const fallbackResponse = await fetch(fallbackSignedUrl);
      if (fallbackResponse.ok) {
        response = fallbackResponse;
      }
    }

    if (!response.ok) {
      return res.redirect(signedUrl);
    }

    const contentType = response.headers.get('content-type') || (isPdf ? 'application/pdf' : 'image/jpeg');
    const disposition = download === 'true' ? 'attachment' : 'inline';
    const safeName = (fileName || (isPdf ? 'document.pdf' : 'attachment')).replace(/["\r\n]/g, '');

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `${disposition}; filename="${safeName}"`);

    const arrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error('Error viewing attachment:', err);
    res.status(500).send('Error loading attachment: ' + (err.message || 'Server error'));
  }
});

server.listen(port, () => {
  console.log(`server running on port ${port} with WebSockets active`);
});


