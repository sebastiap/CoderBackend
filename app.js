import express from "express";
import session from "express-session";
import passport from "passport";
import MongoStore from "connect-mongo";
import {generateProducts,validarURL,privateAccess,authorizationCall, formatearProductos} from "./utils.js" ;

import config from "./src/config/config.js"

import ApiProductRouter,{controller} from "./src/routes/api/apiproduct.router.js";
import ProductRouter from "./src/routes/web/product.router.js";
import ApiCartRouter from "./src/routes/api/cart.router.js";
import ApiUsersRouter from "./src/routes/api/users.router.js";
import ApiSessionRouter from "./src/routes/api/session.router.js";
import CartRouter from "./src/routes/web/carts.router.js";
import AuthRouter from "./src/routes/auth/session.router.js";
import viewsrouter from './src/routes/views.router.js';
import ChatRouter from './src/routes/misc/chat.router.js';
import MockingRouter from './src/routes/misc/mocking.router.js';
import LoggingRouter from './src/routes/misc/logging.router.js';
import MailRouter from './src/routes/misc/mail.router.js';
import AdminRouter from './src/routes/misc/admin.router.js';

import __dirname from './utils.js';

import handlebars from "express-handlebars";

import { Server } from "socket.io";
import axios from "axios";

import mongoose from "mongoose";

import messageController from "./src/controllers/message.controller.js";
import UserManager from "./src/controllers/user.controller.js";
import initializePassport from "./src/config/passport.config.js";


import errorHandler from "./src/controllers/errors/middleware.js";

import swaggerJSDoc from "swagger-jsdoc";
import swaggerUiExpress from "swagger-ui-express";

const swaggerOptions = {
    definition:{
        openapi:'3.0.1',
        info:{
            title:'Documentacion Spika Games',
            description:'API pensada para ecommerce',
        }
    },
    apis:[`${__dirname}/src/docs/**/*.yaml`]
};
const specs = swaggerJSDoc(swaggerOptions);


const app = express();

try {
app.use(session({
    store:MongoStore.create({ 
        mongoUrl:"mongodb+srv://"+ config.adminName+ ":" + config.adminPassword +"@" + config.mongoUrl +"?retryWrites=true&w=majority",
    
        mongoOptions: {useNewUrlParser:true},
        ttl:3000,
    }),
    secret:'codename',
    resave:true,
    saveUninitialized:true

}));
} catch (error) {
    let req = {};
    customLogger(req);
    req.logger.error("Cannot Connect to Database with MongoStore " + error);
};

app.use('/apidocs',swaggerUiExpress.serve,swaggerUiExpress.setup(specs));

initializePassport();
app.use(passport.initialize());
app.use(passport.session());


app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use('/api/products',ApiProductRouter);
app.use('/api/carts',ApiCartRouter);
app.use('/api/users',ApiUsersRouter);
app.use('/api/session',ApiSessionRouter);
app.use('/products',ProductRouter);
app.use('/carts',CartRouter);
app.use('/chat',ChatRouter);
app.use('/mockingproducts',MockingRouter);
app.use('/logger-test',LoggingRouter);
app.use('/auth',AuthRouter);
app.use('/mail',MailRouter);
app.use('/admin',AdminRouter);

const httpServer = app.listen(config.port, ()=> console.log('Listening on port ' + config.port));

app.engine('handlebars',handlebars.engine());
app.set('views',__dirname+'/src/views');
app.set('view engine','handlebars');
app.use(express.static(__dirname+'/src/public')); 
app.use(express.static('/',viewsrouter));

app.use(errorHandler);
app.use(addLogger);

global.currentCart = "Empty";


async function makeConnection() {
mongoose.set('strictQuery', true);
let req = {};
customLogger(req);
try {
    let req = {};
    let result = await mongoose.connect("mongodb+srv://"+ config.adminName+ ":" + config.adminPassword +"@" + config.mongoUrl +"?retryWrites=true&w=majority", error => {
        if (error) {
            req.logger.error("Cannot Connect to Database " + error);
            process.exit();
        }
    });  
} catch(err) {
    if(err == "MongoNetworkError") {
        req.logger.error("No Connection");
    }

    req.logger.error("Cannot Connect to Database " + err);
}
}
makeConnection();

let messages  = [];
let productos = [];
let msgcontroller = new messageController();


app.get('/', privateAccess, async (req, res) => {

let result = await controller.getPaginated({limit: 8});
let productosDB = result.payload; 
let messagesDB = await msgcontroller.getLast5();
if (productosDB !== undefined) {

    productos = validarURL(productosDB.map(prod => ({title: prod.title,description: prod.description,price: prod.price,thumbnail:prod.thumbnail,stock:prod.stock,code: prod.code,category: prod.category,id:prod.id})));
    messages = messagesDB.map(sms => ({user:sms.user, message: sms.message})).reverse();
}
else {
    productos = [];
}
const usercart = req.session.user.cart;
const userisadmin = (req.session.user.role == 'admin' || req.session.user.role == 'superadmin');
const premium = (req.session.user.role == "premium");
res.render('home',{title:"Home",host:config.localhost,port:config.port,cart:usercart,admin:userisadmin,premium,productos,messages,style:"styles.css"})

}
);

import nodemailer from 'nodemailer';
import { addLogger,customLogger } from "./src/logger/logger.js";


export const transport = nodemailer.createTransport({
    service:'gmail',
    port:587,
    auth:{
        user:config.mail,
        pass:config.mailPassword
    }
})

const io = new Server(httpServer);

io.on('connection',  (socket) => {

    socket.on('Client_Connect', message => {
        let req = {};
        customLogger(req);
        req.logger.info(message);
        controller.getFromSocket().then((res) => {
        let mapProd = res.map(prod => (
            {title: prod.title,description: prod.description,price: prod.price,thumbnail:prod.thumbnail,stock:prod.stock,code: prod.code,category: prod.category,id:prod.id,owner:prod.owner}));
        let productos = validarURL(mapProd);

        socket.emit('Listado de Productos Actualizados',productos);
    });
    });

    socket.on("Producto Borrado" ,async data =>{
        let id = data.id;
        let owner = data.owner;
        axios.delete(`${config.localhost}:${config.port}/api/products/${id}`).then(result =>{
            console.log("LLEGUE ACA AL MENOS");
                                    let result2 = controller.getFromSocket().then((res) => {
                                            let valor = validarURL(res);
                                            socket.emit('Listado de Productos Actualizados',valor);
                                            socket.emit('Borrado confirmado',`Se ha borrado satisfactoriamente el producto ${id}`);
                                        });
                                        return result2;
                                });
    })

    socket.on("Ingresar Nuevo Producto", context => {
        try {
            let producto = context.producto;
            let creator = context.creator;
            axios.post(config.localhost + ":" + config.port + "/api/products/",producto)
            .then(function () {
                controller.getFromSocket().then((res) => {
                    let valor = validarURL(res);
                    socket.emit('Producto_Agregado',"Se ha insertado el nuevo producto exitosamente.");
                    socket.emit('Listado de Productos Actualizados',valor);
                });;
            })
            .catch(function (error) {
                let req = {};
                customLogger(req);
                socket.emit("error_al_insertar", error.response.data.message);
                if (error.response) {
                    req.logger.error(error.response.data);
                    req.logger.error(error.response.status);
                    req.logger.error(error.response.headers);
                } else if (error.request) {
                  req.logger.error(error.request);
                } else {
                  req.logger.error(error.message);
                }
                req.logger.error(error.config);
              });
            
        } catch (error) {
            req.logger.error(error.message);
        }
    })

    socket.on("message", (data) => {
        messages.push(data);
        msgcontroller.post(data);
        io.emit("message_logs",messages)
    })

    
    socket.on("authenticated", user => {
        io.emit("message_logs",messages);
        io.emit("new_user_connected",user);
    })

    socket.on("Borrar_Producto_Carro", (qdata) => {
            try {
            let req = {};
            customLogger(req);
            let id = qdata.id;
            axios.get(config.localhost + ':'+ config.port + '/api/products/'+id).then( (product) => {
            let dataid = product.data[0]._id;
            let cart = currentCart;
            if (cart == "Empty") { socket.emit('Refrescar'); return }
            axios.delete(`${config.localhost}:${config.port}/api/carts/${cart}/product/${dataid}`)
            .then(function () {
                    socket.emit('Mensaje_Carro',"Se ha quitado el producto del carro.");
                })
                .catch(err => {req.logger.error(err);}); 
                
            }
        ) ;
        }
        catch (error) {
            req.logger.error(error);
        }
        })

    socket.on("Agregar_Producto_Carro" ,  (qdata) => {
        let req = {};
        customLogger(req);
        console.log("Agregar_Producto_Carro"); 

        try {
            let cart = currentCart;
            if (cart == "Empty") { socket.emit('Refrescar'); return }
            let putURL = `${config.localhost}:${config.port}/api/carts/${cart}/products/${qdata.product}`;
            let putData = {
                "quantity":qdata.quantity
                };
            axios.put(putURL,putData)
            .then(function () {
                    socket.emit('Mensaje_Carro',`Se agrego el producto ${qdata.title} al carrito.`);
                })
                
                .catch(err => {req.logger.error(error);}); 
            }

        catch (error) {
            req.logger.error(error);  
        }
    }
    );

    socket.on("Cambiar_Cantidad_Carro" ,  (qdata) => {
        try {
            axios.get(config.localhost + ':'+ config.port + '/api/products/'+ qdata.id).then( (product) => {
            let dataid = product.data[0]._id;
            let cart = currentCart;
            if (cart == "Empty") { socket.emit('Refrescar'); return }
            let putData = {
                "quantity":qdata.quantity
                };
              let putURL = `${config.localhost}:${config.port}/api/carts/${cart}/products/`+dataid;
              axios.put(putURL,putData)
            .then(function () {
                    if (qdata.quantity > 0) {
                        socket.emit('Mensaje_Carro',"Se ha agregado una unidad.");
                    }
                    else {
                        socket.emit('Mensaje_Carro',"Se ha quitado una unidad.");
                    }
                })
                .catch(err => {            
                    let req = {};
                    customLogger(req);
                        req.logger.error(error);  }); 
            })
        }
        catch (error) {
            let req = {};
            customLogger(req);
            req.logger.error(error);  
        }
    }
    );


    socket.on("Cambiar_Rol_Usuario" ,  (email) => {
        try {
            let newRole = "premium";
            axios.get(config.localhost + ':'+ config.port + '/api/users/'+ email).then( (user) => {
            if (user.data.role == "premium")
            {newRole = "User" }
            axios.get(config.localhost + ":"+ config.port + "/api/users/premium/" + user.data._id).then((user) => {
                socket.emit('Rol_Cambiado',"Se ha cambiado el rol del usuario a " + newRole);
        }
            )
            })
        }
        catch (error) {
            let req = {};
            customLogger(req);
            req.logger.error(error);  

        }
    }
    );
    socket.on("Borrar_Usuario" ,  (email) => {
        try { 
            axios.delete(config.localhost + ":"+ config.port + "/api/users/" + email).then((user) => {
                socket.emit('Usuario_Eliminado',"Se ha eliminado el usuario " + email);
        }
            )
            }
        catch (error) {
            let req = {};
            customLogger(req);
            req.logger.error(error);  

        }
    }
    );
});
