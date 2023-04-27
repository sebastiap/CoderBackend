import mongoose from "mongoose";

const ticketCollection = 'ticket';
const ticketSchema = mongoose.Schema({
            code:{
                type:String,
                unique:true
            },
            purchase_datetime: Date,
            //  Deberá guardar la fecha y hora exacta en la cual se formalizó la compra (básicamente es un created_at)
            amount:Number,
            // total de la compra.
            purchaser:String
            // purchaser: String, contendrá el correo del usuario asociado al carrito.

    }
)

export const ticketModel = mongoose.model(ticketCollection,ticketSchema)