import { create as createService,getAll as getAllService,PopulateService,getByIdService,addQuantityService,updateService,deleteService,validate as validateService} from "../services/cart.service.js"; 
import { create as createTicketService,getByUserService } from "../services/ticket.service.js";
import { customLogger } from "../logger/logger.js";
import { validarUrlIndividual } from "../../utils.js";
import config from "../config/config.js";
import errorDictionary from "../controllers/errors/enums.js";

import CustomError from "../controllers/errors/error.controller.js";
import {generateCartNotFoundInfo} from "../controllers/errors/info.js";


export default class CartManager {
    constructor(path){
        this.cart = {};
        this.idIndex = 0 ;
        this.path = path;
    }

    aproveCreation= async (role,products) => {
        if (role == "User"){
            let result =  await this.create(products);
            return result;
        }
        return false;
    }

    // create = async (products) => {
    //     try {
    //         let result =  await createService(products);
    //         this.idIndex = this.idIndex + 1
    //         return result;
            
    //     } catch (error) {
    //         return error;
    //     }
    // }
    create = async (req, res) => {
        const cartProducts = req.body.products;
            let result =  await createService(cartProducts);
            this.idIndex = this.idIndex + 1
        customLogger(req);
        req.logger.info('Cart added successfully');
        res.send({status: 'success',message: 'Cart added successfully'});
    }

    // getAll = async() => {
    //     try {
    //         const searchedCart = await getAllService();
    //         return searchedCart;
    //     } catch (error) {
    //           return error;
    //     }

    // }

    getAll = async (req, res) => {
        let result = await getAllService();
        res.send(result);
    }

    getByIdApi = async (req,res) => {
        const cartId = req.params.cid;
        this.cart = cartId;
            const searchedCart = await PopulateService(cartId);
            if (!searchedCart || searchedCart.length == 0) {
                customLogger(req);
                req.logger.error('Cart not found');
                res.status(400).send({status: 'error',message: 'Cart not found'})
              }
            else {
                res.send(searchedCart);
            }
    }

    getByIdDetailed = async(cid) => {
        try {
            this.cart = cid;
            const searchedCart = await PopulateService(cid);
            if (!searchedCart || searchedCart.length == 0) {
                return 'Cart not found';
              }
            return searchedCart;
        } catch (error) {
            return error;
        }

    }

    getById = async(cid) => {
        const searchedCart = await getByIdService(cid);
        if (!searchedCart || searchedCart.length == 0) {
            return 'Cart not found';
          }
        return searchedCart;
    }

    putProducts = async (req, res) => {
        const cartId = req.params.cid;
        const products = req.body;
        this.update(cartId,products).then((cart) => {
            customLogger(req);
            req.logger.info('The cart with id ' + cartId + ' was updated successfully with the required products.');
            res.send({status: 'success',message: 'The cart with id ' + cartId + ' was updated successfully with the required products.'});
            });
        }


    addProduct = async (req, res) => {
        const cartId = req.params.cid;
        const ProductId = req.params.pid;
        const quantity = parseInt(req.body.quantity);
        try {
            const result = await addQuantityService(cartId,ProductId,quantity);

        if (result === errorDictionary.CART_NOT_FOUND) { 
            throw CustomError.createError({
                name: 'CART NOT FOUND',
                cause: generateCartNotFoundInfo(),
                message: 'A cart with that id does not exist.',
                code:errorDictionary.CART_NOT_FOUND
                });
         }
        if (result === errorDictionary.CART_NOT_UPDATED) { 
            throw CustomError.createError({
                name: 'CART NOT FOUND',
                cause: generateCartNotFoundInfo(),
                message: 'The cart was not updated.',
                code:errorDictionary.CART_NOT_FOUND
                });
         }
        if (result === "A cart with that id does not exist.") { res.send({status: 'error', message: 'A cart with that id does not exist.'}) }
        if (result === "Product does not exist") { res.send({status: 'error', message: "Product does not exist"}) }
        if (result === "Some error occurred while updating.") { res.send({status: 'error', message: "Some error occurred while updating."}) }
        else {
            res.send({status: 'success',message: 'Product ' + ProductId + ' added successfully to cart ' + cartId + ''});
        };
    
            
    } catch (error) {
        customLogger(req);
        req.logger.error(error.cause);
            res.status(400).send({
                status:"error",
                error:error.name,
                message:error.cause,
                code:error.code
            });
    
        }
    }
    // addProduct = async (cid,productId, quantity) => {

    //     try {
    //         const result = await addQuantityService(cid,productId, quantity);
    //         if (result == 1) {return "Product does not exist"}
    //         if (result == 2) {return "Product is incomplete. Some Values are missing"}
    //         if (result == 3) {return "Product does not exist"}
    //         if (result == 4) {return "Cart was not updated"}
    //         if (result == 5) {return 5}
    //     } catch (error) {
    //         req.logger.error(error);
    //         return "Some error occurred while updating.";
    //     }
    // }

    // addQuantity = async (cid,productId, quantity) => {
    //     try {
    //         const result = addQuantityService(cid,productId, quantity);
    //         return result;
    //     } catch (error) {
    //         req.logger.error(error);
    //     }

    // }
    addQuantity = async (req, res) => {
        const cartId = req.params.cid;
        const ProductId = req.params.pid;
        const quantity = parseInt(req.body.quantity);
            const result = await addQuantityService(cartId,ProductId, quantity);
            customLogger(req);
            if (result === "A cart with that id does not exist.") { 
                req.logger.error('A cart with that id does not exist.');
                res.send({status: 'error', message: 'A cart with that id does not exist.'}) }
            else if (result === "An error ocurred with the id of the product to add.") { 
                req.logger.error('An error ocurred with the id of the product to add.');
                res.send({status: 'error', message: 'An error ocurred with the id of the product to add.'}) }
            else {
                req.logger.info('Product ' + ProductId + ' added successfully to cart ' + cartId + '.');
                res.send({status: 'success',message: 'Product ' + ProductId + ' added successfully to cart ' + cartId + '.'});
            };
        }

    // delete= async (cid) => {
    //     try {
    //         if (cid.length != 24) { return 'The Cart id is invalid'}
    //         let result = await deleteService(cid);
    //         if (result === 4){
    //             return "A cart with that id does not exist.";
    //         }
    //         return result;
    //     } catch (error) {
    //         return error;
    //     }

    // }
    delete= async (req, res) => {
        const cartid = req.params.cid;
        const result = await deleteService(cartid);
        customLogger(req);
        if (result === 4) { 
            req.logger.error('A cart with that id does not exist.');
            res.status(400).send({status: 'error', message: 'A cart with that id does not exist.'}) }
        else if (cartid.length != 24) { 
            req.logger.error('The Cart id is invalid.');
            res.status(400).send({status: 'error', message: 'The Cart id is invalid.'}) }
        else if (result === "The cart was already empty.") {
            req.logger.warning('The request was succesfull but the cart was already empty.');
            res.send({status: 'success', message: 'The request was succesfull but the cart was already empty.'}) 
        }
        else {
        req.logger.info('The cart with id ' + cartid + ' is now empty.');
        res.send({status: 'success',message: 'The cart with id ' + cartid + ' is now empty.'});
        return result;
}}

    update= async (cid,newprods) =>{
        let req = {};
        customLogger(req);
        try {
            let result = await updateService(cid,newprods);
            return result;
        } catch (error) {
            req.logger.error(error);
        }

    }
    deleteProduct = async (req, res) => {
        const cartId = req.params.cid;
        let productId = req.params.pid;
        if (typeof(productId) != String ) {
        }
        this.getById(cartId).then((cart) => {
            let oldProducts = cart.products;
            let newProducts = oldProducts.filter((prod) => prod.product != productId);
            updateService(cartId, newProducts).then((resupdate) => {
                if (resupdate.modifiedCount >= 1){
                    customLogger(req);
                    req.logger.info('The product with id ' + productId + ' was deleted successfully from cart ' + cartId + '.');
                    res.send({status: 'success',message: 'The product with id ' + productId + ' was deleted successfully from cart ' + cartId + '.'}); 
                }
                else {
                    customLogger(req);
                    req.logger.error("No product with that id was deleted");
                    res.send({status: 'error',message:"No product with that id was deleted" })}
            });
        })

}

    validate= (product) => {
       let result = validateService(product);
       return result;
    }

    cartpage = async (req, res) => {
        customLogger(req);
        let cartId = req.params.cid;
        let cartProm = await this.getByIdDetailed(cartId); 
        let cartArray = cartProm.products; 
        currentCart = cartId;
        let fixfromCart = [];
        let cartProducts = cartArray.map(function(productObj,index){
            if (productObj.product == null || productObj.product == undefined) {
                fixfromCart.push(index);
                return productObj = {title:"Producto Inexistente", description:"Producto Inexistente",
                    thumbnail:"https://thumbs.dreamstime.com/z/icono-de-producto-no-disponible-ilustraci%C3%B3n-vectores-plano-y-aislado-con-dise%C3%B1o-m%C3%ADnimo-sombra-larga-117825738.jpg"
                    , code:"NN", quantity:0,id:0} 
            }
            else {
            validarUrlIndividual(productObj.product);
            return productObj = {title:productObj.product.title, description:productObj.product.description,price:productObj.product.price,
                thumbnail:productObj.product.thumbnail, code:productObj.product.code, quantity:productObj.quantity,id:productObj.product.id}
            }
        })  
            if (fixfromCart.length > 0) {
                cartProducts = cartProducts.filter((word,index) => !(fixfromCart.includes(index)));
                let toFixCart = await this.getById(cartId);
                toFixCart = toFixCart.products.filter((word,index) => !(fixfromCart.includes(index)));
                // let newCart = toFixCart.map(p =>({"product":p.product, "quantity": p.quantity}))
                let newCart = this.validate(toFixCart);
                await this.update(cartId,newCart);
            }
        req.logger.info("Accediendo al Carro");
        const premium = (req.session.user.role == "premium");
        res.render('carts',{title:"Spika Games - Carro de Compras",host:config.localhost,port:config.port,cartProducts,cart:cartId,premium,style:"styles.css"})
       }

    createTicket = async (req, res) => {
        const cartid = req.params.cid;
        let user = ""
        if (req.session.user == undefined) {
            user = "POSTMAN"
        } 
        else {
            user = req.session.user.email; 
        }
        const cartData = {purchaser:user,cartid:cartid};
        const result = await createTicketService(cartData);
        customLogger(req);
        if (result === "No pudo realizarse la compra, ningun producto de los su carro posee stock.") { 
            
            req.logger.warning("No pudo realizarse la compra, ningun producto de los su carro posee stock.");
            res.status(400).send({status: 'error', message: "No pudo realizarse la compra, ningun producto de los su carro posee stock."}) }
        else {
            let productos = result.canceledList.map(prod => 
                ({title: prod.title,description: prod.description,price: prod.price,thumbnail:prod.thumbnail,stock:prod.stock,
                    code: prod.code,category: prod.category,id:prod.id,status:prod.status}));
            let ticketData = result.ticketData;
            req.logger.info("Compra exitosa!");
            if (productos.length > 0){
            req.logger.warning("Productos que no pudieron ser comprados : "+ productos.length ); 
            }
            res.render('purchase',{title:"Compra Exitosa!",host:config.localhost,port:config.port,cart:cartid,left:productos,ticketData,style:"styles.css"})
        }
        return result;
    }

    ticketpage =  async (req, res) => {
        customLogger(req);
        let cartId = req.params.cid;
        let user = req.session.user.email;
        let title = "Mis Compras";
        let unformatTickets = await getByUserService(user);
        let userTickets = unformatTickets.map(ticket => ({
            code: ticket.code,
            purchase_datetime: ticket.purchase_datetime,
            amount: ticket.amount,
        }))
        req.logger.info("Viendo tickets del usuario")
        const premium = (req.session.user.role == "premium");
        res.render('tickets',{title:"Spika Games - Compras Realizadas",host:config.localhost,port:config.port,Ptitle:title,userTickets,cart:cartId,premium,style:"styles.css"})
       }
    
}