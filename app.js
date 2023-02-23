import express from "express";

// Mis routers
// TODO si no uso manager sacar esto
import ProductRouter,{manager} from "./src/routes/product.router.js";
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
import { messageModel } from "./src/managers/dao/models/message.model.js";
// import { productModel } from "./src/managers/dao/models/product.model.js";
import { cartModel } from "./src/managers/dao/models/cart.model.js";
import messageManager from "./src/managers/MessageManager.js";


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
app.use('/api/products',ProductRouter);
app.use('/api/carts',CartRouter);

const httpServer = app.listen(8080, ()=> console.log('Listening on port 8080'));

// Agrego estructura de WebSocket
app.engine('handlebars',handlebars.engine());
app.set('views',__dirname+'/src/views');
app.set('view engine','handlebars');
app.use(express.static(__dirname+'/src/public'));
app.use(express.static('/',viewsrouter));

mongoose.connect("mongodb+srv://prueba:prueba@cluster0.mpljszi.mongodb.net/ecommerce?retryWrites=true&w=majority", error => {
    if (error) {
        console.log("Cannot Connect to Database", error);
        process.exit();
    }
    
    
});


//Funciones Genericas
const validarURL = (listadoProductos) => {
    //Validar por formulario o que la URL empiece con http
    let nuevoListado = [];
    listadoProductos.map((product => { 
        if (product.thumbnail.length < 10 || product.thumbnail == "" || product.thumbnail == "Sin imagen" || typeof product.thumbnail != "string") {
        product.thumbnail = "https://www.publicdomainpictures.net/pictures/280000/velka/not-found-image-15383864787lu.jpg";
    }}
    
    ))
    return listadoProductos;

}

// Home

app.get('/', async (req, res) => {

 // BORRAR - Implementacion anterior con fs
// let productos = validarURL(getproductos);
// mongoose.connect("mongodb+srv://prueba:prueba@cluster0.mpljszi.mongodb.net/ecommerce?retryWrites=true&w=majority", error => {
//     if (error) {
//         console.log("Cannot Connect to Database", error);
//         process.exit();
//     }
    
    
// });

let productos = await manager.getProductsDB();
res.render('home',{productos,style:"styles.css"})
// TODO pasar a los managers
// let result = messageModel.create({user:"algo@gmail.com",message:"un mensaje mas"});
// let result = cartModel.create({id:2,products:["1","2"]});
// manager.addProductDB({"title":"Regalo","description":"Un producto para regalar","price":"150","thumbnail":"https://img.freepik.com/foto-gratis/regalo-amarillo-lazo-rojo_1203-2121.jpg?w=2000","stock":"4","code":"REG1234","category":"Misc","status":true,"id":24})
// manager.deleteProductDB(22);
}
)

let messages  = [];
let msgmanager = new messageManager();
app.get('/chat', async (req, res) => {

    res.render('chat',{messages,style:"styles.css"})
   }
   )

// realTimeProducts
app.get('/realtimeproducts', async (req, res) => {
    let productos  = [];
    res.render('realTimeProducts',{productos,style:"styles.css"})
   }
   )


// app.post('/realtimeproducts', async (req, res) => {
//     console.log ("hice una especie de POST")
//     // let result = await  ProductManager.addProduct(req)
//     let productos  = manager.getProductsSocket();
//         res.render('realTimeProducts',{productos,style:"styles.css"})
//    }
// )

// // TODO Ver si lo uso
// app.delete('/realtimeproducts/:pid', (req, res) => {
//     const id = parseInt(req.params.pid);
//     let result = manager.deleteProductfromSocket(id);
//     if (result === 4) {
//         return res.status(400).send({status:'error',message:'A product with the specified id was not found'});
//      }
//      else{
//         let productos  = manager.getProductsSocket();
//         // console.log("productos", productos)
//         res.render('realTimeProducts',{productos,style:"styles.css"})
//      }
//    }
// )


// const esperarProductos = async(resultado) => {
//     async () => await axios.get("http://localhost:8080/api/products/")
//     let result =  await axios.get("http://localhost:8080/api/products/");
//     console.log("result interno: " + result);
//     resultado = result;
//     return resultado;
// };

// const BorrarProducto = async(data) => {
//     // let result = await manager.deleteProduct(data).then((resultado) => {return resultado});
//     // await axios.delete("http://localhost:8080/api/products/" + data)
//     await axios.delete("http://localhost:8080/realtimeproducts/" + data)
//     .then(() => {
//         let valor  = manager.getProductsSocket();
//         socket.emit('Listado de Productos Actualizados',valor);
//     })
//     .catch(() => { 
//         if (error.response) {
//             console.log(error.response.data);
//             console.log(error.response.status);
//             console.log(error.response.headers);
//         }

//     });
//     // console.log("Borre?", result.data);
//     return result;
// }

// Al crear esta instancia del Servidor de Socket IO, lo que estoy logrando es que este servidor 
// obtenga un habilidad adicional para utilizar Sockets
const io = new Server(httpServer);

io.on('connection',  (socket) => {

    // Un cliente se conecta
    socket.on('Client_Connect', message => {
        console.log(message);
        let valor  = manager.getProductsSocket();
        valor = validarURL(valor);
        socket.emit('Listado de Productos Actualizados',valor);
    });

    // Un cliente pide borrar un producto
    socket.on("Producto Borrado" ,async data =>{

        // Sin Asincronismo
        manager.deleteProductfromSocket(data);
     

        let valor  = manager.getProductsSocket();
        valor = validarURL(valor);
        socket.emit('Listado de Productos Actualizados', valor);
            
        
    })
    // Un cliente ingresa un nuevo producto
    socket.on("Ingresar Nuevo Producto", producto => {
        try {
            axios.post("http://localhost:8080/api/products/",producto)
            .then(function () {
                let valor  = manager.getProductsSocket();
                valor = validarURL(valor);
                socket.emit('Producto_Agregado',"Se ha insertado el nuevo producto exitosamente.");
                socket.emit('Listado de Productos Actualizados',valor);
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


    })
    // Chat Sockets
    socket.on("message", (data) => {
        messages.push(data);
        msgmanager.postMessages(data);
        io.emit("message_logs",messages)
    })

    
    socket.on("authenticated", user => {
        io.emit("message_logs",messages);
        io.emit("new_user_connected",user);
    })
});
