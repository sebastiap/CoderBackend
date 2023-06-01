import path from 'path';
import { fileURLToPath } from "url";
// Se agrega esto para asegurarnos que corra donde corra este codigo
// se utilize el path relativo a donde este corriendo
const filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(filename);

import bcrypt from "bcrypt";
import passport from 'passport';

import {faker} from '@faker-js/faker';

//Funciones Genericas
export const validarUrlIndividual = (product) => {
    if (!product.thumbnail || product.thumbnail.length < 10 || product.thumbnail == "" || product.thumbnail == "Sin imagen" || typeof product.thumbnail != "string") {
        product.thumbnail = "https://picsum.photos/200/300";
}; 
};

export const formatearProductos = (productos) => {
    let result = productos.map(prod => ({title: prod.title,description: prod.description,price: prod.price,thumbnail:prod.thumbnail,stock:prod.stock,code: prod.code,category: prod.category,id:prod.id,owner:prod.owner}))
    return result;
}

export const validarURL = (listadoProductos) => {
    //Validar por formulario o que la URL empiece con http
    listadoProductos.map((product => { 
        validarUrlIndividual(product);
    }
    
    ))
    return listadoProductos;

}

//Funciones de encriptacion
export const createHash = (password) => 
bcrypt.hashSync(password,bcrypt.genSaltSync(10));

export const isValidPassword  = (user,password ) => 
    bcrypt.compareSync(password,user.password);


// Funciones de Validacion de Acceso
export const publicAccess = (req, res,next) => {
    if (req.session.user) return res.redirect('/products/');
    next();
};

export const privateAccess = (req, res,next) => {

    if (!req.session.user) return res.redirect('/auth/login');
    next();
};
export const passportCall = (strategy) => {
    return async (req, res, next) => {
        passport.authenticate(strategy,function(err, user, info) {

        if (err) return next(err);
        if (!user) {
            return res.status(401).send({error:info.message?info.message:info.toString()});
        }
    req.user =user;
    next();
})(req, res, next);
}
};
export const authorizationCall = (role) => {
    return async (req, res, next) => {
    let userRole = req.session.user.role;
    if (userRole === 'superadmin') {userRole = 'admin'}
    if (!req.session.user) return res.status(401).send({ error: 'Unauthorized' });
    if (userRole != role) return res.status(403).send({ error: 'Your role is not allowed to access this page.'});
    next();
}
};

export const generateProducts = () => {
faker.locale = 'es';
// const numberOfProducts = parseInt(faker.random.numeric(1,{
//     bannedDigits: ["0"]
// }));
// for (let i = 0; i < numberOfProducts; i++) {
//     product.push();
// }

return {
    "id":faker.database.mongodbObjectId(),
    "title": faker.commerce.product(),
    "description": faker.commerce.productDescription(),
    "price": faker.commerce.price(100,1500),
    "thumbnail": faker.image.imageUrl(),
    "stock": faker.commerce.price(10,200),
    "code": faker.commerce.product()+ faker.random.numeric(4),
    "category": "Misc",
    "status": true,
}
}

export default __dirname;


