import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["text", "pdf", "photo"],
      default: "text",
    },
    fileUrl: {
      type: String,
      default: null,
    },
    filePublicId: {
      type: String,
      default: null,
    },
    fileName: {
      type: String,
      default: null,
    },
    fileSize: {
      type: String,
      default: null,
    },
    attachments: [
      {
        fileUrl: { type: String, required: true },
        filePublicId: { type: String, default: null },
        fileName: { type: String, default: null },
        fileSize: { type: String, default: null },
        fileType: { type: String, enum: ["pdf", "photo"], default: "pdf" },
      },
    ],
    targetAudience: {
      type: String,
      enum: ["all", "selected"],
      default: "all",
    },
    selectedStudents: {
      type: [String], // Array of student USNs
      default: [],
    },
    dueDate: {
      type: Date,
      default: null,
    },
    totalMarks: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: String,
      default: "Lecturer",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedBy: {
      type: String,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes for fast querying
assignmentSchema.index({ subject: 1, isDeleted: 1 });
assignmentSchema.index({ targetAudience: 1, selectedStudents: 1 });

export default mongoose.model("Assignment", assignmentSchema);
