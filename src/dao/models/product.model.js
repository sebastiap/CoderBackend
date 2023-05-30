import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';

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
    "category":{type:String,
                enum:["Games","Clothing","Misc"],
                default:'Misc'},
    "owner":{type:String,
        default:'admin'},
    "status":Boolean
});

productSchema.plugin(mongoosePaginate);

export const productModel = mongoose.model(productCollection,productSchema)