import express from "express";
import jwt from "jsonwebtoken";
import multer from "multer";
import Group from "../models/Group.js";
import Message from "../models/Message.js";
import Student from "../models/Student.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

const router = express.Router();

// Multer in-memory storage for file uploads (max 30MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 },
});

// ─── Unified Authentication Middleware (Handles BOTH Lecturer & Student) ───
const chatAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, message: "No token provided" });

  const token = authHeader.split(" ")[1];

  // 1. Try decoding as Lecturer token
  try {
    const decodedLect = jwt.verify(token, process.env.jwt_secret);
    if (decodedLect) {
      req.user = {
        role: "lecture",
        id: "lecture",
        name: req.headers["x-user-name"] || "Lecturer",
      };
      return next();
    }
  } catch {
    // Not a lecturer token, try student token
  }

  // 2. Try decoding as Student token
  try {
    const decodedStudent = jwt.verify(token, process.env.jwt_student_key);
    if (decodedStudent && decodedStudent.usn) {
      const studentDoc = await Student.findOne({ usn: decodedStudent.usn });
      req.user = {
        role: "student",
        id: decodedStudent.usn,
        usn: decodedStudent.usn,
        name: studentDoc ? studentDoc.username : decodedStudent.usn,
      };
      return next();
    }
  } catch {
    return res.status(401).json({ success: false, message: "Invalid session token" });
  }

  return res.status(401).json({ success: false, message: "Unauthorized access" });
};

// ─── 1. Get all accessible groups for logged-in user ───────────────────────
router.get("/groups", chatAuth, async (req, res) => {
  try {
    let groups = [];
    if (req.user.role === "lecture") {
      // Lecturers see all groups
      groups = await Group.find().sort({ updatedAt: -1 });
    } else {
      // Students see groups where they are active members or audience is 'all' (unless removed)
      groups = await Group.find({
        $or: [
          { "members.usn": req.user.usn },
          { targetAudience: "all", "removedMembers.usn": { $ne: req.user.usn } },
        ],
      }).sort({ updatedAt: -1 });
    }
    res.json({ success: true, groups });
  } catch (err) {
    console.error("Error fetching groups:", err);
    res.status(500).json({ success: false, message: "Failed to load chat groups" });
  }
});

// ─── 2. Create Group (Lecturers Only) ───────────────────────────────────────
router.post("/groups", chatAuth, async (req, res) => {
  try {
    if (req.user.role !== "lecture") {
      return res.status(403).json({ success: false, message: "Only lecturers can create groups" });
    }

    const { name, description, targetAudience, selectedStudents } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Group name is required" });
    }

    // Prepare members list starting with the lecturer
    const members = [
      {
        usn: "LECTURER",
        name: req.user.name || "Lecturer",
        role: "lecture",
        joinedAt: new Date(),
      },
    ];

    if (targetAudience === "all") {
      // Fetch all students registered in DB
      const allStudents = await Student.find({}, "usn username");
      allStudents.forEach((st) => {
        members.push({
          usn: st.usn,
          name: st.username,
          role: "student",
          joinedAt: new Date(),
        });
      });
    } else if (Array.isArray(selectedStudents) && selectedStudents.length > 0) {
      // Fetch selected students by USN
      const students = await Student.find({ usn: { $in: selectedStudents } }, "usn username");
      students.forEach((st) => {
        members.push({
          usn: st.usn,
          name: st.username,
          role: "student",
          joinedAt: new Date(),
        });
      });
    }

    const group = await Group.create({
      name: name.trim(),
      description: description ? description.trim() : "",
      createdBy: {
        id: req.user.id,
        name: req.user.name || "Lecturer",
        role: "lecture",
      },
      targetAudience: targetAudience || "all",
      members,
      lastMessage: {
        content: `Group created by ${req.user.name || "Lecturer"}`,
        senderName: "System",
        time: new Date(),
      },
    });

    // Create initial system message
    await Message.create({
      groupId: group._id,
      sender: { id: "SYSTEM", name: "System", role: "system" },
      content: `${req.user.name || "Lecturer"} created group "${group.name}"`,
      messageType: "system",
    });

    res.status(201).json({ success: true, group });
  } catch (err) {
    console.error("Error creating group:", err);
    res.status(500).json({ success: false, message: "Failed to create group" });
  }
});

// ─── 3. Get Messages for a Group ───────────────────────────────────────────
router.get("/groups/:groupId/messages", chatAuth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const messages = await Message.find({ groupId }).sort({ createdAt: 1 }).limit(200);
    res.json({ success: true, messages });
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ success: false, message: "Failed to load messages" });
  }
});

// ─── 4. Lecturer removes a student from group ──────────────────────────────
router.post("/groups/:groupId/remove-student", chatAuth, async (req, res) => {
  try {
    if (req.user.role !== "lecture") {
      return res.status(403).json({ success: false, message: "Only lecturers can remove students" });
    }

    const { groupId } = req.params;
    const { usn } = req.body;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ success: false, message: "Group not found" });

    const memberToRemove = group.members.find((m) => m.usn === usn);
    const memberName = memberToRemove ? memberToRemove.name : usn;

    // Filter out from members and add to removedMembers
    group.members = group.members.filter((m) => m.usn !== usn);
    group.removedMembers.push({
      usn,
      name: memberName,
      removedAt: new Date(),
      reason: "removed_by_lecturer",
    });
    await group.save();

    // Create system message
    const systemMsg = await Message.create({
      groupId,
      sender: { id: "SYSTEM", name: "System", role: "system" },
      content: `${req.user.name || "Lecturer"} removed ${memberName} (${usn}) from the group`,
      messageType: "system",
    });

    res.json({ success: true, group, systemMessage: systemMsg });
  } catch (err) {
    console.error("Error removing student:", err);
    res.status(500).json({ success: false, message: "Failed to remove student" });
  }
});

// ─── 5. Student leaves a group ─────────────────────────────────────────────
router.post("/groups/:groupId/leave", chatAuth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const usn = req.user.usn;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ success: false, message: "Group not found" });

    const member = group.members.find((m) => m.usn === usn);
    const memberName = member ? member.name : (req.user.name || usn);

    group.members = group.members.filter((m) => m.usn !== usn);
    group.removedMembers.push({
      usn,
      name: memberName,
      removedAt: new Date(),
      reason: "left",
    });
    await group.save();

    // Create system message
    const systemMsg = await Message.create({
      groupId,
      sender: { id: "SYSTEM", name: "System", role: "system" },
      content: `${memberName} (${usn}) left the group`,
      messageType: "system",
    });

    res.json({ success: true, group, systemMessage: systemMsg });
  } catch (err) {
    console.error("Error leaving group:", err);
    res.status(500).json({ success: false, message: "Failed to leave group" });
  }
});

// ─── 6. Upload Media File (Images, PDFs, Videos, Documents) ────────────────
router.post("/upload", chatAuth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file provided" });
    }

    const { originalname, size, mimetype, buffer } = req.file;

    // Detect format category
    let fileType = "document";
    if (mimetype.startsWith("image/")) {
      fileType = "image";
    } else if (mimetype === "application/pdf" || originalname.toLowerCase().endsWith(".pdf")) {
      fileType = "pdf";
    } else if (mimetype.startsWith("video/")) {
      fileType = "video";
    }

    // Call uploadToCloudinary(buffer, originalname, folder)
    const uploadResult = await uploadToCloudinary(buffer, originalname, "chat_attachments");

    const fileSizeFormatted =
      size < 1024 * 1024
        ? `${(size / 1024).toFixed(1)} KB`
        : `${(size / (1024 * 1024)).toFixed(1)} MB`;

    const isDocOrPdf = fileType === "pdf" || fileType === "document";
    const finalUrl = uploadResult.url || uploadResult.secure_url || "";
    // For PDFs and documents, generate direct proxy view URL so browser can view inline without Cloudinary 401
    const viewUrl = isDocOrPdf
      ? `/api/attachment/view?publicId=${encodeURIComponent(uploadResult.public_id)}&fileName=${encodeURIComponent(originalname)}&resourceType=raw`
      : finalUrl;

    res.json({
      success: true,
      file: {
        fileUrl: viewUrl,
        directUrl: finalUrl,
        filePublicId: uploadResult.public_id,
        fileName: originalname,
        fileSize: fileSizeFormatted,
        fileType,
      },
    });
  } catch (err) {
    console.error("Error uploading chat attachment:", err);
    res.status(500).json({ success: false, message: "Attachment upload failed: " + (err.message || "Server error") });
  }
});

export default router;
