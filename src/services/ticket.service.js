import {create as createTicket,getAll as getAllTickets,getOne,getByUser} from '../dao/mongo/ticket.mongo.js';
import { getPopulated } from '../dao/mongo/cart.mongo.js';
import {updateService as updateProduct} from '../services/product.service.js'
import {updateService as updateCart} from './cart.service.js'
import config from '../config/config.js';
import { randomInt } from 'crypto';

const persistance = config.persistance;

export const create = async (cartData) => {

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
            if (Cartproduct.product.stock <0) {Cartproduct.product.stock = 0 }
            purchasedProducts.push(Cartproduct.product);
            let result = updateProduct(Cartproduct.product.id,Cartproduct.product);
        }
        else {
            canceledProducts.push({"product":Cartproduct.product._id,"quantity":Cartproduct.quantity});
            canceledList.push(Cartproduct.product);
        }
    });


            let newTicket = {
                code: newCode,
                purchase_datetime: new Date().toLocaleString(),
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
    export const  getAll = async() => {
            const searchedCart = await getAllTickets();
            return searchedCart;
    }

    export const getByIdService = async(tid) => {
        const searchedCart = await getOne(tid);
        return searchedCart;
    }
    export const getByUserService = async(user) => {
        const searchedCart = await getByUser(user);
        return searchedCart;
    }