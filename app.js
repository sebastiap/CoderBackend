import express from "express";
import session from "express-session";
import passport from "passport";
import MongoStore from "connect-mongo";
import {generateProducts,validarURL,privateAccess,authorizationCall} from "./utils.js" ;

import config from "./src/config/config.js"

// Mis routers
import ApiProductRouter,{manager} from "./src/routes/api/apiproduct.router.js";
import ProductRouter from "./src/routes/web/product.router.js";
import ApiCartRouter from "./src/routes/api/cart.router.js"
import ApiUsersRouter from "./src/routes/api/users.router.js"
import CartRouter from "./src/routes/web/carts.router.js"
import AuthRouter from "./src/routes/auth/session.router.js"
import viewsrouter from './src/routes/views.router.js';
import adminrouter from './src/routes/misc/admin.router.js'

import __dirname from './utils.js';
// Handlebars
import handlebars from "express-handlebars";
// WebSockets
import { Server } from "socket.io";
import axios from "axios";

//Mongoose para conectarme en Mongo Atlas
import mongoose from "mongoose";

// Manejo de los mensajes del chat
import messageManager from "./src/controllers/MessageManager.js";
import UserManager from "./src/controllers/UserManager.js";
import initializePassport from "./src/config/passport.config.js";

// Manejo de errores
import errorHandler from "./src/controllers/errors/middleware.js"

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
}


// configuracion de Passport
initializePassport();
app.use(passport.initialize());
app.use(passport.session());


app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use('/api/products',ApiProductRouter);
app.use('/api/carts',ApiCartRouter);
app.use('/api/users',ApiUsersRouter);
app.use('/products',ProductRouter);
app.use('/carts',CartRouter);
app.use('/auth',AuthRouter);
app.use('/admin',adminrouter);

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
// Para sacar el warning
mongoose.set('strictQuery', true);
try {
    let req = {};
    customLogger(req);
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

    console.log(err)
    // Send email
}
}
makeConnection();

// Chat Variables
let messages  = [];
let productos = [];
let msgmanager = new messageManager();

// Crear un endpoint /loggerTest que permita probar todos los logs
app.get('/loggerTest', async (req, res) => {
    req.logger.debug('DEBUG');
    req.logger.http('http');
    req.logger.info('INFO');
    req.logger.warning('WARNING');
    req.logger.error('error');
    req.logger.fatal('fatal');
    res.send({status: "success", message:"Se logueo un error de cada nivel"});
    });

// Home
app.get('/', privateAccess, async (req, res) => {

let result = await manager.getPaginated({limit: 8});
let productosDB = result.payload; 
let messagesDB = await msgmanager.getLast5();
if (productosDB !== undefined) {

    productos = validarURL(productosDB.map(prod => ({title: prod.title,description: prod.description,price: prod.price,thumbnail:prod.thumbnail,stock:prod.stock,code: prod.code,category: prod.category,id:prod.id})));
    messages = messagesDB.map(sms => ({user:sms.user, message: sms.message})).reverse();
}
else {
    productos = [];
}
const usercart = req.session.user.cart;
const userisadmin = (req.session.user.role == 'admin' || req.session.user.role == 'superadmin');
res.render('home',{title:"Home",port:config.port,cart:usercart,admin:userisadmin,productos,messages,style:"styles.css"})

}
);

import nodemailer from 'nodemailer';
import { addLogger,customLogger } from "./src/logger/logger.js";

const transport = nodemailer.createTransport({
    service:'gmail',
    port:587,
    auth:{
        user:config.mail,
        pass:config.mailPassword
    }
})

// Mail
app.get('/mail', async (req, res) => {
let now = Date.now();
let mail = req.query.mail;
console.log(mail);
let result = await transport.sendMail({
    from:"CoderNode",
    to:mail,
    subject:"Correo de Prueba",
    html:`<div>
    <h1>Esto es una Prueba</h1>
    <a href="http://localhost:${config.port}/auth/reset/${now}"><img src="https://thumbs.dreamstime.com/b/reset-del-bot%C3%B3n-79321501.jpg" alt="image description"></a>
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

   })

// current
const userManager = new UserManager;

app.get('/mockingproducts',privateAccess, async (req, res) => {
    let products = [];
    for(let i=0 ; i < 100 ;i++){
        products.push(generateProducts())
    }
    res.send({status: 'success',
    count:products.length,
    data:products,
    message: 'User currently logged is: '})
   })


app.get('/api/session/current',privateAccess, async (req, res) => {
    const usercart = req.session.user;
    let viewUser = userManager.validate(usercart);
    res.send({status: 'success',message: 'User currently logged is: ' + viewUser.name + `(${viewUser.age}) ` +' and is logged with the mail ' + viewUser.mail })
   })

// Chat
app.get('/chat',privateAccess, async (req, res) => {
    //restringir a admin?
    const usercart = req.session.user.cart;
    const premium = (req.session.user.role == "premium");
    res.render('chat',{title:"Bienvenido al Chat",port:config.port,premium,cart:usercart,messages,style:"styles.css"})
   })

// Socket
const io = new Server(httpServer);

io.on('connection',  (socket) => {

    socket.on('Client_Connect', message => {
        // console.log(message);
        // req.logger.info(message);
        manager.getFromSocket().then((res) => {
        let mapProd = res.map(prod => (
            {title: prod.title,description: prod.description,price: prod.price,thumbnail:prod.thumbnail,stock:prod.stock,code: prod.code,category: prod.category,id:prod.id}));
        let productos = validarURL(mapProd);

        socket.emit('Listado de Productos Actualizados',productos);
    });
    });

    socket.on("Producto Borrado" ,async data =>{
        console.log(data);
        let id = data.id;
        let owner = data.owner;
       let algo = await manager.getById(id).then(result =>{
            console.log(result);
            console.log(result[0].owner);
            console.log("owner", owner);
            if (owner === "admin" || owner === result[0].owner) {
                console.log("Puedo borrar!") 
                    manager.delete(id).then(result =>{
                            let result2 = manager.getFromSocket().then((res) => {
                                    let valor = validarURL(res);
                                    socket.emit('Listado de Productos Actualizados',valor);
                                    socket.emit('Borrado confirmado',`Se ha borrado satisfactoriamente el producto ${id}`);
                                });
                                return result2;
                        })
                    }
    });     
    })

    socket.on("Ingresar Nuevo Producto", context => {
        console.log("ESTE ES EL CONTEXTO", context);
        try {
            let producto = context.producto;
            let creator = context.creator;
            console.log(creator);
            // console.log(req.session.user);
            axios.post("http://localhost:"+ config.port + "/api/products/",producto)
            .then(function () {
                manager.getFromSocket().then((res) => {
                    let valor = validarURL(res);
                    socket.emit('Producto_Agregado',"Se ha insertado el nuevo producto exitosamente.");
                    socket.emit('Listado de Productos Actualizados',valor);
                });;
            })
            .catch(function (error) {
                // req.logger.error("error_al_insertar" + error.response.data.message);
                socket.emit("error_al_insertar", error.response.data.message);
                if (error.response) {
                  // The request was made and the server responded with a status code
                  // that falls out of the range of 2xx
                //   req.logger.error("error_al_insertar" + error.response.data.message);
                //   req.logger.error("error_al_insertar" + error.response.data.message);
                //   req.logger.error("error_al_insertar" + error.response.data.message);
                  console.log(error.response.data);
                  console.log(error.response.status);
                  console.log(error.response.headers);
                } else if (error.request) {
                  // The request was made but no response was received
                  console.log(error.request);
                } else {
                  // Something happened in setting up the request that triggered an Error
                  console.log('Error', error.message);
                }
                console.log(error.config);
              });
            
        } catch (error) {
            console.log(error.message);
        }
    })

    // Chat Sockets
    socket.on("message", (data) => {
        messages.push(data);
        msgmanager.post(data);
        io.emit("message_logs",messages)
    })

    
    socket.on("authenticated", user => {
        io.emit("message_logs",messages);
        io.emit("new_user_connected",user);
    })


     // Cart Sockets
    socket.on("Borrar_Producto_Carro", (qdata) => {
            try {
            let id = qdata.id;
            axios.get('http://localhost:'+ config.port + '/api/products/'+id).then( (product) => {
            let dataid = product.data[0]._id;
            let cart = currentCart;
            if (cart == "Empty") { socket.emit('Refrescar'); return }
            axios.delete(`http://localhost:${config.port}/api/carts/${cart}/products/${dataid}`)
            .then(function () {
                    socket.emit('Mensaje_Carro',"Se ha quitado el producto del carro.");
                })
                .catch(err => {console.log(err);}); 
            }
        ) ;
        }
        catch (error) {
              console.log(error);
        }
        })

    socket.on("Agregar_Producto_Carro" ,  (qdata) => {
        try {
            let cart = currentCart;
            if (cart == "Empty") { socket.emit('Refrescar'); return }
            let putURL = `http://localhost:${config.port}/api/carts/${cart}/products/${qdata.product}`
            let putData = {
                "quantity":qdata.quantity
                };
            axios.put(putURL,putData)
            .then(function () {
                    socket.emit('Mensaje_Carro',`Se agrego el producto ${qdata.title} al carrito.`);
                })
                .catch(err => {console.log(err);}); 
            }

        catch (error) {
            console.log(error);
        }
    }
    );

    socket.on("Cambiar_Cantidad_Carro" ,  (qdata) => {
        try {
            axios.get('http://localhost:'+ config.port + '/api/products/'+ qdata.id).then( (product) => {
            let dataid = product.data[0]._id;
            let cart = currentCart;
            if (cart == "Empty") { socket.emit('Refrescar'); return }
            let putData = {
                "quantity":qdata.quantity
                };
              let putURL = `http://localhost:${config.port}/api/carts/${cart}/products/`+dataid;
              axios.put(putURL,putData)
            .then(function () {
                    socket.emit('Mensaje_Carro',"Se ha agregado una unidad.");
                })
                .catch(err => {console.log(err);}); 
            })
        }
        catch (error) {
            console.log(error);
        }
    }
    );

});
