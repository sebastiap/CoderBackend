import { Router } from "express";
import { privateAccess,authorizationCall,formatearProductos } from "../../../utils.js";

import UserController from "../../controllers/user.controller.js";

const controller = new UserController;

const router = Router();
router.get('/userroles',privateAccess,authorizationCall('admin'),controller.getAllforAdmin);

router.get('/realtimeproducts',privateAccess,authorizationCall('admin'), controller.realtimeproducts);

router.get('/premiumproducts',privateAccess,authorizationCall('premium'), controller.premiumproducts);

router.get('/tickets',privateAccess,authorizationCall('admin'), controller.tickets);

export default router;