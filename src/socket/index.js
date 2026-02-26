import { Conversation, Message } from "../models/chat.model.js";
import { User } from "../models/user.model.js";

const userSockets = new Map();

export const initSocket = (io) => {

  io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    /*
    ================================
    REGISTER USER
    ================================
    */
    socket.on("register", async (userId) => {

      if (!userId) return;

      socket.join(userId);

      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }

      userSockets.get(userId).add(socket.id);

      await User.findByIdAndUpdate(userId, {
        lastSeen: new Date()
      });

      io.emit(
        "online_users_update",
        Array.from(userSockets.keys())
      );
    });

    /*
    ================================
    JOIN ROOM
    ================================
    */
    socket.on("join_conversation", (conversationId) => {

      if (!conversationId || conversationId.length !== 24) return;

      socket.join(conversationId);
    });

    /*
    ================================
    SEND MESSAGE
    ================================
    */
    socket.on("send_message", async (data) => {

      const { conversationId, senderId, text } = data;

      if (!conversationId || !senderId || !text) return;

      const message = await Message.create({
        conversation: conversationId,
        sender: senderId,
        text
      });

      const conversation = await Conversation.findByIdAndUpdate(
        conversationId,
        { lastMessage: message._id },
        { returnDocument: "after" }
      ).populate("participants lastMessage");

      io.to(conversationId).emit("receive_message", message);

      if (conversation?.participants) {

        conversation.participants.forEach(user => {

          if (!user?._id) return;

          io.to(user._id.toString()).emit(
            "dashboard_message_update"
          );
        });
      }
    });

    /*
    ================================
    DISCONNECT
    ================================
    */
    socket.on("disconnect", async () => {

      console.log("Socket disconnected:", socket.id);

      for (const [userId, socketSet] of userSockets.entries()) {

        socketSet.delete(socket.id);

        if (socketSet.size === 0) {

          userSockets.delete(userId);

          await User.findByIdAndUpdate(userId, {
            lastSeen: new Date()
          });
        }
      }

      io.emit(
        "online_users_update",
        Array.from(userSockets.keys())
      );
    });

  });
};