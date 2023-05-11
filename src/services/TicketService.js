import {create as createTicket,getAll as getAllTickets,getOne} from '../dao/mongo/ticket.mongo.js';
import { getPopulated } from '../dao/mongo/cart.mongo.js';
import {updateService as updateProduct} from '../services/ProductService.js'
import {updateService as updateCart} from '../services/CartService.js'
import config from '../config/config.js';
import { randomInt } from 'crypto';

//Patron Factory
const persistance = config.persistance;
// switch(persistance){
//     case "MONGO":
//         const { default:cartMongo} = await import('../dao/mongo/ticket.mongo.js');
//         break;
//     case "FILE":
//         const { default:fileMongo} = await import('../dao/file/ticket.file.js');;
//     default:
//         break;
// }
export const create = async (cartData) => {

    // const cartData = {purchaser:req.session.user.email,cartid:cartid,stock:stock}
    let newCode = "1";
    newCode= "C" + randomInt(999999);
    let total = 0;
    const cart = await getPopulated(cartData.cartid);
    let purchasedProducts = [];
    let canceledProducts = [];
    let canceledList = [];

    cart.products.forEach(Cartproduct => {
        if (Cartproduct.product.stock >= Cartproduct.quantity) {
            total += Cartproduct.quantity * Cartproduct.product.price;
            Cartproduct.product.stock -= Cartproduct.quantity;
            // SERIA UN ERROR, PROBAR
            if (Cartproduct.product.stock <0) {Cartproduct.product.stock = 0 }
            purchasedProducts.push(Cartproduct.product);
            let result = updateProduct(Cartproduct.product.id,Cartproduct.product);
        }
        else {
            // {"product":"640efafa130d57a081c9cfda","quantity":1 }
            canceledProducts.push({"product":Cartproduct.product._id,"quantity":Cartproduct.quantity});
            canceledList.push(Cartproduct.product);
        }
    });


            let newTicket = {
                code: newCode,
                purchase_datetime: new Date().toLocaleString(),
                //  Deberá guardar la fecha y hora exacta en la cual se formalizó la compra (básicamente es un created_at) moment?
                amount:total,
                purchaser:cartData.purchaser
            };
            let resultFinal = {ticketData:newTicket, canceledList:canceledList};
            if (purchasedProducts.length > 0) {
                let resultT =  await createTicket(newTicket);
                let resultU =  await updateCart(cartData.cartid,canceledProducts);
                return resultFinal;
            }
            else
            {
                return "No pudo realizarse la compra, ningun producto de los su carro posee stock."
            }

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