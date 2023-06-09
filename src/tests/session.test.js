import chai from "chai";
import supertest from "supertest";

import config from "../config/config.js"

const expect = chai.expect;
const requester = supertest("http://localhost:8080" );

const { body } = await requester.get('/api/session/current')

describe('Testing Session',() => {
    describe('Testing Login Page',()=> {
        it('El endpoint /api/session/ debe permitir acceder',async () => {

        const {statusCode, ok, body} = await requester.get('/auth/login');
        console.log(statusCode, ok, body);
 

        })
    })
});
describe('Testing Session',() => {
    describe('Testing Login in',()=> {
        it('El endpoint /api/session/ debe permitir loguear',async () => {
            const sessionMock = {
                email:"sebastiap@gmail.com",
                password:"1234"
            }

        const {statusCode, ok, body} = await requester.post('/auth/login').send(sessionMock);
        console.log(statusCode, ok, body);
        expect(statusCode).to.be.equal(200);
        expect(body).to.have.property('message');
 

        })
    })
});
describe('Testing Session',() => {
    describe('Testing Login incompleto',()=> {
        it('El endpoint /api/session/ debe permitir loguear',async () => {
            const sessionMock = {
                password:"1234"
            }

        const {statusCode, ok, body} = await requester.post('/auth/login').send(sessionMock);
        console.log(statusCode, ok, body);
        expect(statusCode).to.be.equal(401);
        expect(body).to.have.property('error');
 

        })
    })
});