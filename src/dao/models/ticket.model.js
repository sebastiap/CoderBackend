import mongoose from "mongoose";

const ticketCollection = 'ticket';
const ticketSchema = mongoose.Schema({
            code:{
                type:String,
                unique:true
            },
            purchase_datetime: Date,
            amount:Number,
            purchaser:String

    }
)

export const ticketModel = mongoose.model(ticketCollection,ticketSchema)