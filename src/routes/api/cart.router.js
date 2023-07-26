import { Router } from "express";
import CartController from "../../controllers/cart.controller.js";
import path from 'path';
import { fileURLToPath } from "url";


const router = Router();
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const controller = new CartController(path.join(dirname,"../../data",'carrito.json'));

router.get('/', controller.getAll);

router.post('/',controller.create);

router.get('/:cid',controller.getByIdApi);

router.post('/:cid/product/:pid', controller.addProduct);

router.delete('/:cid/product/:pid', controller.deleteProduct);

router.put('/:cid', controller.putProducts);
    
router.put('/:cid/products/:pid', controller.addQuantity);

router.delete('/:cid', controller.delete);

router.get('/:cid/purchase',controller.createTicket);

export default router;
