import mongoose from "mongoose";

const cartCollection = 'carts';
const cartSchema = mongoose.Schema({
    "id":{type:Number,unique:true},
    "products":[]
})

export const cartModel = mongoose.model(cartCollection,cartSchema)