import path from 'path';
import { fileURLToPath } from "url";
// Se agrega esto para asegurarnos que corra donde corra este codigo
// se utilize el path relativo a donde este corriendo
const filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(filename);

import bcrypt from "bcrypt";
import passport from 'passport';

//Funciones Genericas
export const validarUrlIndividual = (product) => {
    // console.log(product);
    if (!product.thumbnail || product.thumbnail.length < 10 || product.thumbnail == "" || product.thumbnail == "Sin imagen" || typeof product.thumbnail != "string") {
        product.thumbnail = "https://picsum.photos/200/300";
}; 
};

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
        // TODOZ agregar validacion para usuario inexistente
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
        console.log(req.user,role);
    if (!req.user) return res.status(401).send({ error: 'Unauthorized' });
    if (req.user.role != role) return res.status(403).send({ error: 'You need to be an administrator to access this page.'});
    next();
}
};

export default __dirname;


