import { verifyWebhook } from '@clerk/express/webhooks';
import {User} from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const clerkUserCreation = asyncHandler( async (req, res) => {
    
    const evt = await verifyWebhook(req);

    if (evt.type === "user.created") {
      const user = evt.data;

      const existingUser = await User.findOne({ clerkId: user.id });
      if (!existingUser) {
        const newUser = await User.create({
          clerkId: user.id,
          email: user.email_addresses[0].email_address,
          firstName: user.first_name || "",
          lastName: user.last_name || "",
        });
        console.log("New user saved:", newUser.email);
      } else {
        console.log("User already exists:", existingUser.email);
      }
    }

   return res
      .status(200)
      .json(
        new ApiResponse(200, newUser, "User created successfully")
      );
});