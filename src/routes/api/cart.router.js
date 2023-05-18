import { Router } from "express";
import CartManager from "../../controllers/CartManager.js";
import {create as createTicket} from "../../services/TicketService.js"
import path from 'path';
import { fileURLToPath } from "url";
import config from "../../config/config.js"

import errorDictionary from "../../controllers/errors/enums.js";
import CustomError from "../../controllers/errors/ErrorManager.js";
import { customLogger } from "../../logger/logger.js";
import {generateCartNotFoundInfo} from "../../controllers/errors/info.js";

const router = Router();
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const manager = new CartManager(path.join(dirname,"../../data",'carrito.json'));

router.post('/',async (req, res) => {
    const cartProducts = req.body.products;
    manager.create(cartProducts);
    customLogger(req);
    req.logger.info('Cart added successfully');
    res.send({status: 'success',message: 'Cart added successfully'});
});

router.get('/',async (req, res) => {
    let result = await manager.getAll();
    res.send(result);
})

router.get('/:cid',async (req, res) => {
    const cartId = req.params.cid;
    let result = await manager.getByIdDetailed(cartId);

    if (result === 'Cart not found'){
        customLogger(req);
        req.logger.error('Cart not found');
        res.status(400).send({status: 'error',message: 'Cart not found'})
    }
    else {
        res.send(result);
    }
});
// POST - Agrega un solo producto
router.post('/:cid/product/:pid',async (req, res) => {
    const cartId = req.params.cid;
    const ProductId = req.params.pid;
    const quantity = parseInt(req.body.quantity);
    const result = await manager.addProduct(cartId,ProductId,quantity); 

try {

    if (result === errorDictionary.CART_NOT_FOUND) { 
        throw CustomError.createError({
            name: 'CART NOT FOUND',
            cause: generateCartNotFoundInfo(),
            message: 'A cart with that id does not exist.',
            code:errorDictionary.CART_NOT_FOUND
            });
     }
    if (result === "A cart with that id does not exist.") { res.send({status: 'error', message: 'A cart with that id does not exist.'}) }
    if (result === "Product does not exist") { res.send({status: 'error', message: "Product does not exist"}) }
    if (result === "Some error occurred while updating.") { res.send({status: 'error', message: "Some error occurred while updating."}) }
    else {
        res.send({status: 'success',message: 'Product ' + ProductId + ' added successfully to cart ' + cartId + ''});
    };

        
} catch (error) {
    customLogger(req);
    req.logger.error(error.cause);
        res.status(400).send({
            status:"error",
            error:error.name,
            message:error.cause,
            code:error.code
        });

    }
});
// DELETE api/carts/:cid/products/:pid deberá eliminar del carrito el producto seleccionado.
router.delete('/:cid/products/:pid', async (req, res) => {
        const cartId = req.params.cid;
        let productId = req.params.pid;
        if (typeof(productId) != String ) {
        //     productId = JSON.stringify(productId);
        }
        manager.getById(cartId).then((cart) => {
            let oldProducts = cart.products;
            let newProducts = oldProducts.filter((prod) => prod.product != productId);
            manager.update(cartId, newProducts).then((resupdate) => {
                if (resupdate.modifiedCount >= 1){
                    customLogger(req);
                    req.logger.info('The product with id ' + productId + ' was deleted successfully from cart ' + cartId + '.');
                    res.send({status: 'success',message: 'The product with id ' + productId + ' was deleted successfully from cart ' + cartId + '.'}); 
                }
                else {
                    customLogger(req);
                    req.logger.error("No product with that id was deleted");
                    res.send({status: 'error',message:"No product with that id was deleted" })}
            });
        })

});

// PUT api/carts/:cid deberá actualizar el carrito con un arreglo de productos con el formato especificado arriba.
router.put('/:cid', async (req, res) => {
        const cartId = req.params.cid;
        const products = req.body;
        manager.update(cartId,products).then((cart) => {
            customLogger(req);
            req.logger.info('The cart with id ' + cartId + ' was updated successfully with the required products.');
            res.send({status: 'success',message: 'The cart with id ' + cartId + ' was updated successfully with the required products.'});
            });
        });
    
 router.put('/:cid/products/:pid', async (req, res) => {
    const cartId = req.params.cid;
    const ProductId = req.params.pid;
    const quantity = parseInt(req.body.quantity);
        const result = await manager.addQuantity(cartId,ProductId,quantity);
        customLogger(req);
        if (result === "A cart with that id does not exist.") { 
            req.logger.error('A cart with that id does not exist.');
            res.send({status: 'error', message: 'A cart with that id does not exist.'}) }
        else if (result === "An error ocurred with the id of the product to add.") { 
            req.logger.error('An error ocurred with the id of the product to add.');
            res.send({status: 'error', message: 'An error ocurred with the id of the product to add.'}) }
        else {
            req.logger.info('Product ' + ProductId + ' added successfully to cart ' + cartId + '.');
            res.send({status: 'success',message: 'Product ' + ProductId + ' added successfully to cart ' + cartId + '.'});
        };
    
    });
    
router.delete('/:cid',async (req, res) => {
        const cartid = req.params.cid;
        const result = await manager.delete(cartid);
        customLogger(req);
        if (result === "A cart with that id does not exist.") { 
            req.logger.error('A cart with that id does not exist.');
            res.send({status: 'error', message: 'A cart with that id does not exist.'}) }
        else if (result === "The Cart id is invalid") { 
            req.logger.error('The Cart id is invalid.');
            res.send({status: 'error', message: 'The Cart id is invalid.'}) }
        else {
        req.logger.info('The cart with id ' + cartid + ' is now empty.');
        res.send({status: 'success',message: 'The cart with id ' + cartid + ' is now empty.'});
        return result;
}});

router.get('/:cid/purchase',async (req, res) => {
    const cartid = req.params.cid;
    let user = ""
    if (req.session.user == undefined) {
        user = "POSTMAN"
    } 
    else {
        user = req.session.user.email; 
    }
    const cartData = {purchaser:user,cartid:cartid};
    const result = await createTicket(cartData);
    customLogger(req);
    if (result === "No pudo realizarse la compra, ningun producto de los su carro posee stock.") { 
        
        req.logger.warning("No pudo realizarse la compra, ningun producto de los su carro posee stock.");
        res.send({status: 'error', message: "No pudo realizarse la compra, ningun producto de los su carro posee stock."}) }
    // else if (result === "The Cart id is invalid") { res.send({status: 'error', message: 'The Cart id is invalid.'}) }
    else {
        let productos = result.canceledList.map(prod => 
            ({title: prod.title,description: prod.description,price: prod.price,thumbnail:prod.thumbnail,stock:prod.stock,
                code: prod.code,category: prod.category,id:prod.id,status:prod.status}));
        let ticketData = result.ticketData;
        req.logger.info("Compra exitosa!");
        if (productos.length > 0){
        req.logger.warning("Productos que no pudieron ser comprados : "+ productos.length ); 
        }
        res.render('purchase',{title:"Compra Exitosa!",port:config.port,cart:cartid,left:productos,ticketData,style:"styles.css"})
    // res.send({status: 'success',message: 'The purchase was successful.'});
    }
    return result;
});

export default router;
