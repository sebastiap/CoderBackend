import express, { json } from "express";
import session from "express-session";
import passport from "passport";
import MongoStore from "connect-mongo";
import {validarUrlIndividual,validarURL,privateAccess} from "./utils.js" ;

// Mis routers
import ApiProductRouter,{manager} from "./src/routes/api/apiproduct.router.js";
import ProductRouter from "./src/routes/web/product.router.js";
import ApiCartRouter from "./src/routes/api/cart.router.js"
import CartRouter from "./src/routes/web/carts.router.js"
import AuthRouter from "./src/routes/auth/session.router.js"
import viewsrouter from './src/routes/views.router.js';

import __dirname from './utils.js';
// Handlebars
import handlebars from "express-handlebars";
// WebSockets
import { Server } from "socket.io";
import axios from "axios";

//Mongoose para conectarme en Mongo Atlas
import mongoose from "mongoose";

// Manejo de los mensajes del chat
import messageManager from "./src/dao/dbManagers/MessageManager.js";
import CartManager from "./src/dao/dbManagers/CartManager.js";
import initializePassport from "./src/config/passport.config.js";


const app = express();



app.use(session({
    store:MongoStore.create({
        mongoUrl:"mongodb+srv://ecommerce:HxZgzDO58FSWBz4K@cluster0.mpljszi.mongodb.net/ecommerce?retryWrites=true&w=majority",
        mongoOptions: {useNewUrlParser:true},
        ttl:3000,
    }),
    secret:'codename',
    resave:true,
    saveUninitialized:true

}));

// configuracion de Passport
initializePassport();
app.use(passport.initialize());
app.use(passport.session());


app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use('/api/products',ApiProductRouter);
app.use('/api/carts',ApiCartRouter);
app.use('/products',ProductRouter);
app.use('/carts',CartRouter);
app.use('/auth',AuthRouter);

const httpServer = app.listen(8080, ()=> console.log('Listening on port 8080'));

app.engine('handlebars',handlebars.engine());
app.set('views',__dirname+'/src/views');
app.set('view engine','handlebars');
app.use(express.static(__dirname+'/src/public')); 
app.use(express.static('/',viewsrouter));


app.get('/session', async (req, res) => {
if (req.session.counter) {
    req.session.counter++;
    res.send(`Usted ha visitado este sitio ${req.session.counter} veces.`);
}
else {
    req.session.counter =1;
    res.send('bienvenido');
}
});

// Para sacar el warning
mongoose.set('strictQuery', true);
mongoose.connect("mongodb+srv://ecommerce:HxZgzDO58FSWBz4K@cluster0.mpljszi.mongodb.net/ecommerce?retryWrites=true&w=majority", error => {
    if (error) {
        console.log("Cannot Connect to Database", error);
        process.exit();
    }
});

// Chat Variables
let messages  = [];
let productos = [];
let msgmanager = new messageManager();

// Home
app.get('/', privateAccess, async (req, res) => {

let productosDB = await manager.get();
let messagesDB = await msgmanager.getLast();
if (productosDB !== undefined) {

    productos = validarURL(productosDB.map(prod => ({title: prod.title,description: prod.description,price: prod.price,thumbnail:prod.thumbnail,stock:prod.stock,code: prod.code,category: prod.category,id:prod.id})));
    messages = messagesDB.map(sms => ({user:sms.user, message: sms.message})).reverse();
}
else {
    productos = [];
}
res.render('home',{productos,messages,style:"styles.css"})

}
);

// Chat
app.get('/chat',privateAccess, async (req, res) => {
    res.render('chat',{messages,style:"styles.css"})
   })
// realTimeProducts
app.get('/realtimeproducts',privateAccess, async (req, res) => {
    let productos = [];
    res.render('realTimeProducts',{productos,style:"styles.css"})
   })

// Socket
const io = new Server(httpServer);

io.on('connection',  (socket) => {

    socket.on('Client_Connect', message => {
        console.log(message);
        manager.getFromSocket().then((res) => {
        let mapProd = res.map(prod => (
            {title: prod.title,description: prod.description,price: prod.price,thumbnail:prod.thumbnail,stock:prod.stock,code: prod.code,category: prod.category,id:prod.id}));
        let productos = validarURL(mapProd);

        socket.emit('Listado de Productos Actualizados',productos);
    });
    });

    socket.on("Producto Borrado" ,async data =>{

        manager.delete(data).then(result =>{

            let result2 = manager.getFromSocket().then((res) => {
                let valor = validarURL(res);
                socket.emit('Listado de Productos Actualizados',valor);
                socket.emit('Borrado confirmado',`Se ha borrado satisfactoriamente el producto ${data}`);
            });
            return result2;
    })
        
    })

    socket.on("Ingresar Nuevo Producto", producto => {
        try {
            axios.post("http://localhost:8080/api/products/",producto)
            .then(function () {
                manager.getFromSocket().then((res) => {
                    let valor = validarURL(res);
                    socket.emit('Producto_Agregado',"Se ha insertado el nuevo producto exitosamente.");
                    socket.emit('Listado de Productos Actualizados',valor);
                });;
            })
            .catch(function (error) {
                socket.emit("error_al_insertar", error.response.data.message);
                if (error.response) {
                  // The request was made and the server responded with a status code
                  // that falls out of the range of 2xx
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
     let cartManager = new CartManager;
    
    socket.on("Borrar_Producto_Carro", (id) => {
            try {
            axios.get('http://localhost:8080/api/products/'+id).then( (product) => {
            let dataid = JSON.stringify(product.data[0]._id);
            let cart = '64135d02acdf495d33f1a229';
            let pid = '640bc2d4681bbd0c4a4a9942';
            axios.delete(`http://localhost:8080/api/carts/${cart}/products/${dataid}`)
            .then(function () {
                    // console.log("al menos entre aca");
                    socket.emit('Mensaje_Carro',"Se ha quitado el producto del carro.");
                })
                .catch(err => {console.log(err);}); 
            }
        ) ;
        // let dataid = productToAdd.data[0]._id;
        // console.log("id",dataid);
        // let cart = '64135d02acdf495d33f1a229';
        // http://localhost:8080/api/carts/:cid/products/:pid
        // axios.delete(`http://localhost:8080/api/carts/${cart}/products/`,dataid)
        // .then(function () {
        //         console.log("al menos entre aca");
        //         socket.emit('Producto_Borrado_Carro',"Se ha borrado.");
        //     })
        }
        catch (error) {
              console.log(error);
        }
        })

    socket.on("Cambiar_Cantidad_Carro" ,  (qdata) => {
        try {
            axios.get('http://localhost:8080/api/products/'+ qdata.id).then( (product) => {
            let dataid = product.data[0]._id;
            let cart = '64135d02acdf495d33f1a229';
            // let pid = '6417474f08f56d00a6f79c69';
            // cartManager.addProduct(cart,dataid, qdata.quantity).then( (added) => {
            //     console.log(added);
            // }
            // )

            // let cartToFill = axios.get('http://localhost:8080/api/carts/'+stringCart);
            console.log(dataid);

            let putData = {
                "quantity":qdata.quantity
                };
              // cartProducts.push(putData);
              let putURL = `http://localhost:8080/api/carts/${cart}/products/`+dataid;
            //   console.log(putURL);
              axios.put(putURL,putData)
            .then(function () {
                    // console.log("al menos entre aca");
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

    // socket.on('Agregar_al_Carro',(data) => {
    //     console.log("Por que no entro aca?",data);
    //     let putData = [{"product":"640bc2f9681bbd0c4a4a994c","quantity":5730 },
    //     {"product":"640bc2d4681bbd0c4a4a9942","quantity":600 },
    //     {"product":"640efafa130d57a081c9cfda","quantity":1 }
    //     ];

    // try {
    //     // TODO HACER ANDAR ESTO
    //     axios.put("http://localhost:8080/api/carts/64138d85b7e69806cd95ebe7/",putData)
    //     .then(function () {
    //         // manager.getFromSocket().then((res) => {
    //         //     let valor = validarURL(res);
    //             console.log("al menos entre aca");
    //             socket.emit('Producto_Agregado_Carro',"Se ha insertado el nuevo producto exitosamente.");
    //             // socket.emit('Listado de Productos Actualizados',valor);
    //         // }
    //         // );;
    //     })
    //     .catch(function (error) {
    //         socket.emit("error_al_insertar", error.response.data.message);
    //         if (error.response) {
    //           // The request was made and the server responded with a status code
    //           // that falls out of the range of 2xx
    //           console.log(error.response.data);
    //           console.log(error.response.status);
    //           console.log(error.response.headers);
    //         } else if (error.request) {
    //           // The request was made but no response was received
    //           // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    //           // http.ClientRequest in node.js
    //           console.log(error.request);
    //         } else {
    //           // Something happened in setting up the request that triggered an Error
    //           console.log('Error', error.message);
    //         }
    //         console.log(error.config);
    //       });
        
    // } catch (error) {
    //     console.log(error.message);
    // }
    // }
    // )



});
