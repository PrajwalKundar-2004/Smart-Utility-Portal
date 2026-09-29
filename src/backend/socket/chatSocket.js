import Message from "../models/Message.js";
import Group from "../models/Group.js";

export const initChatSocket = (io) => {
  io.on("connection", (socket) => {
    // ─── 1. Join a Group Room ─────────────────────────────────────────────
    socket.on("join_group", ({ groupId }) => {
      if (!groupId) return;
      socket.join(groupId);
    });

    // ─── 2. Leave a Group Room ────────────────────────────────────────────
    socket.on("leave_group_room", ({ groupId }) => {
      if (!groupId) return;
      socket.leave(groupId);
    });

    // ─── 3. Send Message (Text, Media, Reply) ───────────────────────────
    socket.on("send_message", async (data) => {
      try {
        const {
          groupId,
          sender,
          content,
          messageType = "text",
          file = null,
          clientTempId = null,
          replyTo = null,
        } = data;
        if (!groupId || !sender) return;

        // Save message in MongoDB (This triggers Single Tick ✓)
        const savedMsg = await Message.create({
          groupId,
          sender: {
            id: sender.id,
            name: sender.name,
            role: sender.role,
          },
          content: content || "",
          messageType,
          file,
          replyTo:
            replyTo && replyTo.messageId
              ? {
                  messageId: replyTo.messageId,
                  senderName: replyTo.senderName || "",
                  content: replyTo.content || "",
                  messageType: replyTo.messageType || "text",
                  fileName: replyTo.fileName || "",
                }
              : undefined,
        });

        // Update Group's lastMessage for the chat list preview
        const previewContent =
          content || (file ? `📎 ${file.fileName || file.fileType}` : "Sent an attachment");

        await Group.findByIdAndUpdate(groupId, {
          lastMessage: {
            content: previewContent,
            senderName: sender.name,
            time: savedMsg.createdAt,
          },
          updatedAt: new Date(),
        });

        // Broadcast to everyone currently in the room (including sender)
        const broadcastPayload = savedMsg.toObject ? savedMsg.toObject() : savedMsg;
        if (clientTempId) {
          broadcastPayload.clientTempId = clientTempId;
        }
        io.to(groupId).emit("receive_message", broadcastPayload);
      } catch (err) {
        console.error("Error sending socket message:", err);
      }
    });

    // ─── 3b. Broadcast Message Deletion Event ─────────────────────────────
    socket.on("messages_deleted", ({ groupId, messageIds, deleteType }) => {
      if (!groupId || !messageIds) return;
      io.to(groupId).emit("messages_deleted", { groupId, messageIds, deleteType });
    });

    // ─── 3c. Broadcast Group Deleted Event ────────────────────────────────
    socket.on("group_deleted", ({ groupId }) => {
      if (!groupId) return;
      io.to(groupId).emit("group_deleted", { groupId });
    });

    // ─── 3d. Broadcast Group Members Updated Event ────────────────────────
    socket.on("members_updated", ({ groupId, group }) => {
      if (!groupId) return;
      io.to(groupId).emit("group_members_updated", { groupId, group });
    });

    // ─── 4. Double Gray Tick (✓✓ Delivered) ────────────────────────────────
    socket.on("mark_delivered", async ({ messageId, groupId, userUsn }) => {
      try {
        if (!messageId || !userUsn) return;
        const msg = await Message.findById(messageId);
        if (!msg) return;

        // Check if this user is already recorded in deliveredTo
        const alreadyDelivered = msg.deliveredTo.some((d) => d.usn === userUsn);
        if (!alreadyDelivered) {
          msg.deliveredTo.push({ usn: userUsn, deliveredAt: new Date() });
          await msg.save();

          // Inform everyone in the group room so the sender's UI updates to double tick
          io.to(groupId).emit("message_status_updated", {
            messageId,
            deliveredTo: msg.deliveredTo,
            readBy: msg.readBy,
          });
        }
      } catch (err) {
        console.error("Error marking message delivered:", err);
      }
    });

    // ─── 5. Double Blue Tick (✓✓ Read / Seen) ──────────────────────────────
    socket.on("mark_read", async ({ messageId, groupId, userUsn, userName }) => {
      try {
        if (!messageId || !userUsn) return;
        const msg = await Message.findById(messageId);
        if (!msg) return;

        // Check if this user is already recorded in readBy
        const alreadyRead = msg.readBy.some((r) => r.usn === userUsn);
        if (!alreadyRead) {
          msg.readBy.push({ usn: userUsn, name: userName, readAt: new Date() });
          await msg.save();

          // Inform everyone in the group room so ticks turn blue
          io.to(groupId).emit("message_status_updated", {
            messageId,
            deliveredTo: msg.deliveredTo,
            readBy: msg.readBy,
          });
        }
      } catch (err) {
        console.error("Error marking message read:", err);
      }
    });

    // ─── 6. Batch Mark All Messages in Group as Read ───────────────────────
    socket.on("mark_all_read", async ({ groupId, userUsn, userName }) => {
      try {
        if (!groupId || !userUsn) return;
        await Message.updateMany(
          { groupId, "readBy.usn": { $ne: userUsn } },
          { $push: { readBy: { usn: userUsn, name: userName, readAt: new Date() } } }
        );
        // Notify room to refresh ticks
        io.to(groupId).emit("all_messages_read", { groupId, userUsn });
      } catch (err) {
        console.error("Error in mark_all_read:", err);
      }
    });

    // ─── 7. Live Typing Indicator ─────────────────────────────────────────
    socket.on("typing", ({ groupId, userName }) => {
      socket.to(groupId).emit("user_typing", { groupId, userName });
    });

    socket.on("stop_typing", ({ groupId }) => {
      socket.to(groupId).emit("user_stop_typing", { groupId });
    });

    // ─── 8. Disconnect ────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      // Disconnected
    });
  });
};
