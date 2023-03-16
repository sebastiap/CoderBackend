import { Router } from "express";
import CartManager from "../dao/dbManagers/CartManager.js";
import path from 'path';
import { fileURLToPath } from "url";

const router = Router();
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const manager = new CartManager(path.join(dirname,"../../data",'carrito.json'));

router.post('/',async (req, res) => {
    const cartProducts = req.body.products;
    // manager.createCart(cartProducts);
    manager.create(cartProducts);
    res.send({status: 'success',message: 'Cart added successfully'})
});
router.get('/:cid',async (req, res) => {
    const cartId = parseInt(req.params.cid);
    // let result = await manager.getCartById(cartId);
    let result = await manager.getById(cartId);
    if (result === 'Cart not found'){
        res.status(400).send({status: 'error',message: 'Cart not found'})
    }
    else {
        res.send(result);
    }
});
router.post('/:cid/product/:pid',async (req, res) => {
    const cartId = parseInt(req.params.cid);
    const ProductId = parseInt(req.params.pid);
    const quantity = parseInt(req.body.quantity);
    const result = await manager.addProduct(cartId,ProductId,quantity);
    if (result === "A cart with that id does not exist.") { res.send({status: 'error', message: 'A cart with that id does not exist.'}) }
    else {
        res.send({status: 'success',message: 'Product ' + ProductId + ' added successfully to cart ' + cartId + ''});
    };
});
    // DELETE api/carts/:cid/products/:pid deberá eliminar del carrito el producto seleccionado.
    router.delete('/:cid/products/:pid', async (req, res) => {
        const cartId = parseInt(req.params.cid);
        const productId = parseInt(req.params.pid);
        manager.getById(cartId).then((cart) => {
            let oldProducts = cart.products;
            let newProducts = oldProducts.filter((prod) => {prod.id !== productId});
            manager.update(cartId, newProducts).then((resupdate) => {
                res.send({status: 'success',message: 'The product with id ' + ProductId + ' was deleted successfully from cart ' + cartId + ''});
            });
        })

    });

    // PUT api/carts/:cid deberá actualizar el carrito con un arreglo de productos con el formato especificado arriba.
    router.put('/:cid', async (req, res) => {
        const cartId = parseInt(req.params.cid);
        const product = {};
        product.id = req.body.id;
        product.quantity = req.body.quantity;
        manager.getById(cartId).then((cart) => {
            let oldProducts = cart.products;
            let newProducts = oldProducts.filter((prod) => {prod.id !== productId});
            manager.update(cartId, newProducts).then((resupdate) => {
                res.send({status: 'success',message: 'The product with id ' + ProductId + ' was deleted successfully from cart ' + cartId + ''});
            });
        })
    });
    
    router.put('/:cid/products/:pid', async (req, res) => {
        //TODO VER SI ES IDEM al POST?
        const cartId = parseInt(req.params.cid);
        const ProductId = parseInt(req.params.pid);
        const quantity = parseInt(req.body.quantity);

        const result = await manager.addProductDB(cartId,ProductId,quantity);
        if (result === "A cart with that id does not exist.") { res.send({status: 'error', message: 'A cart with that id does not exist.'}) }
        else {
            res.send({status: 'success',message: 'Product ' + ProductId + ' added successfully to cart ' + cartId + ''});
        };
    
    });
    
    // DELETE api/carts/:cid deberá eliminar todos los productos del carrito
    router.delete('/:cid',async (req, res) => {
        const cartid = req.params.cid;
        const result = await manager.delete(cartid);
        if (result === "A cart with that id does not exist.") { res.send({status: 'error', message: 'A cart with that id does not exist.'}) }
        else {
        res.send({status: 'success',message: 'The cart with ' + cartid + 'is now empty.'});
        return result;
    }});
    

export default router;
