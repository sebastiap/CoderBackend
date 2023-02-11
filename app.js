import express from "express";
// import ProductManager from "./src/ProductManager.js";
import path from 'path';
import { fileURLToPath } from "url";

// Mis routers
import ProductRouter from "./src/routes/product.router.js";
import CartRouter from "./src/routes/cart.router.js"

const app = express();
// Se agrega esto para asegurarnos que corra donde corra este codigo
// se utilize el path relativo a donde este corriendo
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
!  
// const manager = new ProductManager(path.join(dirname,"/data",'products.json'));

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

app.listen(8080, ()=> console.log('listening on port 8080'));
// app.get('/api/products/:idproducto',async(req,res) =>{
// const producto = parseInt(req.params.idproducto);

// let SearchedProduct = await manager.getProductById(producto);
// if (!SearchedProduct){
//     let text = "No se encontro ningun producto con el id " + producto;
//     res.send({error:{text}});

// }
// else {
//    res.send(SearchedProduct);
// }


// });

// app.get("/api/products",async(req,res) =>{

//     let limit = req.query.limit;
//     let fileproductos = await manager.getProducts();
//     if (limit){
//         let n = fileproductos.length;
//         if (n > limit) {
//             n = limit;
//         }
//         fileproductos = fileproductos.slice(0, n);
//     }
//     res.send(fileproductos);
// })


