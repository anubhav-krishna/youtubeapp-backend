import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import express from "express";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

const app =express();

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        console.log(`\nMONGODB connection successful !! DB HOST : ${
            connectionInstance.connection.host}`);
    } catch (err) {
        console.error("MONGODB connection error: ", err);
        process.exit(1);
    }
};

export default connectDB;