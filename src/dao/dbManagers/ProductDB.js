import {productModel} from '../models/product.model.js'

export const insert = async(product) => {
            let result = await productModel.create(product);
            return result;
    }

export const getAll = async() => {      
           let resultDB = await productModel.find();
           return resultDB;

    }

export const  paginate = async(tquery,params) => {
            let paginateResults = await productModel.paginate(tquery,params);
            return paginateResults;

    }

  export const getByIdModel = async(pid) => {    
           let resultDB = await productModel.find({_id:pid});
           return resultDB;
    }
  export const getByCode = async(pcode) => {    
           let resultDB = await productModel.find({code:pcode});
           return resultDB;
    }

  export const  update = async(pid,product) => {
        let updatedProduct = await productModel.replaceOne({id: pid}, product);
        return updatedProduct;
    }
export const deleteOne = async(id) => {
            let resultDB = await productModel.deleteOne({id: id});
            return resultDB;

    }

