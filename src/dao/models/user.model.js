import mongoose from "mongoose";

const userCollection = 'users';
const userSchema = mongoose.Schema({
    first_name:String,
    last_name:String,
    email:{type:String, unique:true}, 
    age:Number,
    password: String,
    cart:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'carts'
    },
    role:{type:String, default:"User"},
    last_conection:String
})

export const userModel = mongoose.model(userCollection,userSchema);
