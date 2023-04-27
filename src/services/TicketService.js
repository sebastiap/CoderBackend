import {create as createTicket,getAll as getAllTickets,getOne} from '../dao/mongo/ticket.mongo.js';
import { getPopulated } from '../dao/mongo/cart.mongo.js';
import {updateService as updateProduct} from '../services/ProductService.js'
import config from '../config/config.js';
import { randomInt } from 'crypto';

//Patron Factory
const persistance = config.persistance;
switch(persistance){
    case "MONGO":
        const { default:cartMongo} = await import('../dao/mongo/ticket.mongo.js');
        break;
    case "FILE":
        const { default:fileMongo} = await import('../dao/file/ticket.file.js');;
    default:
        break;
}
export const create = async (cartData) => {

    // const cartData = {purchaser:req.session.user.email,cartid:cartid,stock:stock}
    let newCode = "";
    newCode= String(randomInt());
    
    let total = 0;
    const cart = await getPopulated(cartData.cartid);
    let purchasedProducts = [];
    let canceledProducts = [];

    cart.array.forEach(Cartproduct => {
        if (Cartproduct.product.stock < Cartproduct.quantity) {
            total += Cartproduct.quantity;
            Cartproduct.product.stock -= Cartproduct.quantity;
            purchasedProducts.push(Cartproduct.product);
            let result = updateProduct(Cartproduct.product.id,Cartproduct.product);
            // restar producto
        }
        else {
            canceledProducts.push(Cartproduct.product);
        }
    });


            let newTicket = {
                code: newCode,
                purchase_datetime: new Date().toLocaleString(),
                //  Deberá guardar la fecha y hora exacta en la cual se formalizó la compra (básicamente es un created_at) moment?
                amount:total,
                purchaser:cartData.purchaser
            };
            let result =  await createTicket(newTicket);
            return result;
    }
// TODOZ ver si se usan
    export const  getAll = async() => {
            const searchedCart = await getAllTickets();
            return searchedCart;
    }

    export const getByIdService = async(cid) => {
        const searchedCart = await getOne({"_id":cid});
        return searchedCart;
    }