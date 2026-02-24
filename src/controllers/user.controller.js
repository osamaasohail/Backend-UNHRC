import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    const { clerkId, email, firstName, lastName } = req.body;

    if (!clerkId || !email) {
        throw new ApiError(400, "Missing required fields");
      }

      const existingUser = await User.findOne({ clerkId });
    
      if (existingUser) {
        // Already synced, return it
        return res.status(200).json(
          new ApiResponse(200, existingUser, "User already exists")
        );
      }

      const newUser = await User.create({
        clerkId,
        email,
        firstName,
        lastName,
      });

      return res
      .status(201)
      .json(
        new ApiResponse(201, newUser, "User created successfully")
      );
});

const getUserData = asyncHandler(async (req, res) => {
    const clerkId = req.user.sub; // from verified token
    const user = await User.findOne({ clerkId });

    if (!user) {
        throw new ApiError(404, "User not found in database");
    }

    
    res.status(200).json(new ApiResponse(200, {
            _id: user._id,
            userId: user.clerkId,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            isProfileComplete: user.isFormSubmitted,
    },"User data retrieved successfully"));
});


const updateUserProfile = asyncHandler(async (req, res) => {
  const clerkId = req.user.sub; // from Clerk JWT

  const { firstName, lastName, phoneNumber} = req.body;

  if (!firstName || !lastName || !phoneNumber) {
      throw new ApiError(400, "First and last name and number are required");
  }
  const user = await User.findOneAndUpdate(
      { clerkId },
      {
          firstName,
          lastName,
          phoneNumber,
          isFormSubmitted: true,
      },
      {returnDocument: "after",upsert: true }  //new: true
  );
  if (!user) {
      throw new ApiError(404, "User not found");
  }

  res.status(200).json(
      new ApiResponse(
          200,
          {
              userId: user.clerkId,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              isProfileComplete: user.isFormSubmitted,
          },
          "Profile updated successfully"
      )
  );
});

const getFormSubmitted = asyncHandler(async (req, res) => {
  const clerkId = req.user.sub; // from Clerk JWT

  const user = await User.findOne({ clerkId }).select("isFormSubmitted");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

console.log(user);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        isFormSubmitted: user.isFormSubmitted,
      },
      "Form status fetched"
    )
  );
});





export {registerUser,getUserData,updateUserProfile,getFormSubmitted};