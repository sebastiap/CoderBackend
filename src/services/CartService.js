import {create as createModel,getAll as getAllModel,getPopulated,getOne,addProductToCart,addProductQuantity,empty,updateProducts} from '../dao/dbManagers/CartDB.js'
import {getByIdModel} from '../dao/dbManagers/ProductDB.js'
// TODOZ tienen que estar addProductQuantity y addProductToCart?
export default class CartManager {
    constructor(path){
        this.cart = {};
        this.idIndex = 0 ;
        this.path = path;
    }

    createService = async (products) => {
        try {
            let newCart = {"products":products};
            let result =  await createModel(newCart);
            this.idIndex = this.idIndex + 1
            return result;
            
        } catch (error) {
            return error;
        }
    }

    getAllService = async() => {
        const searchedCart = await getAllModel();
        return searchedCart;
    }

    getByIdDetailService = async(cid) => {
        this.cart = cid;
        const searchedCart = await getPopulated(cid);
        if (!searchedCart || searchedCart.length == 0) {
            return 'Cart not found';
          }
        return searchedCart;
    }

    getByIdService = async(cid) => {
        const searchedCart = await getOne({"_id":cid});
        if (!searchedCart || searchedCart.length == 0) {
            return 'Cart not found';
          }
        return searchedCart;
    }


    addProductService = async (cid,productId, quantity) => {
        const cartToUpdate = await this.getById(cid);
        let productToAdd;
        let productos = cartToUpdate.products;

        getByIdModel(productId).then((productExist) => {
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

        let result = await  addProductToCart(cid,cartToUpdate);

        if (result.modifiedCount != 1) {
            return 4;
        }
        return 1;
    }

    addQuantityService = async (cid,productId, quantity) => {

        const cartToUpdate = await this.getById(cid);
        let productToAdd;
        let productos = cartToUpdate.products;

        const SearchedProductindex = productos.findIndex((prod)=> prod.product == productId);
        if (SearchedProductindex < 0 ) {
            const productexist = await getByIdModel({_id:productId});
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
        let result = await addProductQuantity(cid,cartToUpdate);

        if (result.modifiedCount != 1) {
            return 4;
        }
        return 1;
    }

    deleteService = async (cid) => {
        let result = await empty(cid);
        return result;
    }

    updateService = async (cid,newprods) =>{
        let result = await updateProducts(cid,newprods);
        return result;
    }
}