import { verifyToken,createClerkClient } from "@clerk/backend";

export const verifyClerkToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    };
    const verified = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
        authorizedParties: ["http://localhost:3000"],
    });

    req.user = verified; // attach user to request
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
