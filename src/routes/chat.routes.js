import { Router} from "express";
import { getChatUsers ,getMessagesBetweenUsers } from "../controllers/chat.controller.js";
import { verifyClerkToken } from "../middlewares/auth.middleware.js";
import { createOrGetConversation,getUserConversations ,getConversationById} from "../controllers/conversation.controller.js";

const router = Router();


router.route("/chat-users").get(verifyClerkToken,getChatUsers);
router.route("/messages/:conversationId").get(verifyClerkToken, getMessagesBetweenUsers);
router.route("/conversation/:receiverId").post(verifyClerkToken, createOrGetConversation);
router.route("/conversations").post(verifyClerkToken,getUserConversations);
router.route("/conversation/:conversationId").get(verifyClerkToken,getConversationById);


export default router;
