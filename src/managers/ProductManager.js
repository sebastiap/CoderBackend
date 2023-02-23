import { randomInt } from 'crypto';
import fs  from 'fs';
import {productModel} from './dao/models/product.model.js'

//Esto es solo para borrarlo rapido y testear
// fs.writeFileSync(archivo,"[]");

export default class ProductManager{
    constructor(path){
        this.products = [];
        this.idIndex = 0 ;
        this.path = path;

    }
    
    addProduct = async(product) => {
        // Valida que no se repita el campo "code"
        try {
            let products = await this.getProducts();
            if (products.length === 0) {
                product.id = 0;
            }
            else {
                product.id = products[products.length-1].id + 1;
            }

            const existingProduct = products.find((prod)=> prod.code === product.code);
            if (existingProduct){
                console.error('El código del producto ya existe');
                return 1;
            }
    
            if (!product.title || !product.description || !product.price || !product.status 
                || !product.category || !product.code || !product.stock)
                {
                console.error("Producto invalido. Falta ingresar algun campo.");
                return 2;
            }
            // Agrega el producto al arreglo de productos
            products.push(product);

            console.log("Se agrego correctamente el producto con id", product.id);
            await fs.promises.writeFile(this.path,JSON.stringify(products));
            return product;


        } catch (error) {
            console.log("error:" , error);
            return 3;
        }

    }

    getProducts = async() => {
        try{        
            if (fs.existsSync(this.path)) {
                const data = await fs.promises.readFile(this.path,'utf-8');
                const prods = await JSON.parse(data);
                return prods;
            }
            else {
                console.warn("El archivo no existia al momento de ejecucion.");
                return [];
            }
        }
            catch(error){ 
                console.log("error:" , error); 
        }

    }

 

    getProductById =  async(id) => {
        const allProducts =  await this.getProducts();
        
        const SearchedProduct = allProducts.find((prod)=> prod.id === id);

        // Muestra un error en la consola en caso de no encontrar ningún coincidencia
        if (!SearchedProduct) {
            console.error('Not found');
            return;
          }
        
        return SearchedProduct;
    }

    updateProduct = async(id,product) => {
        try {
        const allProducts = await this.getProducts();
        console.log("Productos al momento de updetear :", allProducts)
        const SearchedProductindex = allProducts.findIndex((prod)=> prod.id === id);
        console.log("Encontre para updetear :", SearchedProductindex)
        if (SearchedProductindex == -1 ) {
            console.error('No existe con ese id');
            return 4;
        }
        product.id = id;
        // Otra forma seria con spread operator 
        // product = {id:id,...product}
        allProducts[SearchedProductindex] = product;
         // Para evitar problemas cuando el tamaño del archivo se reduce, lo trunco y lo recreo.
        // fs.truncateSync(this.path + archivo);
        await fs.writeFileSync(this.path,JSON.stringify(allProducts));
        console.log("Se actualizo satisfactoriamente el producto con id", id);

        return allProducts;
    } catch (error) {
            return 3;
    }

    }
    deleteProduct = async(id) => {
        const allProducts = await this.getProducts();
        const SearchedProductindex = allProducts.findIndex((prod)=> prod.id === id);
        if (SearchedProductindex ==-1 ) {
            console.error('No existe un producto con ese id');
            return 4;
        }
        allProducts.splice(SearchedProductindex, 1);
        console.log("Se elimino satisfactoriamente el producto con id", id);

        // Para evitar problemas cuando el tamaño del archivo se reduce, lo trunco y lo recreo.
        // fs.truncateSync(this.path + archivo);
        await fs.writeFileSync(this.path,JSON.stringify(allProducts));
        return allProducts;
    }

    // SocketSyncMethods
    getProductsSocket = () => {
        try{        
            if (fs.existsSync(this.path)) {
                const data =  fs.readFileSync(this.path,'utf-8');
                const prods = JSON.parse(data);
                return prods;
            }
            else {
                console.warn("El archivo no existia al momento de ejecucion.");
                return [];
            }
        }
            catch(error){ 
                console.log("error:" , error); 
        }

    }

    deleteProductfromSocket = (id) => {
        const allProducts = this.getProductsSocket();

        // console.log("Productos al momento de eliminar :", allProducts)
        const SearchedProductindex = allProducts.findIndex((prod)=> prod.id === id);
        // console.log("Encontre para eliminar :", SearchedProductindex)
        if (SearchedProductindex ==-1 ) {
            console.error('No existe un producto con ese id');
            return 4;
        }
        allProducts.splice(SearchedProductindex, 1);
        console.log("Se elimino satisfactoriamente el producto con id", id);
        // console.log("Los productos que quedaron son :", allProducts);

        // Para evitar problemas cuando el tamaño del archivo se reduce, lo trunco y lo recreo.
        // fs.truncateSync(this.path + archivo);
        fs.writeFileSync(this.path,JSON.stringify(allProducts));
        return allProducts;
    }

        // MongoDBMethods
        // let result = productModel.create({"title":"Regalo","description":"Un producto para regalar","price":"150","thumbnail":"https://img.freepik.com/foto-gratis/regalo-amarillo-lazo-rojo_1203-2121.jpg?w=2000","stock":"4","code":"REG123","category":"Misc","status":true,"id":22});
        addProductDB = async(product) => {
            // Valida que no se repita el campo "code"
            try {
                if (!product.title || !product.description || !product.price || !product.status 
                    || !product.category || !product.code || !product.stock)
                    {
                    console.error("Producto invalido. Falta ingresar algun campo.");
                    return 2;
                }
    
                const existingProduct = await productModel.find({code:product.code});
                if (existingProduct.length > 0){
                    console.error('El código del producto ya existe');
                    return 1;
                }

                const total = productModel.find().sort({"_id":-1}).limit(1);
                console.log(total);
                product.id = randomInt(1000);

                let result = await productModel.create(product);
                return result;
    
    
            } catch (error) {
                console.log("Error al insertar en MongoDB:" , error);
                return 3;
            }
    
        }
    
        getProductsDB = async() => {
            try{        
               let resultDB = await productModel.find();
               return resultDB;
            }
                catch(error){ 
                    console.log("Error al consultar en MongoDB:" , error); 
            }
    
        }
    
     
    
        // getProductByIdDB =  async(id) => {
        // try {
        //     const SearchedProduct = await productModel.findOne({id:id} );
        //     console.error("s",SearchedProduct);
        //     if (SearchedProduct != []){
        //         return SearchedProduct;
        //     }
        //     else{
        //         console.error('Error al consultar en MongoDB:');
        //         return 1;
        //     }
        // } catch (error) {
        //     console.error('Not found');
        //     return;
        // }      
          
      
        // }
    
        updateProductDB = async(pid,product) => {
            try {
            product.id = pid;
            let updatedProduct = await productModel.replaceOne({_id: pid}, product);
            if (updatedProduct.modifiedCount != 1) {
                return 4;
            }
            console.log("update", updatedProduct);
            return updatedProduct;
        } catch (error) {
            console.log("error", error);
                return 3;
        }
    
        }
        deleteProductDB = async(id) => {
            try {
                let resultDB = await productModel.deleteOne({id: id});
                console.log(resultDB);
                if (resultDB.deletedCount === 0){
                    console.error('No existia un producto con ese id para ser borrado.');
                    return 4;
                } 
                else{
                    return 1;
                }
                return resultDB;
            } catch (error) {
                console.error('Error al borrar en MongoDB:');
            }

        }
}

const test = async () => {


// Se creará una instancia de la clase “ProductManager”
let productos = new ProductManager;
//Se llamará “getProducts” recién creada la instancia, debe devolver un arreglo vacío []
let compra = await productos.getProducts();


console.log("\n* Se creará una instancia de la clase 'ProductManager' y Se llamará “getProducts” recién creada la instancia, debe devolver un arreglo vacío []");
console.log("Productos:", compra,"\n");

// Se llamará al método “addProduct” con los campos:
let ProductoPrueba = {
    title : 'producto prueba',
    description : 'Este es un producto prueba',
    price : 200,
    thumbnail : 'Sin imagen',
    code : 'abc123',
    stock : 25,
}
// El objeto debe agregarse satisfactoriamente con un id generado automáticamente SIN REPETIRSE
console.log("* Se llamará al método “addProduct”, el objeto debe agregarse satisfactoriamente con un id generado automáticamente SIN REPETIRSE");
await productos.addProduct(ProductoPrueba);

//Se llamará el método “getProducts” nuevamente, esta vez debe aparecer el producto recién agregado
compra =  await productos.getProducts();
console.log("\n* Se llamará el método “getProducts” nuevamente, esta vez debe aparecer el producto recién agregado \n");
console.log("Productos:", compra);

//Se evaluará que getProductById devuelva error si no encuentra el producto o el producto en caso de encontrarlo
console.log("\n* Si busco un producto no existente... ");
await productos.getProductById(10);

console.log("\n* Si busco el producto que ingrese...");
let seleccionado = await productos.getProductById(0);
console.log("Producto seleccionado:", seleccionado)

console.log("\n* Ingreso 3 productos de relleno...");
let Producto1 = {
    title : 'producto 1',
    description : 'Este es el primer producto extra.',
    price : 1200,
    thumbnail : 'Sin imagen',
    code : 'abc1',
    stock : 25,
}
let Producto2 = {
    title : 'producto 2',
    description : 'Este es el segundo producto extra.',
    price : 2000,
    thumbnail : 'Sin imagen',
    code : 'abc2',
    stock : 25,
}
let Producto3 = {
    title : 'producto 3',
    description : 'Este es el tercer producto extra.',
    price : 3200,
    thumbnail : 'Sin imagen',
    code : 'abc3',
    stock : 25,
}


await productos.addProduct(Producto1);
await productos.addProduct(Producto2);
await productos.addProduct(Producto3);

compra = await productos.getProducts();
console.log("\n* Se llamará el método “getProducts” nuevamente, esta vez deben aparecer 3 productos mas. \n");
console.log("Productos:", compra);

let ProductoUpdeteado = {
    title : 'producto Updeteado',
    description : 'Este es un producto prueba pero nuevo',
    price : 3200,
    thumbnail : 'Sin imagen',
    code : 'abc3',
    stock : 25,
}

console.log("\n* Se llamará al método “updateProduct” y se intentará cambiar un campo de algún producto, se evaluará que no se elimine el id y que sí se haya hecho la actualización. \n");
console.log("\n* Se actualizara el producto de id 3 \n");
await productos.updateProduct(3,ProductoUpdeteado);
console.log("Productos:", compra);

console.log("\n* Se llamará al método “deleteProduct”, se evaluará que realmente se elimine el producto \n");
console.log("\n* Se eliminara el producto de id 2 \n");
// await productos.deleteProduct(2);

console.log("\n* Se llamará nuevamente al método “deleteProduct”, se evaluará que arroje un error en caso de no existir el producto \n");
console.log("\n* Se intentara eliminar el producto de id 15 \n");
// await productos.deleteProduct(15);

console.log("\n* Se llamará el método “getProducts” para verificar el estado final. \n");
compra =  await productos.getProducts();
console.log("Productos:", compra);
}

// Solo para probar y cargar el archivo
// test();