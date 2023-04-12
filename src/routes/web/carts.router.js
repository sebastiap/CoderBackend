import { Router } from "express";
import CartManager from "../../dao/dbManagers/CartManager.js";
import {validarUrlIndividual,privateAccess } from "../../../utils.js" 

const router = Router();
let cartmanager = new CartManager();

router.get('/:cid',privateAccess, async (req, res) => {
    let cartId = req.params.cid;
    let cartProm = await cartmanager.getByIdDetailed(cartId); 
    let cartArray = cartProm.products; 
    let cartProducts = cartArray.map(function(productObj){
        validarUrlIndividual(productObj.product);
        return productObj = {title:productObj.product.title, description:productObj.product.description,
            thumbnail:productObj.product.thumbnail, code:productObj.product.code, quantity:productObj.quantity,id:productObj.product.id}
    })
        
    res.render('carts',{cartProducts,cart:cartId,style:"styles.css"})
   }
   )

export default router;