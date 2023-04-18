import { Router } from "express";
import ProductManager from "../../controllers/ProductManager.js";
import path from 'path';
import { fileURLToPath } from "url";
import config from "../../config/config.js" 

import { privateAccess } from "../../../utils.js";

// utilizo router para redireccionar y organizar mis llamadas.
const router = Router();

// Se agrega esto para asegurarnos que corra donde corra este codigo
// se utilize el path relativo a donde este corriendo
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export const manager = new ProductManager(path.join(dirname,"../../data",'productos.json'));

router.get("/",privateAccess,async(req,res) =>{


    let { limit = 10, page = 1, query , sort } = req.query
    let productosDB = await manager.getPaginated(req.query);
    let productosFormated = productosDB.payload;

    let prev = 0;
    if (productosDB.hasPrevPage){
        prev = productosDB.prevPage;
    }
    let next = 0;
    if (productosDB.hasNextPage){
        next = productosDB.nextPage;
    }
    // let cart = '64135d02acdf495d33f1a229';
    let cart = req.session.user.cart;
    let productos = productosFormated.map(prod => 
        ({title: prod.title,description: prod.description,price: prod.price,thumbnail:prod.thumbnail,stock:prod.stock,
            code: prod.code,category: prod.category,id:prod.id,status:prod.status}));
    let pageConfig = {page:page, query: query, prev:prev,next:next,cart:cart ,nextLink:productosDB.nextLink, prevLink:productosDB.prevLink};
    
    res.render('products',{productos,pageConfig,user:req.session.user,cart:cart,port:config.port,style:"styles.css"});
})


export default router;