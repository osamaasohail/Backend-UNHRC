import { Router} from "express";
import { getChatUsers ,getMessagesBetweenUsers } from "../controllers/chat.controller.js";
import { verifyClerkToken } from "../middlewares/auth.middleware.js";
import { createOrGetConversation,getUserConversations ,getConversationById} from "../controllers/conversation.controller.js";

const router = Router();


router.route("/chat-users").get(verifyClerkToken,getChatUsers); //get all users except logged in user for chat list
router.route("/messages/:conversationId").get(verifyClerkToken, getMessagesBetweenUsers); //get all messaes by conversation ID
router.route("/conversation/:receiverId").post(verifyClerkToken, createOrGetConversation); // create conversation in database with id for room
router.route("/conversations").post(verifyClerkToken,getUserConversations);  //get all conversations of logged in user with last message and user details
router.route("/conversation/:conversationId").get(verifyClerkToken,getConversationById); //get conversation users email by ID


export default router;
