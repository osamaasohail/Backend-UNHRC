import express from "express";
import { clerkUserCreation } from "../controllers/clerk.controller.js";

const router = express.Router();

router.route("/clerk").post(express.raw({ type: "application/json" }),clerkUserCreation)

export default router;