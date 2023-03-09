import {productModel} from '../models/product.model.js'

export default class ProductManager{
    constructor(path){
        this.maxid = 0;
        this.idIndex = 0 ;
        this.path = path;

    }

    add = async(product) => {
        try {
            if (!product.title || !product.description || !product.price || !product.status 
                || !product.category || !product.code || !product.stock)
                {
                return 2;
            }

            const existingProduct = await productModel.find({code:product.code});
            if (existingProduct.length > 0){
                return 1;
            }

            product.id = this.maxid + 1;

            let result = await productModel.create(product);
            this.maxid = product.id;
            return result;


        } catch (error) {
            console.error("Error al insertar en MongoDB:" , error);
            return 3;
        }

    }

    get = async() => {
        try{        
           let resultDB = await productModel.find();
           let max = Math.max(...resultDB.map(o => o.id));
           if (!max || max == null || max == -Infinity) {
            max = 0;
           }
           this.maxid = max;
           return resultDB;
        }
            catch(error){ 
                console.log("Error al consultar en MongoDB:" , error); 
        }

    }

    getByIdDB = async(pid) => {
        try{        
           let resultDB = await productModel.find({id:pid});
           return resultDB;
        }
            catch(error){ 
                console.log("Error al consultar en MongoDB:" , error); 
        }

    }

    update = async(pid,product) => {
        try {
        product.id = pid;
        let updatedProduct = await productModel.replaceOne({id: pid}, product);
        if (updatedProduct.modifiedCount != 1) {
            return 4;
        }
        return updatedProduct;
    } catch (error) {
        console.error("error", error);
            return 3;
    }

    }
    delete = async(id) => {
        try {
            let resultDB = await productModel.deleteOne({id: id});
            if (resultDB.deletedCount === 0){
                console.error('No existia un producto con ese id para ser borrado.');
                return 4;
            } 
            else{
                return 1;
            }
            return resultDB;
        } catch (error) {
            console.error('Error al borrar en MongoDB:');
        }

    }
    
    getFromSocket = async () => {
        try{        
            let prods = this.get().then((res) => {return res;});
            return prods;
        }
            catch(error){ 
                console.error("error:" , error); 
        }

    }
}
