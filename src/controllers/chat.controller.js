import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Conversation, Message } from "../models/chat.model.js";


const getChatUsers = asyncHandler(async (req, res) => {

  const clerkId = req.user?.sub;

  if (!clerkId) {
    throw new ApiError(401, "Unauthorized request");
  }
  const loggedInUser = await User.findOne({ clerkId });

  if (!loggedInUser) {
    throw new ApiError(404, "User not found");
  }

  const users = await User.find({
    _id: { $ne: loggedInUser._id }
  }).select("_id email");


  return res.status(200).json(
    new ApiResponse(200, users, "Users fetched successfully")
  );
});


const getMessagesBetweenUsers = asyncHandler(async (req, res) => {

  const { conversationId } = req.params;

  if (!conversationId) {
    throw new ApiError(400, "Conversation id required");
  }

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    return res.status(200).json(
      new ApiResponse(200, [], "No messages yet")
    );
  }

  const messages = await Message.find({
    conversation: conversationId
  })
    .sort({ createdAt: 1 })
    .select("_id sender text createdAt");

    return res.status(200).json(
      new ApiResponse(
        200,
        messages,
        "Messages fetched successfully"
      )
    );

});

export { getChatUsers ,getMessagesBetweenUsers };