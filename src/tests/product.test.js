import chai from "chai";
import supertest from "supertest";

import config from "../config/config.js"

const expect = chai.expect;
const requester = supertest("http://localhost:8080" );

const { body } = await requester.get('/api/session/current');

let createdProduct ={};
let idToDelete =0;


describe('Testing Router Productos',() => {
    describe('Testing Post Product',()=> {
        it('El endpoint /api/products/ debe permitir ingresar un nuevo producto',async () => {
            const testProduct = {
                "title":"Entradas Evento de Testing",
                "description":"Entradas preventa para el evento Geekuin Septiembre 2023",
                "price":4000,
                "thumbnail":"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Free_Geekguin.jpg/1200px-Free_Geekguin.jpg",
                "code":"TEST",
                "stock":25,
                "category":"Misc",
                "status":false
                }

        const {statusCode, ok, body} = await requester.post('/api/products/').send(testProduct);
        console.log(statusCode, ok, body);
        expect(statusCode).to.be.equal(200);
        expect(body).to.have.property('message');
        expect(body).to.have.property('newId');
        createdProduct = testProduct;
        idToDelete = body.newId;

        
 

        })
    })
});
describe('Testing Router Productos',() => {
    describe('Testing Delete Product',()=> {
        it('El endpoint /api/products/ debe permitir borrar el nuevo producto',async () => {

        const {statusCode, ok, body} = await requester.delete('/api/products/'+idToDelete);
        console.log(statusCode, ok, body);
        expect(statusCode).to.be.equal(200);
        expect(body).to.have.property('message');

        
 

        })
    })
});

