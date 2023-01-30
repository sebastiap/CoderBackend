import express from "express";
import ProductManager from "./src/ProductManager.js";
import path from 'path';
import { fileURLToPath } from "url";

const app = express();
// Se agrega esto para asegurarnos que corra donde corra este codigo
// se utilize el path relativo a donde este corriendo
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);


const manager = new ProductManager(path.join(dirname,"/data",'products.json'));
app.use(express.urlencoded({extended:true}));
app.get('/products/:idproducto',async(req,res) =>{
const producto = parseInt(req.params.idproducto);

let SearchedProduct = await manager.getProductById(producto);
if (!SearchedProduct){
    let text = "No se encontro ningun producto con el id " + producto;
    res.send({error:{text}});

}
else {
   res.send(SearchedProduct);
}


});

app.get("/products",async(req,res) =>{

    let limit = req.query.limit;
    let fileproductos = await manager.getProducts();
    if (limit){
        let n = fileproductos.length;
        if (n > limit) {
            n = limit;
        }
        fileproductos = fileproductos.slice(0, n);
    }
    res.send(fileproductos);
})

app.listen(8080, ()=> console.log('listening on port 8080'));