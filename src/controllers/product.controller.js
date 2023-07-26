import {addService,getService,getByIdService,getByCodeService,getByUserService,getPaginatedService,updateService,deleteService} from "../services/product.service.js";
import { customLogger } from "../logger/logger.js";
import { validarURL } from "../../utils.js";
import config from "../config/config.js" 

import CustomError from "../controllers/errors/error.controller.js";
import dictErrores from "../controllers/errors/enums.js";
import {generateduplicatedProductInfo,generateInvalidProductInfo,generateDatabaseErrorInfo,generateProdNotFoundInfo} from "../controllers/errors/info.js";

import {transport} from "../../app.js"

export default class ProductController{
    constructor(path){
        this.maxid = 0;
        this.idIndex = 0 ;
        this.path = path;
    }

    getApi = async(req,res) =>{

        let limit = req.query.limit;
        let page = req.query.page;
        let sort = req.query.sort;
        let query = req.query.query;
        let fileproductos = await getService();;
        if (!limit){
            limit = 10;
        }
        if (!page){
            page = 10;
        }
        if (!query){
            query = {};
        }
        if (!sort){
            sort = {};
        }
        
    
        fileproductos = fileproductos.slice(0, limit);
        res.send(fileproductos);
    };

    getByIdApi = async(req,res) =>{
        const producto = parseInt(req.params.pid);
        
        let SearchedProduct = await getByIdService(producto);
        if (!SearchedProduct){
            customLogger(req);
            req.logger.warning("No se encontro ningun producto con el id " + producto);
            let text = "No se encontro ningun producto con el id " + producto;
            res.send({error:{text}});
        
        }
        else {
           res.send(SearchedProduct);
        }
        
        
        }
    
    postProduct = async (req,res) => {
        const product = req.body;
    try {
        let result = await this.add(product);
        customLogger(req);
        if (result === dictErrores.PRODUCT_CODE_DUPLICATED){
            req.logger.error("The code is already in use by another Product");
            throw CustomError.createError({
            name: 'Duplicate Product',
            cause: generateduplicatedProductInfo(),
            message: 'The code is already in use by another Product',
            code:dictErrores.PRODUCT_CODE_DUPLICATED
            });
            // res.status(400).send({status:'error', message:'The code is already in used in another Product'});
        }
        else if (result === dictErrores.PRODUCT_INCOMPLETE){
            req.logger.error("A required field of the product you wish to enter is empty or was not sent.");
            throw CustomError.createError({
                name: 'Incomplete Product',
                cause: generateInvalidProductInfo(),
                message: 'A required field of the product you wish to enter is empty or was not sent.',
                code:dictErrores.PRODUCT_INCOMPLETE
                });
            // res.status(400).send({status:'error', message:'A required field of the product you wish to enter is empty or was not sent.'});
            }
        else if (result === dictErrores.DATABASE_ERROR) {
            req.logger.error("An error ocurred while trying to use the database. Please try again later.");
            throw CustomError.createError({
                name: 'Database Error',
                cause: generateDatabaseErrorInfo(),
                message: 'An error ocurred while trying to use the database. Please try again later.',
                code:dictErrores.DATABASE_ERROR
                });
            // res.status(400).send({status:'error', message:'Some error occurred'});
        }
        else {
            req.logger.info('A new product with code ' + product.code + ' was successfully created with id ' + product.id);
            res.send({status: 'success', message:'A new product with code ' + product.code + ' was successfully created with id ' + product.id,newId:product.id });
        }
    } 
        catch (error) {
            req.logger.error(error.cause);
            res.status(400).send({
                status:"error",
                error:error.name,
                message:error.cause,
                code:error.code
            });
        }
    }

    putProduct = async (req,res) => {
        try {
        customLogger(req);
        const id = req.params.pid;
        const productToUpdate = req.body;
        let result = await this.update(id,productToUpdate);
        // if (result === 2){
        //     res.status(400).send({status:'error', message:'A required field of the product you wish to enter is empty or was not sent.'});
        //     }
        if (result === dictErrores.PRODUCT_INCOMPLETE){
            req.logger.error('A required field of the product you wish to enter is empty or was not sent.');
            throw CustomError.createError({
                name: 'Incomplete Product',
                cause: generateInvalidProductInfo(),
                message: 'A required field of the product you wish to enter is empty or was not sent.',
                code:dictErrores.PRODUCT_INCOMPLETE
                });
            // res.status(400).send({status:'error', message:'A required field of the product you wish to enter is empty or was not sent.'});
            }
        else if (result === dictErrores.DATABASE_ERROR) {
                req.logger.fatal('An error ocurred while trying to use the database. Please try again later.');
                throw CustomError.createError({
                    name: 'Database Error',
                    cause: generateDatabaseErrorInfo(),
                    message: 'An error ocurred while trying to use the database. Please try again later.',
                    code:dictErrores.DATABASE_ERROR
                    });
                // res.status(400).send({status:'error', message:'Some error occurred'});
            }
        // else if (result === 4) {
        //     res.status(400).send({status:'error', message:'A product with the specified id was not found'});
        // }
        else if (result === dictErrores.PRODUCT_NOT_FOUND) {
            req.logger.error('A product with the specified id was not found.');
            throw CustomError.createError({
                name: 'Product Not Found',
                cause: generateProdNotFoundInfo(),
                message: 'A product with the specified id was not found.',
                code:dictErrores.PRODUCT_NOT_FOUND
                });
            // res.status(400).send({status:'error', message:'Some error occurred'});
        }
        else {    
            req.logger.info('Product with the specified id was successfully updated');
            res.send({status: 'success',message: 'Product with the specified id was successfully updated'});
        }
    } 
    catch (error) {
        res.status(400).send({
            status:"error",
            error:error.name,
            message:error.cause,
            code:error.code
        });
    }
    }
    deleteApi = async (req,res)=> {
        try {
            customLogger(req);
            const id = parseInt(req.params.pid);
            let product = await this.getById(id);
            let result = await this.delete(id);
            if (result === dictErrores.PRODUCT_NOT_FOUND) {
                req.logger.error('A product with the specified id was not found.')
                throw CustomError.createError({
                    name: 'Product Not Found',
                    cause: generateProdNotFoundInfo(),
                    message: 'A product with the specified id was not found.',
                    code:dictErrores.PRODUCT_NOT_FOUND
                    });
            }
            else{
                if (product[0].owner !== "admin"){
                    let result2 = await transport.sendMail({
                        from:"CoderNode",
                        to:product[0].owner,
                        subject:"Su Producto ha sido eliminado",
                        html:`<div>
                        <h1>Producto eliminado</h1>
                        <p>Lamentamos informarle que su Producto ${product.title} ha sido eliminado por un administrador.</p>
                        <img src="cid:Logo"/>
                        <div>`,
                        attachments:[{
                            filename:"SPIKAGAMES.png",
                            path:__dirname + "/src/public/img/SPIKAGAMES.png",
                            cid:"Logo"
                        }]
                    });
            }
                req.logger.info('Product with the specified id was successfully deleted');
                res.send({status: 'success', message: 'Product with the specified id was successfully deleted'});
            }
    } 
    catch (error) {
        res.status(400).send({
            status:"error",
            error:error.name,
            message:error.cause,
            code:error.code
        });
        req.logger.error(error);
    }
    
    }

    isValid = (product) => {
        let value = true;
        if (!product.title || !product.description || !product.price 
            || !product.category || !product.code )
            {value = false}
        return value;
    }

    add = async(product) => {
        try {
            if (this.maxid === 0){
                await this.get();
            }
            if (!product.title || !product.description || !product.price 
                || !product.status || !product.stock
                || !product.category || !product.code 
                || product.title === undefined|| product.description === undefined || product.price === undefined
                || product.stock === undefined
                || product.code === undefined
                )
                { return 2; }

            const existingProduct = await getByCodeService(product.code);
            if (existingProduct.length > 0){
                return 1;
            }

            product.id = this.maxid + 1;

            let result = await addService(product);
            this.maxid = product.id;
            return result;


        } catch (error) {
            customLogger(req);
            req.logger.error(error);
            return 3;
        }

    }

    get = async() => {
        
        try{        
           let resultDB = await getService();
           let max = Math.max(...resultDB.map(o => o.id));
           if (!max || max == null || max == -Infinity) {
            max = 0;
           }
           this.maxid = max;
           return resultDB;
        }
            catch(error){ 
                customLogger(req);
                req.logger.error(error);
        }

    }

    getPaginated = async(reqq) => {
        const { limit = 10, page = 1, query , sort } = reqq
        let tquery = {};
        let urlquery = "";
        let tsort = {};
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
                    customLogger(req);
                    req.logger.error('Some error ocurred or the query is not valid');
                    status = false;
                    tquery = "";
                    payload = "Error";
                }
            }
           let params = {limit:limit,page:page,sort:tsort};
           let paginateResults = await getPaginatedService(tquery,params);
           
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
                customLogger(req);
                req.logger.error("Error al consultar en MongoDB:", error);
        }

    }

    getById = async(pid) => {
        try{       
           let resultDB = await getByIdService(pid);
           return resultDB;
        }
            catch(error){ 
                customLogger(req);
                req.logger.error("Error al consultar en MongoDB:" , error);
        }

    }
    getByUser = async(email) => {
        try{       
           let resultDB = await getByUserService(email);
           return resultDB;
        }
            catch(error){ 
                customLogger(req);
                req.logger.error("Error al consultar en MongoDB:" , error);
        }

    }

    update = async(pid,product) => {
        try {
        product.id = pid;
        if (!this.isValid )
        { return 2; }
        let updatedProduct = await updateService(pid, product);
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
            let resultDB = await deleteService(id);
            if (resultDB.deletedCount === 0){
                console.error('No existia un producto con ese id para ser borrado.');
                return 4;
            } 
            else{
                return 1;
            }
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

    renderPage = async(req,res) =>{


        let { limit = 10, page = 1, query , sort } = req.query
        let productosDB = await this.getPaginated(req.query);
        let productosFormated = validarURL(productosDB.payload.map(prod => ({title: prod.title,description: prod.description,price: prod.price,thumbnail:prod.thumbnail,stock:prod.stock,code: prod.code,category: prod.category,id:prod.id,status: prod.status})));
        let prev = 0;
        currentCart = req.session.user.cart;
        if (productosDB.hasPrevPage){
            prev = productosDB.prevPage;
        }
        let next = 0;
        if (productosDB.hasNextPage){
            next = productosDB.nextPage;
        }
        let cart = req.session.user.cart;
        let productos = productosFormated.map(prod => 
            ({title: prod.title,description: prod.description,price: prod.price,thumbnail:prod.thumbnail,stock:prod.stock,
                code: prod.code,category: prod.category,id:prod.id,status:prod.status}));
        let pageConfig = {page:page, query: query, prev:prev,next:next,cart:cart ,nextLink:productosDB.nextLink, prevLink:productosDB.prevLink};
        const premium = (req.session.user.role == "premium");
        res.render('products',{title:"Nuestros Productos",host:config.localhost,port:config.port,productos,pageConfig,user:req.session.user,cart:cart,premium,style:"styles.css"});
    }
}
