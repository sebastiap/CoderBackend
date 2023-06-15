import { Router } from "express";
import ProductManager from "../../controllers/ProductManager.js";
import path from 'path';
import { fileURLToPath } from "url";

//Manejo de errores
import CustomError from "../../controllers/errors/ErrorManager.js";
import dictErrores from "../../controllers/errors/enums.js";
// Logger
import { customLogger } from "../../logger/logger.js";
import {generateduplicatedProductInfo,generateInvalidProductInfo,generateDatabaseErrorInfo,generateProdNotFoundInfo} from "../../controllers/errors/info.js";

import {transport} from "../../../app.js"
const router = Router();

// Se agrega esto para asegurarnos que corra donde corra este codigo
// se utilize el path relativo a donde este corriendo
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export const manager = new ProductManager(path.join(dirname,"../../data",'productos.json'));

router.get("/",async(req,res) =>{

    let limit = req.query.limit;
    let page = req.query.page;
    let sort = req.query.sort;
    let query = req.query.query;
    let fileproductos = await manager.get();
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
})

router.get('/:pid',async(req,res) =>{
    const producto = parseInt(req.params.pid);
    
    let SearchedProduct = await manager.getById(producto);
    if (!SearchedProduct){
        customLogger(req);
        req.logger.warning("No se encontro ningun producto con el id " + producto);
        let text = "No se encontro ningun producto con el id " + producto;
        res.send({error:{text}});
    
    }
    else {
       res.send(SearchedProduct);
    }
    
    
    });

router.post('/', async (req,res) => {
    const product = req.body;
try {
    let result = await manager.add(product);
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
});

router.put('/:pid', async (req,res) => {
    try {
    customLogger(req);
    const id = req.params.pid;
    const productToUpdate = req.body;
    let result = await manager.update(id,productToUpdate);
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
});

// TODOZ X Modificar el endpoint que elimina productos, para que, en caso de que el producto pertenezca a un usuario premium,
// le envíe un correo indicándole que el producto fue eliminado.
router.delete('/:pid', async (req,res)=> {
    try {
        
        customLogger(req);
        const id = parseInt(req.params.pid);
        let product = await manager.getById(id);
        let result = await manager.delete(id);
        console.log("LLEGUE ACA?");
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
            console.log("LLEGUE ACA??");
        //     if (product.owner !== "admin"){
        //         console.log("LLEGUE ACA???");
        //         let result2 = await transport.sendMail({
        //             from:"CoderNode",
        //             to:product.owner,
        //             subject:"Su Producto ha sido eliminado",
        //             html:`<div>
        //             <h1>Producto eliminado</h1>
        //             <p>Lamentamos informarle que su Producto ${product.title} ha sido eliminado por un administrador.</p>
        //             <img src="cid:Logo"/>
        //             <div>`,
        //             attachments:[{
        //                 filename:"SPIKAGAMES.png",
        //                 path:__dirname + "/src/public/img/SPIKAGAMES.png",
        //                 cid:"Logo"
        //             }]
        //         });
        // }

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

});

export default router;