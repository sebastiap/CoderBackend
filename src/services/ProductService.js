import { insert,getAll,getByIdModel,update as updateModel,deleteOne as deleteModel,paginate,getByCode,getByUserModel } from "../dao/mongo/product.mongo.js";



export const addService = async(product) => {
            let result = await insert(product);
            return result;
    }

    export const getService = async() => {
           let resultDB = await getAll();
           return resultDB;
    }

    export const getPaginatedService = async(tquery,params) => {
           let paginateResults = await paginate(tquery,params);
           return paginateResults;

    }

    export const  getByIdService = async(pid) => {    
           let resultDB = await getByIdModel(pid);
           return resultDB;
    }
    export const  getByUserService = async(email) => {    
           let resultDB = await getByUserModel(email);
           return resultDB;
    }

    export const  getByCodeService = async(code) => {    
        let resultDB = await getByCode(code);
        return resultDB;
 }

    export const updateService = async(pid,product) => {
        product.id = pid;
        let updatedProduct = await updateModel(pid, product);
        return updatedProduct;
    }

    export const deleteService = async(id) => {
            let resultDB = await deleteModel(id);
            return resultDB;
    }

