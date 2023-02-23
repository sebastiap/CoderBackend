import fs  from 'fs';
import {cartModel} from './dao/models/cart.model.js'

export default class CartManager {
    constructor(path){
        this.carts = [];
        this.idIndex = 0 ;
        this.path = path;
    }
    //Creo este metodo para no repetir codigo.
    getCarts = async () => {
        try{
            if (fs.existsSync(this.path)) {
            let data = await fs.promises.readFile(this.path,'utf-8');
            const carts = await JSON.parse(data);
            this.idIndex = carts[carts.length-1].id + 1
            this.carts = carts;
            return carts;
        }
        else {
            console.warn("El archivo no existia al momento de ejecucion.");
            return [];
        }
    }
        catch(error){ 
            console.log("error:" , error); 
    }

    }

    // Metodos de API FS
    // POST cart
    createCart = async (products) => {
        const allCarts = await this.getCarts();
        // const jsonProducts = JSON.parse(products);

        let newCart = {"id":this.idIndex, "products":products};
        console.log(newCart);
        allCarts.push(newCart);
        await fs.promises.writeFile(this.path,JSON.stringify(allCarts))
        // y si falla ? 
    }
    getCartById = async(cid) => {
        const allCarts = await this.getCarts();
        const SearchedCart = allCarts.find((cart)=> cart.id === cid);
        if (!SearchedCart) {
            console.error('Not found');
            return 'Cart not found';
          }
        return SearchedCart;
    }

    addProduct = async (cid,productId, quantity) => {
        const cartToUpdate = await this.getCartById(cid);
        // this.carts tiene la info de todos los carritos cuando lo llamo
        // desde getCarts, el cual es llamado por getCartById
        const allCarts = this.carts;
        let newQuantity = 1;
        let productToAdd = {};

        // Existe el carrito ?
        const SearchedCartindex = allCarts.findIndex((cart)=> cart.id === cid);
        if (SearchedCartindex < 0 ) {
            console.error('A cart with that id does not exist.');
            return 'A cart with that id does not exist.';
        }

        // Aca busco si existe el producto en el carrito
        const SearchedProductindex = cartToUpdate.products.findIndex((prod)=> prod.id === productId);
        
        //Si no existe el producto
        if (SearchedProductindex < 0 ) {
        newQuantity = quantity;
        productToAdd = {id: productId, quantity: newQuantity};
        
        }
        //Si existe el producto
        else {
            newQuantity = cartToUpdate.products[SearchedProductindex].quantity + quantity;
            productToAdd = {id: productId, quantity: newQuantity};
            // Borro para insertarlo nuevamente
            cartToUpdate.products.splice(SearchedProductindex,1);
        }
        // Sea como fuera actualizo el producto
        cartToUpdate.products.push(productToAdd);

        allCarts.splice(SearchedCartindex, 1);
        //pase lo que pase
        this.carts.push(cartToUpdate);

        await fs.promises.writeFile(this.path,JSON.stringify(allCarts));
        return 1;
    }

    // Metodos de MongoDB
    // POST cart
    createCartDB = async (products) => {
        try {
            console.log(this.idIndex);
            let newCart = {"id":this.idIndex, "products":products};
            let result =  await cartModel.create(newCart);
            this.idIndex = this.idIndex + 1
            return result;
            
        } catch (error) {
            return error;
        }
    }
    getCartByIdDB = async(cid) => {
        const searchedCart = await cartModel.find({id:cid});
        if (!searchedCart || searchedCart.length == 0) {
            // console.error('Not found');
            return 'Cart not found';
          }
        return searchedCart;
    }

    addProductDB = async (cid,productId, quantity) => {
        const cartToUpdate = await this.getCartByIdDB(cid);
        // this.carts tiene la info de todos los carritos cuando lo llamo
        // desde getCarts, el cual es llamado por getCartById
        console.log("cartToUpdate",cartToUpdate);

        // Aca busco si existe el producto en el carrito
        let productos = cartToUpdate[0].products;
        let productToAdd = {};
        console.log(productos);
        const SearchedProductindex = productos.findIndex((prod)=> prod.id === productId);
        
        //Si no existe el producto
        if (SearchedProductindex < 0 ) {
        productToAdd = {id: productId, quantity: quantity};
        
        }
        //Si existe el producto
        else {
            let newQuantity = productos[SearchedProductindex].quantity + quantity;
            productToAdd = {id: productId, quantity: newQuantity};
            // Borro para insertarlo nuevamente
            productos.splice(SearchedProductindex,1);
        }
        // Sea como fuera actualizo el producto
        productos.push(productToAdd);
        let result = await cartModel.updateOne({id:cid},{products:productos});

        if (result.modifiedCount != 1) {
            return 4;
        }
        console.log(result);
        return 1;
    }
}