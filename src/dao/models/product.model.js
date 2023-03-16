import mongoose from "mongoose";

const productCollection = 'products';
const productSchema = mongoose.Schema({
    "id":{type:Number,
        index:true,
        unique:true},
    "title":String,
    "description":String,
    "price":Number,
    "thumbnail":String,
    "stock":{type:Number},
    "code":{type:String,index:true,unique:true},
    "category":String,
    "status":Boolean
})

export const productModel = mongoose.model(productCollection,productSchema)