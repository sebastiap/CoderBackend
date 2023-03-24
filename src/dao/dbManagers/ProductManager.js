import {productModel} from '../models/product.model.js'

export default class ProductManager{
    constructor(path){
        this.maxid = 0;
        this.idIndex = 0 ;
        this.path = path;

    }

    add = async(product) => {
        try {
            // TODO ver si esto arregla el error al iniciar
            if (this.maxid === 0){
                this.get();
            }
            if (!product.title || !product.description || !product.price 
                // || !product.status || !product.stock
                || !product.category || !product.code )
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

    getPaginated = async(reqq) => {
        const { limit = 10, page = 1, query , sort } = reqq
        let tquery = {};
        let urlquery = "";
        let tsort = {};
        let payload = [];
        let status = true;

        try{        
            if (sort == undefined ) {
                tsort =  {};
            }
            if (sort && (sort.toUpperCase() == 'ASC' || sort.toUpperCase() == 'DESC')){
                tsort = { price: sort.toUpperCase()};
            }
            

            if (query != undefined ) {
                if(query == "Games" || query == "Clothing"|| query == "Misc") {
                    tquery = { category: query };
                    urlquery = query;
                }
                else if (query == "true" || query == "false"){
                    tquery = {$or:[{status: query},{ stock:0}]};
                    urlquery = query;
                }
                else if (!query || query === undefined) {
                     tquery = "";
                     urlquery = "";
                }
                else{
                    console.log('Some error ocurred or the query is not valid');
                    status = false;
                    tquery = "";
                    payload = "Error";
                }
            }
           let paginateResults = await productModel.paginate(tquery,{limit:limit,page:page,sort:tsort});
           
           let prevLink = `?page=${paginateResults.prevPage}&query=${urlquery}&sort=${JSON.stringify(tsort)}`;
           let nextLink = `?page=${paginateResults.nextPage}&query=${urlquery}&sort=${JSON.stringify(tsort)}`;
 
           return {
                status:status, payload:paginateResults.docs,  
                totalPages: paginateResults.totalPages, 
                prevPage: paginateResults.prevPage,
                nextPage: paginateResults.nextPage,
                page: paginateResults.totalPages,
                hasPrevPage: paginateResults.hasPrevPage,
                hasNextPage: paginateResults.hasNextPage,
                prevLink: prevLink,
                nextLink: nextLink,
        }
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
