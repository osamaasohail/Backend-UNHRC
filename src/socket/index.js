import { Conversation, Message } from "../models/chat.model.js";

export const initSocket = (io) => {

  io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    /*
    ===============================
    USER SOCKET REGISTRATION
    ===============================
    */
    socket.on("register", (userId) => {
      if (!userId) return;

      socket.join(userId);
      console.log(`User registered in room ${userId}`);
    });

    /*
    ===============================
    JOIN CHAT CONVERSATION ROOM
    ===============================
    */
    socket.on("join_conversation", (conversationId) => {

      if (!conversationId || conversationId.length !== 24) return;

      socket.join(conversationId);

      console.log(`private room  ${socket.id} joined ${conversationId}`);
    });

    /*
    ===============================
    SEND MESSAGE REALTIME
    ===============================
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
        { new: true }
      ).populate("participants lastMessage");
    
      /*
      ✅ Realtime Chat Room Update
      */
      io.to(conversationId).emit("receive_message", message);
    
      /*
      ✅ Dashboard Realtime Update (VERY IMPORTANT)
      */
      conversation.participants.forEach(user => {
        io.to(user._id.toString()).emit(
          "dashboard_message_update"
        );
      });
    
    });

    /*
    ===============================
    DISCONNECT LOG
    ===============================
    */
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });

  });

};