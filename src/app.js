import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";// we need dis to acces cookies from server to user browser and perform crud operations on cookies





const app = express();
app.use(cors({
    origin:'http://localhost:3000' , //process.env.CLIENT_URL
    credentials: true,
}));
app.use(express.json({
    limit:"16kb"
}));
app.use(express.urlencoded({extended:true,limit:"16kb"}));
app.use(express.static("public"));
app.use(cookieParser());

import userRoutes from "./routes/user.routes.js";
import clerkRoutes from "./routes/clerk.routes.js";

app.use("/users", userRoutes);
app.use("/webhooks", clerkRoutes);






export {app};