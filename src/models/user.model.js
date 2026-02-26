import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    clerkId:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index:true,
    },
    firstName:{
        type: String,
        required: false,
        trim: true,
    },
    lastName:{
        type: String,
        required: false,
        trim: true,
    },
    phoneNumber:{
        type: String,
        required: false,
        trim: true,
    },
    isFormSubmitted:{
        type: Boolean,
        default: false,
    },
    lastSeen:{
        type: Date,
        default: Date.now,
    },
    

},{timestamps:true});

export const User = mongoose.model("User", userSchema);