import { Router } from "express";
import UserManager from '../../controllers/UserManager.js';
import path from 'path';
import { fileURLToPath } from "url";

const router = Router();
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const manager = new UserManager(path.join(dirname,"../../data",'carrito.json'));

router.get('/:mail',async (req, res) => {
    const cartId = req.params.mail;
    let result = await manager.getOne(cartId);

    if (result === 'Cart not found'){
        res.status(400).send({status: 'error',message: 'Cart not found'})
    }
    else {
        res.send(result);
    }
});
// // POST - Agrega un usuario
// router.post('/:cid/product/:pid',async (req, res) => {
//     const cartId = req.params.cid;
//     const ProductId = req.params.pid;
//     const quantity = parseInt(req.body.quantity);
//     const result = await manager.addProduct(cartId,ProductId,quantity); 
//     if (result === "A cart with that id does not exist.") { res.send({status: 'error', message: 'A cart with that id does not exist.'}) }
//     if (result === "Some error occurred while updating.") { res.send({status: 'error', message: "Some error occurred while updating."}) }
//     else {
//         res.send({status: 'success',message: 'Product ' + ProductId + ' added successfully to cart ' + cartId + ''});
//     };
// });

// PUT api/carts/:cid deberá actualizar el carrito con un arreglo de productos con el formato especificado arriba.
router.get('/premium/:uid', async (req, res) => {
        const userId = req.params.uid;
        let user = await manager.getById(userId);
        console.log(user);
        let newRole
        if (user.role == "User"){
            newRole = "premium"; 
        }
        else if (user.role == "premium"){
            newRole = "User"; 
        }
        else {
            // TODOZ ver error
            res.send({status: 'error',message: 'The user is an administrator. His role cannot be changed.'});
        }
        manager.updateRole(user.email,newRole).then((user) => {
            res.send({status: 'success',message: 'The user with id ' + userId + ' was updated successfully. Now his role is ' + newRole});
            });
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
    

export default router;
