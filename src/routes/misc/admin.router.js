import { Router } from "express";
import { privateAccess,authorizationCall } from "../../../utils.js";
import config from "../../config/config.js";

const router = Router();
// realTimeProducts
router.get('/realtimeproducts',privateAccess,authorizationCall('admin'), async (req, res) => {
    let productos = [];
    const usercart = req.session.user.cart;
    const userisadmin = (req.session.user.role == 'admin' || req.session.user.role == 'superadmin');
    res.render('realTimeProducts',{title:"Administracion de Productos",port:config.port,cart:usercart,admin:userisadmin,productos,style:"styles.css"})
   })


export default router;