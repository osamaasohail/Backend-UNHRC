import dotenv from 'dotenv'
import mongoose from "mongoose";
import DB_NAME from "./constants.js";
import connectDB from './db/index.js';
import { app } from "./app.js";

dotenv.config({ path: './.env' })
//console.log("MONGODB_URI =", process.env.MONGODB_URI);


connectDB()
.then(()=> { 
    app.listen(process.env.PORT || 5000,()=>{
        console.log(`Server is running on port ${process.env.PORT || 5000}`);
    });
    app.on("error", (error) => {
        console.log("Error ! server is unable to run", error);
        throw error;
    });
})
.catch((error) => { console.log("Error while connecting to database", error) });

