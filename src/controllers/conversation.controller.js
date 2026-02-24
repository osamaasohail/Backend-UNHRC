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
    const loginUser = await User.findOne({ clerkId });

    if (!loginUser) {
        throw new ApiError(404, "Sender user not found");
    }
    const receiverUser = await User.findById(receiverId);

    if (!receiverUser) {
        throw new ApiError(404, "Receiver user not found");
    }
    const participants = [
        loginUser._id.toString(),
        receiverUser._id.toString()
    ].sort();

    let conversation = await Conversation.findOne({
        participants: { $all: participants }
    });

    console.log("Existing conversation:", conversation);

    if (!conversation) {
        conversation = await Conversation.create({
            participants
        });
    }
    console.log("Existing conversation:", conversation);
    return res.status(200).json(
        new ApiResponse(200, conversation, "Conversation fetched successfully")
    );
});

export const getUserConversations = asyncHandler(async (req, res) => {

    const clerkId = req.user?.sub;

    if (!clerkId) {
        throw new ApiError(401, "Unauthorized request");
    }

    // Find logged-in user in MongoDB
    const user = await User.findOne({ clerkId });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const conversations = await Conversation.find({
        participants: user._id
    })
        .populate("participants", "email")
        .populate("lastMessage")
        .sort({ updatedAt: -1 });

    return res.json(
        conversations
    );
});

export const getConversationById = asyncHandler(async (req, res) => {

    const { conversationId } = req.params;

    const clerkId = req.user?.sub;

    const loginUser = await User.findOne({ clerkId });

    if (!loginUser) {
        throw new ApiError(401, "Unauthorized");
    }

    const conversation = await Conversation.findById(conversationId)
        .populate("participants", "email");

    if (!conversation) {
        throw new ApiError(404, "Conversation not found");
    }

    /*
    Find other user
    */

    const otherUser = conversation.participants.find(
        p => p._id.toString() !== loginUser._id.toString()
    );

    return res.json({
        conversation,
        otherUser
    });
});