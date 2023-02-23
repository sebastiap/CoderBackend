import { Router } from "express";
import CartManager from "../managers/CartManager.js";
import path from 'path';
import { fileURLToPath } from "url";

const router = Router();
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const manager = new CartManager(path.join(dirname,"../../data",'carrito.json'));

router.post('/',async (req, res) => {
    const cartProducts = req.body.products;
    // manager.createCart(cartProducts);
    manager.createCartDB(cartProducts);
    res.send({status: 'success',message: 'Cart added successfully'})
});
router.get('/:cid',async (req, res) => {
    const cartId = parseInt(req.params.cid);
    // let result = await manager.getCartById(cartId);
    let result = await manager.getCartByIdDB(cartId);
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
    // const result = await manager.addProduct(cartId,ProductId,1);
    const result = await manager.addProductDB(cartId,ProductId,quantity);
    if (result === "A cart with that id does not exist.") { res.send({status: 'error', message: 'A cart with that id does not exist.'}) }
    else {
        res.send({status: 'success',message: 'Product ' + ProductId + ' added successfully to cart ' + cartId + ''});
    }


});

export default router;
