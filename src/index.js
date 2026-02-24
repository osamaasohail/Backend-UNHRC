import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/index.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { initSocket } from "./socket/index.js"; // ⚡ import socket setup

dotenv.config({ path: "./.env" });

connectDB().then(() => {
  const server = createServer(app);
  const io = new Server(server, {
    cors: { origin: "http://localhost:3000", credentials: true },
  });
  initSocket(io);

  server.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
  });
});
