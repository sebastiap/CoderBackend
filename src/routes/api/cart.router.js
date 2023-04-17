import { Router } from "express";
import CartManager from "../../controllers/CartManager.js";
import path from 'path';
import { fileURLToPath } from "url";

const router = Router();
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const manager = new CartManager(path.join(dirname,"../../data",'carrito.json'));

router.post('/',async (req, res) => {
    const cartProducts = req.body.products;
    manager.create(cartProducts);
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
    if (result === "A cart with that id does not exist.") { res.send({status: 'error', message: 'A cart with that id does not exist.'}) }
    else {
        res.send({status: 'success',message: 'Product ' + ProductId + ' added successfully to cart ' + cartId + ''});
    };
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
            let newProducts = oldProducts.filter((prod) => JSON.stringify(prod.product) != String(productId));
            manager.update(cartId, newProducts).then((resupdate) => {
                if (resupdate.modifiedCount >= 1){
                    res.send({status: 'success',message: 'The product with id ' + productId + ' was deleted successfully from cart ' + cartId + ''}); 
                }
                else {res.send({status: 'error',message:"No product with that id was deleted" })}
            });
        })

});

// PUT api/carts/:cid deberá actualizar el carrito con un arreglo de productos con el formato especificado arriba.
router.put('/:cid', async (req, res) => {
        const cartId = req.params.cid;
        const products = req.body;
        manager.update(cartId,products).then((cart) => {
            res.send({status: 'success',message: 'The cart with id ' + cartId + ' was updated successfully with the required products.'});
            });
        });
    
 router.put('/:cid/products/:pid', async (req, res) => {
    const cartId = req.params.cid;
    const ProductId = req.params.pid;
    const quantity = parseInt(req.body.quantity);
    console.log("Valores: ",cartId,ProductId,quantity);
        const result = await manager.addQuantity(cartId,ProductId,quantity);
        if (result === "A cart with that id does not exist.") { res.send({status: 'error', message: 'A cart with that id does not exist.'}) }
        else if (result === "An error ocurred with the id of the product to add") { res.send({status: 'error', message: 'A cart with that id does not exist.'}) }
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
