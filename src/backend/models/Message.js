import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    // Which group this message was sent to
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    // Sender Information (Shown above each message bubble)
    sender: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      role: { type: String, enum: ["student", "lecture", "system"], required: true },
    },
    // The text message or caption
    content: {
      type: String,
      default: "",
      trim: true,
    },
    // Message format
    messageType: {
      type: String,
      enum: ["text", "image", "pdf", "video", "document", "system"],
      default: "text",
    },
    // File attachment metadata (for images, pdfs, documents, videos)
    file: {
      fileUrl: { type: String, default: null },
      filePublicId: { type: String, default: null },
      fileName: { type: String, default: null },
      fileSize: { type: String, default: null },
      fileType: { type: String, default: null }, // 'image' | 'pdf' | 'video' | 'document'
    },
    // ─── WhatsApp Ticks Tracking ──────────────────────────────────────────
    // 1. Single Tick (✓): Exists automatically because the message is saved (createdAt).
    // 2. Double Tick (✓✓ gray): Users whose device received the message.
    deliveredTo: [
      {
        usn: { type: String },
        deliveredAt: { type: Date, default: Date.now },
      },
    ],
    // 3. Double Blue Tick (✓✓ blue): Users who opened the chat and read the message.
    readBy: [
      {
        usn: { type: String },
        name: { type: String },
        readAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Compound index: loads chat history for a group in chronological order instantly
messageSchema.index({ groupId: 1, createdAt: 1 });

export default mongoose.model("Message", messageSchema);
