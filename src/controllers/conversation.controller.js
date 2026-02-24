import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Conversation } from "../models/chat.model.js";

export const createOrGetConversation = asyncHandler(async (req, res) => {

    const senderId = req.user._id.toString();
    const { receiverId } = req.params;

    if (!receiverId) {
        throw new ApiError(400, "Receiver id required");
    }

    const receiver = receiverId.toString();

    // ✅ Sort participants (VERY IMPORTANT)
    const participants = [senderId, receiver].sort();

    // ✅ Find conversation
    let conversation = await Conversation.findOne({
        participants: { $all: participants }
    });

    // ✅ If not exists → create conversation
    if (!conversation) {
        conversation = await Conversation.create({
            participants
        });
    }
    return res.status(200).json(
        new ApiResponse(200, conversation, "Conversation fetched successfully")
    );
});

export const getUserConversations = async (req, res) => {
    const userId = req.user._id;
  
    const conversations = await Conversation.find({
      participants: userId
    })
      .populate("participants", "email")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });
  
    res.json(conversations);
  };