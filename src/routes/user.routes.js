import { registerUser,getUserData,updateUserProfile ,getFormSubmitted} from "../controllers/user.controller.js";
import { verifyClerkToken } from "../middlewares/auth.middleware.js";
import { Router} from "express";

const router = Router();

router.route("/register").post(registerUser)
router.route("/profile").get(verifyClerkToken, getUserData);
router.route("/profile-update").patch(verifyClerkToken, updateUserProfile);
router.route("/form-submitted").get(verifyClerkToken,getFormSubmitted);


  

export default router;