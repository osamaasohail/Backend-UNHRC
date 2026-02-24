import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Conversation } from "../models/chat.model.js";
import { User } from "../models/user.model.js";

export const createOrGetConversation = asyncHandler(async (req, res) => {

    const clerkId = req.user?.sub;
    console.log("Authenticated user clerkId:", clerkId);
    if (!clerkId) {
        throw new ApiError(401, "Unauthorized request");
    }

    const { receiverId } = req.params;

    if (!receiverId) {
        throw new ApiError(400, "Receiver id required");
    }
    const senderUser = await User.findOne({ clerkId });

    if (!senderUser) {
        throw new ApiError(404, "Sender user not found");
    }
    const receiverUser = await User.findById(receiverId);

    if (!receiverUser) {
        throw new ApiError(404, "Receiver user not found");
    }
    const participants = [
        senderUser._id.toString(),
        receiverUser._id.toString()
    ].sort();

    let conversation = await Conversation.findOne({
        participants: { $all: participants }
    });

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