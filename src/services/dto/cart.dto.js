export default class cartDTO {
    constructor(cart){
        this.formatted = cart.map(p =>({"product":p.product, "quantity": p.quantity}))
    }
};