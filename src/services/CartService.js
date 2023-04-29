import {create as createModel,getAll as getAllModel,getPopulated,getOne,addProductQuantity,empty,updateProducts} from '../dao/mongo/cart.mongo.js'
import {getByIdModel as getProduct,getBy_IdModel} from '../dao/mongo/product.mongo.js';
import config from '../config/config.js';
import cartDTO from './dto/cart.dto.js';

const persistance = config.persistance;
switch(persistance){
    case "MONGO":
        const { default:cartMongo} = await import('../dao/mongo/cart.mongo.js');
        break;
    case "FILE":
        const { default:fileMongo} = await import('../dao/file/cart.file.js');;
    default:
        break;
}
export const create = async (products) => {
            let newCart = {"products":products};
            let result =  await createModel(newCart);
            return result;
    }

    export const  getAll = async() => {
            const searchedCart = await getAllModel();
            return searchedCart;
    }

    export const PopulateService = async(cid) => {
        const searchedCart = await getPopulated(cid);
        return searchedCart;
    }

    export const getByIdService = async(cid) => {
        const searchedCart = await getOne({"_id":cid});
        return searchedCart;
    }


    // export const addProductService = async (cid,productId, quantity) => {
    //     const cartToUpdate = await getOne(cid);
    //     let productToAdd;
    //     let productos = cartToUpdate.products;

    //     getProduct(productId).then((productExist) => {
    //     if (productExist < 0) {
    //         return 4;
    //     }
    //     })
    //     const SearchedProductindex = productos.findIndex((prod)=> JSON.stringify(prod.product) == productId);
    //     if (SearchedProductindex < 0 ) {
    //     productToAdd = {product:productId, quantity:quantity};
    //     }
    //     else {
    //         let newQuantity = productos[SearchedProductindex].quantity + quantity;
    //         productToAdd = {product: productId, quantity: newQuantity};
    //         productos.splice(SearchedProductindex,1);
    //     }
    //     productos.push(productToAdd);
    //     console.log("cid,cartToUpdate",cid,cartToUpdate);
    //     let result = await addProductToCart(cid,cartToUpdate);
    //     if (result.modifiedCount != 1) {
    //         return 4;
    //     }
    //     return 1;
    // }

    export const addQuantityService = async (cid,productId, quantity) => {

        const cartToUpdate = await getByIdService(cid);
        if (cartToUpdate === "Cart not found"){ return "A cart with that id does not exist."}

        let productToAdd;
        let productos = cartToUpdate.products;

        const SearchedProductindex = productos.findIndex((prod)=> prod.product == productId);
        if (SearchedProductindex < 0 ) {
            const productexist = await getBy_IdModel(productId);
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

    export const deleteService = async (cid) => {
        let result = await empty(cid);
        if (result.modifiedCount != 1) {
            return 4;
        }
        return result;
    }

    export const updateService = async (cid,newprods) =>{
        let result = await updateProducts(cid,newprods);
        if (result.modifiedCount != 1) {
            return 4;
        }
        return result;
    }

    export const validate = (product) => {
        let validator = new cartDTO(product);
        let validatedCart = validator.formatted;
        return validatedCart;

    }
