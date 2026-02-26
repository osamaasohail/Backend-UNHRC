import { Conversation, Message } from "../models/chat.model.js";
import { User } from "../models/user.model.js";

const onlineUsers = new Set();
const socketUserMap = new Map(); 

export const initSocket = (io) => {

  io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    /*
    ======================================================
    REGISTER USER (ONLINE PRESENCE)
    ======================================================
    */
    socket.on("register", async (userId) => {

      if (!userId) return;
    
      socket.join(userId);
    
      onlineUsers.add(userId);
      socketUserMap.set(socket.id, userId);
    
      await User.findByIdAndUpdate(userId, {
        lastSeen: new Date()
      });
    
      io.emit("online_users_update", Array.from(onlineUsers));
    
    });

    /*
    ======================================================
    HEARTBEAT PRESENCE KEEP ALIVE
    ======================================================
    */
    socket.on("heartbeat", async (userId) => {

      if (!userId) return;

      await User.findByIdAndUpdate(userId, {
        lastSeen: new Date()
      });

      io.emit("online_users_update", Array.from(onlineUsers));
    });

    /*
    ======================================================
    JOIN CONVERSATION ROOM
    ======================================================
    */
    socket.on("join_conversation", (conversationId) => {

      if (!conversationId || conversationId.length !== 24) return;

      socket.join(conversationId);
    });

    /*
    ======================================================
    SEND MESSAGE
    ======================================================
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

      /*
      Dashboard refresh trigger
      */
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
    ======================================================
    DISCONNECT
    ======================================================
    */
    socket.on("disconnect", async () => {

      console.log("Socket disconnected:", socket.id);
    
      const userId = socketUserMap.get(socket.id);
    
      if (userId) {
    
        onlineUsers.delete(userId);
        socketUserMap.delete(socket.id);
    
        await User.findByIdAndUpdate(userId, {
          lastSeen: new Date()
        });
    
        io.emit("online_users_update", Array.from(onlineUsers));
      }
    
    });

  });
};