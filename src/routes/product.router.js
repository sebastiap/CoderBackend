import { Router } from "express";
import ProductManager from "../managers/ProductManager.js";
import path from 'path';
import { fileURLToPath } from "url";

// utilizo router para redireccionar y organizar mis llamadas.
const router = Router();

// Se agrega esto para asegurarnos que corra donde corra este codigo
// se utilize el path relativo a donde este corriendo
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export const manager = new ProductManager(path.join(dirname,"../../data",'productos.json'));

router.get("/",async(req,res) =>{

    let limit = req.query.limit;
    let fileproductos = await manager.getProductsDB();
    if (limit){
        let n = fileproductos.length;
        if (n > limit) {
            n = limit;
        }
        fileproductos = fileproductos.slice(0, n);
    }
    res.send(fileproductos);
})

router.get('/:pid',async(req,res) =>{
    const producto = parseInt(req.params.pid);
    
    // let SearchedProduct = await manager.getProductById(producto);
    let SearchedProduct = await manager.getProductByIdDB(producto);
    if (!SearchedProduct){
        let text = "No se encontro ningun producto con el id " + producto;
        res.send({error:{text}});
    
    }
    else {
       res.send(SearchedProduct);
    }
    
    
    });

router.post('/', async (req,res) => {
    const product = req.body;

    // let result = await manager.addProduct(product);
    let result = await manager.addProductDB(product);
    // console.log(result);
    if (result === 1){
        res.status(400).send({status:'error', message:'The code is already in used in another Product'});
    }
    else if (result === 2){
        res.status(400).send({status:'error', message:'A required field of the product you wish to enter is empty or was not sent.'});
        }
    else if (result === 3) {
        res.status(400).send({status:'error', message:'Some error occurred'});
    }
    else {    
        res.send({status: 'success', message:'A new product with id ' + product.code + ' was successfully created with id ' + product.id });
    }
    return result;
});

router.put('/:pid', async (req,res) => {
    try {
    // TODO validar errores 1 y 2
    // const id = parseInt(req.params.pid);
    const id = req.params.pid;
    const productToUpdate = req.body;
    // let result = await manager.updateProduct(id,productToUpdate);
    let result = await manager.updateProductDB(id,productToUpdate);
    if (result === 1){
        res.status(400).send({status:'error', message:'The code is already in used in another Product'});
    }
    else if (result === 2){
        res.status(400).send({status:'error', message:'A required field of the product you wish to enter is empty or was not sent.'});
        }
    else if (result === 3) {
        res.status(400).send({status:'error', message:'Some error occurred while updating.'});
    }
    else if (result === 4) {
        res.status(400).send({status:'error', message:'A product with the specified id was not found'});
    }
    else {    
        res.send({status: 'success',message: 'Product with the specified id was successfully updated'});
    }
} catch (error) {
        console.log(error.message);
}
});

router.delete('/:pid', async (req,res)=> {
    try {
 const id = parseInt(req.params.pid);
 let result = await manager.deleteProductDB(id);
 if (result === 4) {
    return res.status(400).send({status:'error',message:'A product with the specified id was not found'});
 }
 else{
    res.send({status: 'success', message: 'Product with the specified id was successfully deleted'});
 }
} catch (error) {
        console.log(error);
}

});

export default router;