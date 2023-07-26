import fs  from 'fs';

export default class CartManager {
    constructor(path){
        this.carts = [];
        this.idIndex = 0 ;
        this.path = path;
    }
    get = async () => {
        try{
            if (fs.existsSync(this.path)) {
            let data = await fs.promises.readFile(this.path,'utf-8');
            const carts = await JSON.parse(data);
            this.idIndex = carts[carts.length-1].id + 1
            this.carts = carts;
            return carts;
        }
        else {
            console.warn("El archivo no existia al momento de ejecucion.");
            return [];
        }
    }
        catch(error){ 
            console.error("error:" , error); 
    }

    }

    create = async (products) => {
        const allCarts = await this.getCarts();

        let newCart = {"id":this.idIndex, "products":products};
        allCarts.push(newCart);
        await fs.promises.writeFile(this.path,JSON.stringify(allCarts))
    }
    getById = async(cid) => {
        const allCarts = await this.getCarts();
        const SearchedCart = allCarts.find((cart)=> cart.id === cid);
        if (!SearchedCart) {
            console.error('Not found');
            return 'Cart not found';
          }
        return SearchedCart;
    }

    addProduct = async (cid,productId, quantity) => {
        const cartToUpdate = await this.getCartById(cid);
        const allCarts = this.carts;
        let newQuantity = 1;
        let productToAdd = {};

        const SearchedCartindex = allCarts.findIndex((cart)=> cart.id === cid);
        if (SearchedCartindex < 0 ) {
            console.error('A cart with that id does not exist.');
            return 'A cart with that id does not exist.';
        }

        const SearchedProductindex = cartToUpdate.products.findIndex((prod)=> prod.id === productId);
        
        if (SearchedProductindex < 0 ) {
        newQuantity = quantity;
        productToAdd = {id: productId, quantity: newQuantity};
        
        }
        else {
            newQuantity = cartToUpdate.products[SearchedProductindex].quantity + quantity;
            productToAdd = {id: productId, quantity: newQuantity};
            cartToUpdate.products.splice(SearchedProductindex,1);
        }
        cartToUpdate.products.push(productToAdd);

        allCarts.splice(SearchedCartindex, 1);
        this.carts.push(cartToUpdate);

        await fs.promises.writeFile(this.path,JSON.stringify(allCarts));
        return 1;
    }

   
}