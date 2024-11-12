import mongoose from "mongoose";
import dotenv from "dotenv/config";

export const connectDb = async () => {
  try {
    const url = process.env.DBURL;
    mongoose.connect(url);
    console.log("DB connected successfully");
  } catch (error) {
    console.log("Error connection mongodb");
  }
};
