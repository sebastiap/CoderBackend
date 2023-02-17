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


// Home

// import ProductManager from "./src/managers/ProductManager.js";
// let manager = new ProductManager();
app.get('/', async (req, res) => {
 // TODO sacar esto si uso axios
 let productos = await manager.getProducts();
 res.render('home',{productos,style:"styles.css"})
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
        socket.emit('Listado de Productos Actualizados',valor);
    });

    // Un cliente pide borrar un producto
    socket.on("Producto Borrado" , data =>{
        // let result = BorrarProducto(data);

        // Sin Asincronismo
        manager.deleteProductfromSocket(data);

        let valor  = manager.getProductsSocket();
        socket.emit('Listado de Productos Actualizados', valor);
            
        
    })
    // Un cliente ingresa un nuevo producto
    socket.on("Ingresar Nuevo Producto", producto => {
        try {
            axios.post("http://localhost:8080/api/products/",producto)
            .then(function () {
                let valor  = manager.getProductsSocket();
                socket.emit('Listado de Productos Actualizados',valor);
                socket.emit('Producto_Agregado',"Se ha insertado el nuevo producto exitosamente.");
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

});
