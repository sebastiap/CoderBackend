import config from "../config/config.js";
import __dirname,{ generateProducts } from "../../utils.js";
import {transport} from "../../app.js";
import { customLogger } from "../logger/logger.js";
import UserController from "../controllers/user.controller.js";


const controller = new UserController;

export const loggerTest =  async (req, res) => {
    customLogger(req);
    req.logger.debug('DEBUG');
    req.logger.http('http');
    req.logger.info('INFO');
    req.logger.warning('WARNING');
    req.logger.error('error');
    req.logger.fatal('fatal');
    res.send({status: "success", message:"Se logueo un error de cada nivel"});
    }
export const mock =  async (req, res) => {
    let products = [];
    for(let i=0 ; i < 100 ;i++){
        products.push(generateProducts())
    }
    res.send({status: 'success',
    count:products.length,
    data:products,
    message: 'User currently logged is: '})
   }
export const mailSend =  async (req, res) => {
    let now = Date.now();
    let mail = req.query.mail;
    let result = await transport.sendMail({
        from:"CoderNode",
        to:mail,
        subject:"Link de Recuperacion de Password",
        html:`<div>
        <h1>Recuperar Password</h1>
        <h1>Ingrese al siguiente link para resetear su password. Este link tiene validez por una hora.</h1>
        <a href="${config.localhost}:${config.port}/auth/reset/${now}"><img src="https://thumbs.dreamstime.com/b/reset-del-bot%C3%B3n-79321501.jpg" alt="image description"></a>
        Presione para resetear su password
        <img src="cid:Logo"/>
        <div>`,
        attachments:[{
            filename:"SPIKAGAMES.png",
            path:__dirname + "/src/public/img/SPIKAGAMES.png",
            cid:"Logo"
        }]
    });
    res.send({status: 'success',message: 'Se envio un mail con un link para resetear su contraseña.' })
    
       }

export const chat = async (req, res) => {
    let messages  = [];
    const usercart = req.session.user.cart;
    const premium = (req.session.user.role == "premium");
    res.render('chat',{title:"Bienvenido al Chat",host:config.localhost,port:config.port,premium,cart:usercart,messages,style:"styles.css"})
   }

export const currentSession =  async (req, res) => {
    const usercart = req.session.user;
    let viewUser = controller.validate(usercart);
    res.send({status: 'success',message: 'User currently logged is: ' + viewUser.name + `(${viewUser.age}) ` +' and is logged with the mail ' + viewUser.mail })
   }