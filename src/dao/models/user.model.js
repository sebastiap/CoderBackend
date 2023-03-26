import mongoose from "mongoose";

const userCollection = 'users';
const userSchema = mongoose.Schema({
    first_name:String,
    last_name:String,
    age:Number,
    email:String, 
    password: String,
    admin:{type:Boolean, default:false},
    role:{type:String, default:"User"}
})

export const userModel = mongoose.model(userCollection,userSchema);
