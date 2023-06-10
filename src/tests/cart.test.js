import chai from "chai";
import supertest from "supertest";

import config from "../config/config.js"

const expect = chai.expect;
const requester = supertest("http://localhost:8080" );

const { body } = await requester.get('/api/session/current');

let ProductToAdd ="640efafa130d57a081c9cfda";
let cartToTest = "645915bf52658afd49e11cac";


describe('Testing Router Cart',() => {
    describe('Testing Add Product in Cart',()=> {
        it('El endpoint /api/carts/ debe agregar a un carrito un nuevo producto.',async () => {

        const bodyProduct = {
            quantity: 10
            }

        const {statusCode, ok, _body} = await requester.post('/api/carts/'+cartToTest + '/product/' + ProductToAdd).send(bodyProduct);
        console.log(statusCode, ok, _body);
        expect(_body).to.have.property('message');
        expect(_body.message).to.be.contains("Product 640efafa130d57a081c9cfda added successfully to cart 645915bf52658afd49e11cac");



        
 

        })
    })
});
describe('Testing Router Cart',() => {
    describe('Testing Post Cart',()=> {
        it('El endpoint /api/carts/ debe devolver un carrito con un producto.',async () => {

        const {statusCode, ok, _body} = await requester.get('/api/carts/'+cartToTest);
        console.log(statusCode, ok, _body);
        console.log(JSON.stringify(_body.products[0].product));
        expect(statusCode).to.be.equal(200);
        expect(_body).to.have.property('_id');
        expect(_body).to.have.property('products');
        expect(_body.products).to.be.ok;
        let cartProducts = _body.products;
        expect(cartProducts.length).to.be.above(0);


        
 

        })
    })
});


describe('Testing Router Cart',() => {
    describe('Testing Empty Cart',()=> {
        it('El endpoint /api/products/ debe permitir vaciar un carrito',async () => {

        const {statusCode, ok, _body} = await requester.delete('/api/carts/'+cartToTest);
        console.log(statusCode, ok, _body);
        expect(statusCode).to.be.equal(200);
        expect(_body).to.have.property('message');
        expect(_body.message).to.be.contains("The cart with id 645915bf52658afd49e11cac is now empty.");

        
 

        })
    })
});

