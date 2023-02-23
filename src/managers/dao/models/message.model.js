import mongoose from "mongoose";

const messageCollection = 'messages';
const messageSchema = mongoose.Schema({
    user:String, 
    message: String
})

export const messageModel = mongoose.model(messageCollection,messageSchema)