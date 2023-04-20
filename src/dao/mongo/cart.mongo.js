import {cartModel} from '../models/cart.model.js'
import {productModel} from '../models/product.model.js'

export const create = async (cart) => {
        try {
            let result =  await cartModel.create(cart);
            return result;
            
        } catch (error) {
            return error;
        }
    }

export const getAll = async() => {
        const searchedCart = await cartModel.find().populate('products.product');
        return searchedCart;
    }

export const getPopulated = async(cid) => {
        const searchedCart = await cartModel.findOne({"_id":cid}).populate('products.product');
        return searchedCart;
    }

export const getOne = async(cid) => {
        const searchedCart = await cartModel.findOne({"_id":cid});
        return searchedCart;
    }

export const addProductQuantity = async (cid,cartToUpdate) => {
        let result = await cartModel.updateOne({_id:cid},cartToUpdate);
        return result;
    }

export const empty = async (cid) => {
        let result = await cartModel.updateMany({_id: cid},{products:[]});
        return result;
    }

export const updateProducts = async (cid,newprods) =>{
        let result = await cartModel.updateOne({_id: cid},{products:newprods});
        return result;
    }
  
