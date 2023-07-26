import { Router } from "express";
import CartController from "../../controllers/cart.controller.js";
import {privateAccess,authorizationCall } from "../../../utils.js" 

const router = Router();
let controller = new CartController();

router.get('/:cid',privateAccess,authorizationCall('User'), controller.cartpage);
router.get('/:cid/tickets',privateAccess,authorizationCall('User'),controller.ticketpage);


export default router;