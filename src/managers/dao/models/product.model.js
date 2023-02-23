import mongoose from "mongoose";

const productCollection = 'products';
const productSchema = mongoose.Schema({
    "id":{type:Number,unique:true},
    "title":String,
    "price":Number,
    "thumbnail":String,
    "stock":{type:Number},
    "code":{type:String,unique:true},
    "category":String,
    "status":Boolean
})

export const productModel = mongoose.model(productCollection,productSchema)