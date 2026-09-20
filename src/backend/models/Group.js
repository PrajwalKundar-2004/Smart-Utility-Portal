import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    // The lecturer who created the group and has admin powers
    createdBy: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      role: { type: String, default: "lecture" },
    },
    // Target audience: 'all' (all students) or 'selected' (specific USNs)
    targetAudience: {
      type: String,
      enum: ["all", "selected"],
      default: "all",
    },
    // List of active members in the group
    members: [
      {
        usn: { type: String, required: true },
        name: { type: String, required: true },
        role: { type: String, enum: ["student", "lecture"], default: "student" },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    // Track students who left or were removed (for audit & permissions)
    removedMembers: [
      {
        usn: { type: String },
        name: { type: String },
        removedAt: { type: Date, default: Date.now },
        reason: { type: String, enum: ["left", "removed_by_lecturer"] },
      },
    ],
    // Store latest message info for fast sidebar previews (like WhatsApp chat list)
    lastMessage: {
      content: { type: String, default: "" },
      senderName: { type: String, default: "" },
      time: { type: Date },
    },
  },
  { timestamps: true }
);

// Indexes for super-fast lookups when loading a user's chat list
groupSchema.index({ "members.usn": 1 });
groupSchema.index({ targetAudience: 1 });

export default mongoose.model("Group", groupSchema);
