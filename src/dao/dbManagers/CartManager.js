import {cartModel} from '../models/cart.model.js'
import {productModel} from '../models/product.model.js'
import ProductManager from './ProductManager.js';

let manager = new ProductManager();

export default class CartManager {
    constructor(path){
        this.carts = [];
        this.idIndex = 0 ;
        this.path = path;
    }

    create = async (products) => {
        try {
            let newCart = {"products":products};
            let result =  await cartModel.create(newCart);
            this.idIndex = this.idIndex + 1
            return result;
            
        } catch (error) {
            return error;
        }
    }

    getAll = async() => {
        const searchedCart = await cartModel.find().populate('products.product');
        return searchedCart;
    }

    getByIdDetailed = async(cid) => {
        const searchedCart = await cartModel.findOne({"_id":cid}).populate('products.product');
        if (!searchedCart || searchedCart.length == 0) {
            return 'Cart not found';
          }
        return searchedCart;
    }

    getById = async(cid) => {
        const searchedCart = await cartModel.findOne({"_id":cid});
        if (!searchedCart || searchedCart.length == 0) {
            return 'Cart not found';
          }
        return searchedCart;
    }


    addProduct = async (cid,productId, quantity) => {
        const cartToUpdate = await this.getById(cid);
        let productToAdd;
        let productos = cartToUpdate.products;
        // console.log("productId", productId);

        manager.getByIdDB(productId).then((productExist) => {
        // console.log("encontre algo?", productExist);
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

    addQuantity = async (cid,productId, quantity) => {

        console.log("------------------------------------------");
        // console.log(cid,productId, quantity);
        const cartToUpdate = await this.getById(cid);
        // console.log("Carro a actualizar" , cartToUpdate);
        let productToAdd;
        let productos = cartToUpdate.products;

        const SearchedProductindex = productos.findIndex((prod)=> prod.product == productId);
        // console.log("Producto a actualizar" , SearchedProductindex);
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
        // console.log("productToAdd",productToAdd);
        if (productToAdd.quantity >= 1) {productos.push(productToAdd);}
        let result = await cartModel.updateOne({id:cid},cartToUpdate);
        // console.log(result);

        if (result.modifiedCount != 1) {
            return 4;
        }
        return 1;
    }

    delete= async (cid) => {
        let result = await cartModel.updateOne({"_id": cid},{products:[]});
        return result;
    }

    update= async (cid,newprods) =>{
        let result = await cartModel.updateOne({"_id": cid},{products:newprods});
        return result;
    }
}