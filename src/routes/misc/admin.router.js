import { Router } from "express";
import { privateAccess,authorizationCall,formatearProductos } from "../../../utils.js";
import config from "../../config/config.js";
import TicketManager from "../../controllers/TicketManager.js";
import Productmanager from "../../controllers/ProductManager.js";

const ticketManager = new TicketManager;
const productmanager = new Productmanager;

const router = Router();
// realTimeProducts
router.get('/realtimeproducts',privateAccess,authorizationCall('admin'), async (req, res) => {
    let productos = [];
    const usercart = req.session.user.cart;
    const userisadmin = (req.session.user.role == 'admin' || req.session.user.role == 'superadmin');
    res.render('realTimeProducts',{title:"Administracion de Productos",port:config.port,cart:usercart,admin:userisadmin,productos,style:"styles.css"})
   });

router.get('/premiumproducts',privateAccess,authorizationCall('premium'), async (req, res) => {
    let productos = [];
    const usercart = req.session.user.cart;
    const userisadmin = false;
    const mail = req.session.user.email;
    let productosDB = await productmanager.getByUser(req.session.user.email);
    productos = formatearProductos(productosDB);
    res.render('premiumProducts',{title:"Administracion de Productos Premium",port:config.port,cart:usercart,admin:userisadmin,productos,mail,style:"styles.css"})
   });

   router.get('/tickets',privateAccess,authorizationCall('admin'), async (req, res) => {
    let unformatTickets = await ticketManager.getAll();
    const usercart = req.session.user.cart;
    const userisadmin = (req.session.user.role == 'admin' || req.session.user.role == 'superadmin');
    let title = "Compras Realizadas en el sitio, de todos los usuarios";
    let userTickets = unformatTickets.map(ticket => ({
        code: ticket.code,
        purchase_datetime: ticket.purchase_datetime,
        amount: ticket.amount,
        user:ticket.purchaser
    }))
    res.render('tickets',{title:"Spika Games - Compras de Usuarios",port:config.port,Ptitle:title,userTickets,cart:usercart,admin:userisadmin,style:"styles.css"})
   });

export default router;