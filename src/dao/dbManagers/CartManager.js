import {cartModel} from '../models/cart.model.js'

export default class CartManager {
    constructor(path){
        this.carts = [];
        this.idIndex = 0 ;
        this.path = path;
    }

    create = async (products) => {
        try {
            let newCart = {"id":this.idIndex, "products":products};
            let result =  await cartModel.create(newCart);
            this.idIndex = this.idIndex + 1
            return result;
            
        } catch (error) {
            return error;
        }
    }
    getById = async(cid) => {
        const searchedCart = await cartModel.find({id:cid});
        if (!searchedCart || searchedCart.length == 0) {
            return 'Cart not found';
          }
        return searchedCart;
    }

    addProduct = async (cid,productId, quantity) => {
        const cartToUpdate = await this.getById(cid);
        let productos = cartToUpdate[0].products;
        let productToAdd = {};
        const SearchedProductindex = productos.findIndex((prod)=> prod.id === productId);

        if (SearchedProductindex < 0 ) {
        productToAdd = {id: productId, quantity: quantity};
        
        }
        else {
            let newQuantity = productos[SearchedProductindex].quantity + quantity;
            productToAdd = {id: productId, quantity: newQuantity};
            productos.splice(SearchedProductindex,1);
        }
        productos.push(productToAdd);
        let result = await cartModel.updateOne({id:cid},{products:productos});

        if (result.modifiedCount != 1) {
            return 4;
        }
        return 1;
    }

    delete= async (cid) => {
        let result = await cartModel.updateOne({"id": cid},{products:[]});
        return result;
    }

    update= async (cid,newprods) =>{
        let result = await cartModel.updateOne({"id": cid},{products:newprods});
        return result;
    }
}