// import {create as createModel,getAll as getAllModel,getPopulated,getOne,addProductToCart,addProductQuantity,empty,updateProducts} from '../dao/dbManagers/CartDB.js'
// import {getByIdModel as getProduct,getBy_IdModel} from '../dao/dbManagers/ProductDB.js'

import { create as createService,getAll as getAllService,PopulateService,getByIdService,addProductService,addQuantityService,updateService,deleteService} from "../services/CartService.js";

// TODOZ tienen que estar addProductQuantity y addProductToCart?
export default class CartManager {
    constructor(path){
        this.cart = {};
        this.idIndex = 0 ;
        this.path = path;
    }

    create = async (products) => {
        try {
            let result =  await createService(products);
            this.idIndex = this.idIndex + 1
            return result;
            
        } catch (error) {
            return error;
        }
    }

    getAll = async() => {
        try {
            const searchedCart = await getAllService();
            return searchedCart;
        } catch (error) {
              return error;
        }

    }

    getByIdDetailed = async(cid) => {
        this.cart = cid;
        const searchedCart = await PopulateService(cid);
        if (!searchedCart || searchedCart.length == 0) {
            return 'Cart not found';
          }
        return searchedCart;
    }

    getById = async(cid) => {
        const searchedCart = await getByIdService(cid);
        if (!searchedCart || searchedCart.length == 0) {
            return 'Cart not found';
          }
        return searchedCart;
    }


    addProduct = async (cid,productId, quantity) => {

        try {
            const result = addProductService(cid,productId, quantity);
            if (result == 1) {return "Product does not exist"}
            if (result == 2) {}
            if (result == 3) {return "Product does not exist"}
            if (result == 4) {return "Cart was not updated"}
        } catch (error) {
            console.log(error);
        }
    }

    addQuantity = async (cid,productId, quantity) => {
        try {
            const result = addQuantityService(cid,productId, quantity);
            return result;
        } catch (error) {
            console.log(error);
        }

    }

    delete= async (cid) => {
        let result = await deleteService(cid);
        return result;
    }

    update= async (cid,newprods) =>{
        let result = await updateService(cid,newprods);
        return result;
    }
}