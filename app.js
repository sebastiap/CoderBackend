import express from "express";
import session from "express-session";
import passport from "passport";
import MongoStore from "connect-mongo";
import {generateProducts,validarURL,privateAccess,authorizationCall, formatearProductos} from "./utils.js" ;

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
import errorHandler from "./src/controllers/errors/middleware.js";

// Swagger - Documentacion
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

// Mail
app.get('/mail', async (req, res) => {
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
app.get('/chat',privateAccess,authorizationCall('User'), async (req, res) => {
    //restringir a admin?
    const usercart = req.session.user.cart;
    const premium = (req.session.user.role == "premium");
    res.render('chat',{title:"Bienvenido al Chat",host:config.localhost,port:config.port,premium,cart:usercart,messages,style:"styles.css"})
   })

// Socket
const io = new Server(httpServer);

io.on('connection',  (socket) => {

    socket.on('Client_Connect', message => {
        let req = {};
        customLogger(req);
        req.logger.info(message);
        manager.getFromSocket().then((res) => {
            // formatearProductos
        let mapProd = res.map(prod => (
            {title: prod.title,description: prod.description,price: prod.price,thumbnail:prod.thumbnail,stock:prod.stock,code: prod.code,category: prod.category,id:prod.id,owner:prod.owner}));
        let productos = validarURL(mapProd);

        socket.emit('Listado de Productos Actualizados',productos);
    });
    });

    socket.on("Producto Borrado" ,async data =>{
        let id = data.id;
        let owner = data.owner;
       let algo = await manager.getById(id).then(result =>{
            if (owner === "admin" || owner === result[0].owner) {
                if (owner !== "admin"){
                    transport.sendMail({
                        from:"CoderNode",
                        to:owner,
                        subject:"Su Producto ha sido eliminado",
                        html:`<div>
                        <h1>Producto Eliminado</h1>
                        <p>Lamentamos informarle que su Producto con ${id} ha sido eliminado.</p>
                        <img src="cid:Logo"/>
                        <div>`,
                        attachments:[{
                            filename:"SPIKAGAMES.png",
                            path:__dirname + "/src/public/img/SPIKAGAMES.png",
                            cid:"Logo"
                        }]
                    });
            }
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
        try {
            let producto = context.producto;
            let creator = context.creator;
            axios.post(config.localhost + ":" + config.port + "/api/products/",producto)
            .then(function () {
                manager.getFromSocket().then((res) => {
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
                  // The request was made but no response was received
                  req.logger.error(error.request);
                } else {
                  // Something happened in setting up the request that triggered an Error
                  req.logger.error(error.message);
                }
                req.logger.error(error.config);
              });
            
        } catch (error) {
            req.logger.error(error.message);
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
            let req = {};
            customLogger(req);
            let id = qdata.id;
            axios.get('http://localhost:'+ config.port + '/api/products/'+id).then( (product) => {
            let dataid = product.data[0]._id;
            let cart = currentCart;
            if (cart == "Empty") { socket.emit('Refrescar'); return }
            axios.delete(`http://localhost:${config.port}/api/carts/${cart}/product/${dataid}`)
            .then(function () {
                    socket.emit('Mensaje_Carro ',"Se ha quitado el producto del carro.");
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
                
                .catch(err => {req.logger.error(error);}); 
            }

        catch (error) {
            req.logger.error(error);  
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
            axios.get('http://localhost:'+ config.port + '/api/users/'+ email).then( (user) => {
            if (user.data.role == "premium")
            {newRole = "User" }
            axios.get("http://localhost:8080/api/users/premium/" + user.data._id).then((user) => {
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
});
