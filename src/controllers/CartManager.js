import { create as createService,getAll as getAllService,PopulateService,getByIdService,addQuantityService,updateService,deleteService,validate as validateService} from "../services/CartService.js";
import { customLogger } from "../logger/logger.js";
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

    create = async (products) => {
        try {
            let result =  await createService(products);
            this.idIndex = this.idIndex + 1
            return result;
            
        } catch (error) {
            return error;
        }
    }

    getAll = async() => {
        try {
            const searchedCart = await getAllService();
            return searchedCart;
        } catch (error) {
              return error;
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


    addProduct = async (cid,productId, quantity) => {

        try {
            //TODOZ ver error de headers aca vs Productos que anda bien
            const result = await addQuantityService(cid,productId, quantity);
            if (result == 1) {return "Product does not exist"}
            if (result == 2) {return "Product is incomplete. Some Values are missing"}
            if (result == 3) {return "Product does not exist"}
            if (result == 4) {return "Cart was not updated"}
            if (result == 5) {return 5}
        } catch (error) {
            req.logger.error(error);
            return "Some error occurred while updating.";
        }
    }

    addQuantity = async (cid,productId, quantity) => {
        try {
            const result = addQuantityService(cid,productId, quantity);
            return result;
        } catch (error) {
            req.logger.error(error);
        }

    }

    delete= async (cid) => {
        try {
            if (cid.length != 24) { return 'The Cart id is invalid'}
            let result = await deleteService(cid);
            if (result === 4){
                return "A cart with that id does not exist.";
            }
            return result;
        } catch (error) {
            return error;
        }

    }

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

    validate= (product) => {
       let result = validateService(product);
       return result;
    }
}