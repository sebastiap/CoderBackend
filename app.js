import express, { json } from "express";

// Mis routers
// TODO si no uso manager sacar esto
import ApiProductRouter,{manager} from "./src/routes/apiproduct.router.js";
import ProductRouter from "./src/routes/product.router.js";
import CartRouter from "./src/routes/cart.router.js"
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


const app = express();

//APP USE - Middleware
// App use nos permite usar middleware . Cada vez que hacemos un app.use estamos agregando uno.
// Express ejecutara las funciones que le pasemos a app.use() en orden a medida que los llamemos.

// express.json() parsea el JSON que nos llega en las requests y pone los datos en req.body.
app.use(express.json());
// Si ponemos el atributo extended  en true para urlencoded
// esto especifica que el objeto req.body va a contener valores de todo tipo en lugar de solo strings (por defecto toma solo strings)
app.use(express.urlencoded({extended:true}));

// Mi propio Middleware con router
app.use('/api/products',ApiProductRouter);
app.use('/products',ProductRouter);
app.use('/api/carts',CartRouter);

const httpServer = app.listen(8080, ()=> console.log('Listening on port 8080'));

// Agrego estructura de WebSocket
app.engine('handlebars',handlebars.engine());
app.set('views',__dirname+'/src/views');
app.set('view engine','handlebars');
app.use(express.static(__dirname+'/src/public'));
app.use(express.static('/',viewsrouter));

mongoose.connect("mongodb+srv://ecommerce:HxZgzDO58FSWBz4K@cluster0.mpljszi.mongodb.net/ecommerce?retryWrites=true&w=majority", error => {
    if (error) {
        console.log("Cannot Connect to Database", error);
        process.exit();
    }
    
    
});




//Funciones Genericas
const validarUrlIndividual = (product) => {
    if (!product.thumbnail || product.thumbnail.length < 10 || product.thumbnail == "" || product.thumbnail == "Sin imagen" || typeof product.thumbnail != "string") {
        product.thumbnail = "https://picsum.photos/200/300";
}; 
};

const validarURL = (listadoProductos) => {
    //Validar por formulario o que la URL empiece con http
    listadoProductos.map((product => { 
        validarUrlIndividual(product);
    }
    
    ))
    return listadoProductos;

}

// Chat Variables
let messages  = [];
let msgmanager = new messageManager();

//Cart
let cartmanager = new CartManager();

// Home

app.get('/', async (req, res) => {

let productosDB = await manager.get();
let messagesDB = await msgmanager.getLast();
let productos = validarURL(productosDB.map(prod => ({title: prod.title,description: prod.description,price: prod.price,thumbnail:prod.thumbnail,stock:prod.stock,code: prod.code,category: prod.category,id:prod.id})));
messages = messagesDB.map(sms => ({user:sms.user, message: sms.message})).reverse();
res.render('home',{productos,messages,style:"styles.css"})

}
);

// Chat
app.get('/chat', async (req, res) => {

    res.render('chat',{messages,style:"styles.css"})
   }
   )

// realTimeProducts
app.get('/realtimeproducts', async (req, res) => {
    let productos = [];
    res.render('realTimeProducts',{productos,style:"styles.css"})
   }
   )
// app.get('/products', async (req, res) => {
//     let productosDB = await manager.getPaginated();
//     console.log(productosDB);
//     let productos = validarURL(productosDB.docs.map(prod => ({title: prod.title,description: prod.description,price: prod.price,thumbnail:prod.thumbnail,stock:prod.stock,code: prod.code,category: prod.category,id:prod.id})));
//     res.render('products',{productos,style:"styles.css"})
//    }
//    )

app.get('/carts/:cid', async (req, res) => {
    let cartId = req.params.cid;
    let cartProm = await cartmanager.getByIdDetailed(cartId); 
    let cartArray = cartProm.products; 
    // console.log(cartArray);
    // TODO AGREGAR BORRADO DE ARTICULOS DE CARRITO
    let cartProducts = cartArray.map(function(productObj){
        validarUrlIndividual(productObj.product);
        return productObj = {title:productObj.product.title, description:productObj.product.description,
            thumbnail:productObj.product.thumbnail, code:productObj.product.code, quantity:productObj.quantity}
    })

      
    res.render('carts',{cartProducts,style:"styles.css"})
   }
   )

// Al crear esta instancia del Servidor de Socket IO, lo que estoy logrando es que este servidor 
// obtenga un habilidad adicional para utilizar Sockets
const io = new Server(httpServer);
let prodids = [];

io.on('connection',  (socket) => {

    // Un cliente se conecta
    socket.on('Client_Connect', message => {
        console.log(message);
        let valor  = manager.getFromSocket().then((res) => {
        let mapProd = res.map(prod => (
            {title: prod.title,description: prod.description,price: prod.price,thumbnail:prod.thumbnail,stock:prod.stock,code: prod.code,category: prod.category,id:prod.id}));
        let productos = validarURL(mapProd);

        socket.emit('Listado de Productos Actualizados',productos);
    });
    });

    // Un cliente pide borrar un producto
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
    // Un cliente ingresa un nuevo producto
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
            // TODO Verificar que me sirve realmente de aca
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
                  // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                  // http.ClientRequest in node.js
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
    // Cart Sockets
    


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
    //     // TODO Verificar que me sirve realmente de aca
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
});
