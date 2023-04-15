import {cartModel} from '../models/cart.model.js'
import {productModel} from '../models/product.model.js'

export const create = async (products) => {
        try {
            let newCart = {"products":products};
            let result =  await cartModel.create(newCart);
            this.idIndex = this.idIndex + 1
            return result;
            
        } catch (error) {
            return error;
        }
    }

export const getAll = async() => {
        const searchedCart = await cartModel.find().populate('products.product');
        return searchedCart;
    }

export const getByIdDetailed = async(cid) => {
        const searchedCart = await cartModel.findOne({"_id":cid}).populate('products.product');
        if (!searchedCart || searchedCart.length == 0) {
            return 'Cart not found';
          }
        return searchedCart;
    }

export const getById = async(cid) => {
        const searchedCart = await cartModel.findOne({"_id":cid});
        if (!searchedCart || searchedCart.length == 0) {
            return 'Cart not found';
          }
        return searchedCart;
    }


export const addProduct = async (cid,productId, quantity) => {
        const cartToUpdate = await this.getById(cid);
        let productToAdd;
        let productos = cartToUpdate.products;

        manager.getByIdDB(productId).then((productExist) => {
        if (productExist < 0) {
            return 4;
        }
        })
        const SearchedProductindex = productos.findIndex((prod)=> prod.product == productId);
        if (SearchedProductindex < 0 ) {
        productToAdd = {product:productId, quantity:quantity};
        }
        else {
            let newQuantity = productos[SearchedProductindex].quantity + quantity;
            productToAdd = {product: productId, quantity: newQuantity};
            productos.splice(SearchedProductindex,1);
        }
        productos.push(productToAdd);

        let result = await cartModel.updateOne({id:cid},cartToUpdate);

        if (result.modifiedCount != 1) {
            return 4;
        }
        return 1;
    }

export const addQuantity = async (cid,productId, quantity) => {

        console.log("------------------------------------------");
        const cartToUpdate = await this.getById(cid);
        let productToAdd;
        let productos = cartToUpdate.products;

        const SearchedProductindex = productos.findIndex((prod)=> prod.product == productId);
        if (SearchedProductindex < 0 ) {
            const productexist = await productModel.findOne({_id:productId});
            if (!productexist) {
                return "An error ocurred with the id of the product to add";
            }
            productToAdd = {product: productId, quantity: quantity};
        }
        else {
            let newQuantity = productos[SearchedProductindex].quantity + quantity;
            productToAdd = {product: productId, quantity: newQuantity};
            productos.splice(SearchedProductindex,1);
        }
        if (productToAdd.quantity >= 1) {productos.push(productToAdd);}
        let result = await cartModel.updateOne({_id:cid},cartToUpdate);
        // let result = await cartModel.updateOne({id:cid},cartToUpdate);

        if (result.modifiedCount != 1) {
            return 4;
        }
        return 1;
    }

export const empty = async (cid) => {
        let result = await cartModel.updateOne({"_id": cid},{products:[]});
        return result;
    }

export const update = async (cid,newprods) =>{
        let result = await cartModel.updateOne({"_id": cid},{products:newprods});
        return result;
    }
