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
    console.log(product);
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

export default __dirname;


