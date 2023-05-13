import { Router } from "express";
import CartManager from "../../controllers/CartManager.js";
import {create as createTicket} from "../../services/TicketService.js"
import path from 'path';
import { fileURLToPath } from "url";
import config from "../../config/config.js"

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
    console.log("result",result);
    if (result === "A cart with that id does not exist.") { res.send({status: 'error', message: 'A cart with that id does not exist.'}) }
    if (result === "Product does not exist") { res.send({status: 'error', message: "Product does not exist"}) }
    if (result === "Some error occurred while updating.") { res.send({status: 'error', message: "Some error occurred while updating."}) }
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
            let newProducts = oldProducts.filter((prod) => prod.product != productId);
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
        const result = await manager.addQuantity(cartId,ProductId,quantity);
        if (result === "A cart with that id does not exist.") { res.send({status: 'error', message: 'A cart with that id does not exist.'}) }
        else if (result === "An error ocurred with the id of the product to add") { res.send({status: 'error', message: 'A cart with that id does not exist.'}) }
        else {
            res.send({status: 'success',message: 'Product ' + ProductId + ' added successfully to cart ' + cartId + ''});
        };
    
    });
    
router.delete('/:cid',async (req, res) => {
        const cartid = req.params.cid;
        const result = await manager.delete(cartid);
        if (result === "A cart with that id does not exist.") { res.send({status: 'error', message: 'A cart with that id does not exist.'}) }
        else if (result === "The Cart id is invalid") { res.send({status: 'error', message: 'The Cart id is invalid.'}) }
        else {
        res.send({status: 'success',message: 'The cart with id ' + cartid + ' is now empty.'});
        return result;
}});


// router.get('/:cid/purchase',async (req, res) => {
//     const cartid = req.params.cid;
//     axios.post('/:cid/purchase').then((req, res) => {    
//         res.send({status: 'success',message: 'The purchase was successful.'});
//     })
// });

router.get('/:cid/purchase',async (req, res) => {
    const cartid = req.params.cid;
    console.log(req.session)
    let user = ""
    if (req.session.user == undefined) {
        user = "POSTMAN"
    } 
    else {
        user = req.session.user.email; 
    }
    const cartData = {purchaser:user,cartid:cartid};
    console.log("cartData",cartData); 
    const result = await createTicket(cartData);
    if (result === "No pudo realizarse la compra, ningun producto de los su carro posee stock.") { res.send({status: 'error', message: "No pudo realizarse la compra, ningun producto de los su carro posee stock."}) }
    // else if (result === "The Cart id is invalid") { res.send({status: 'error', message: 'The Cart id is invalid.'}) }
    else {
        console.log("result",result);
        let productos = result.canceledList.map(prod => 
            ({title: prod.title,description: prod.description,price: prod.price,thumbnail:prod.thumbnail,stock:prod.stock,
                code: prod.code,category: prod.category,id:prod.id,status:prod.status}));
        let ticketData = result.ticketData;
        res.render('purchase',{title:"Compra Exitosa!",port:config.port,cart:cartid,left:productos,ticketData,style:"styles.css"})
    // res.send({status: 'success',message: 'The purchase was successful.'});
    }
    return result;
});


    

export default router;
