import { Router } from "express";
import CartManager from "../../controllers/CartManager.js";
import TicketManager from "../../controllers/TicketManager.js";
import {validarUrlIndividual,privateAccess,authorizationCall } from "../../../utils.js" 
import config from "../../config/config.js" 

import { customLogger } from "../../logger/logger.js";

const router = Router();
let cartmanager = new CartManager();
let ticketManager = new TicketManager();

router.get('/:cid',privateAccess,authorizationCall('User'), async (req, res) => {
    customLogger(req);
    let cartId = req.params.cid;
    let cartProm = await cartmanager.getByIdDetailed(cartId); 
    let cartArray = cartProm.products; 
    currentCart = cartId;
    let fixfromCart = [];
    let cartProducts = cartArray.map(function(productObj,index){
        if (productObj.product == null || productObj.product == undefined) {
            fixfromCart.push(index);
            return productObj = {title:"Producto Inexistente", description:"Producto Inexistente",
                thumbnail:"https://thumbs.dreamstime.com/z/icono-de-producto-no-disponible-ilustraci%C3%B3n-vectores-plano-y-aislado-con-dise%C3%B1o-m%C3%ADnimo-sombra-larga-117825738.jpg"
                , code:"NN", quantity:0,id:0} 
        }
        else {
        validarUrlIndividual(productObj.product);
        return productObj = {title:productObj.product.title, description:productObj.product.description,price:productObj.product.price,
            thumbnail:productObj.product.thumbnail, code:productObj.product.code, quantity:productObj.quantity,id:productObj.product.id}
        }
    })  
        if (fixfromCart.length > 0) {
            cartProducts = cartProducts.filter((word,index) => !(fixfromCart.includes(index)));
            let toFixCart = await cartmanager.getById(cartId);
            toFixCart = toFixCart.products.filter((word,index) => !(fixfromCart.includes(index)));
            // let newCart = toFixCart.map(p =>({"product":p.product, "quantity": p.quantity}))
            let newCart = cartmanager.validate(toFixCart);
            await cartmanager.update(cartId,newCart);
        }
    req.logger.info("Accediendo al Carro");
    const premium = (req.session.user.role == "premium");
    res.render('carts',{title:"Spika Games - Carro de Compras",port:config.port,cartProducts,cart:cartId,premium,style:"styles.css"})
   }
)
router.get('/:cid/tickets',privateAccess,authorizationCall('User'), async (req, res) => {
    customLogger(req);
    let cartId = req.params.cid;
    let user = req.session.user.email;
    let title = "Mis Compras";
    let unformatTickets = await ticketManager.getByUser(user);
    let userTickets = unformatTickets.map(ticket => ({
        code: ticket.code,
        purchase_datetime: ticket.purchase_datetime,
        amount: ticket.amount,
    }))
    req.logger.info("Viendo tickets del usuario")
    const premium = (req.session.user.role == "premium");
    res.render('tickets',{title:"Spika Games - Compras Realizadas",port:config.port,Ptitle:title,userTickets,cart:cartId,premium,style:"styles.css"})
   }
)


export default router;