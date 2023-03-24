import mongoose from "mongoose";

const userCollection = 'users';
const userSchema = mongoose.Schema({
    user:String, 
    password: String
})

export const userModel = mongoose.model(userCollection,userSchema);
