import { Router } from "express";
import UserManager from '../../controllers/UserManager.js';
import path from 'path';
import { fileURLToPath } from "url";

import nodemailer from 'nodemailer';
import config from "../../config/config.js";

const transport = nodemailer.createTransport({
    service:'gmail',
    port:587,
    auth:{
        user:config.mail,
        pass:config.mailPassword
    }
})

const router = Router();
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const manager = new UserManager(path.join(dirname,"../../data",'carrito.json'));

// TODOZ ???
// Crear un endpoint en el router de usuarios api/users/:uid/documents con el método POST que permita subir uno o múltiples archivos. Utilizar el middleware de Multer para poder recibir los documentos que se carguen y actualizar en el usuario su status para hacer saber que ya subió algún documento en particular.

// El middleware de multer deberá estar modificado para que pueda guardar en diferentes carpetas los diferentes archivos que se suban.
// Si se sube una imagen de perfil, deberá guardarlo en una carpeta profiles, en caso de recibir la imagen de un producto, deberá guardarlo en una carpeta products, mientras que ahora al cargar un documento, multer los guardará en una carpeta documents.

// Modificar el endpoint /api/users/premium/:uid   para que sólo actualice al usuario a premium si ya ha cargado los siguientes documentos:
// Identificación, Comprobante de domicilio, Comprobante de estado de cuenta

// En caso de llamar al endpoint, si no se ha terminado de cargar la documentación, 
//devolver un error indicando que el usuario no ha terminado de procesar su documentación. 
// (Sólo si quiere pasar de user a premium, no al revés)




// TODOZ Desde el router de /api/users, crear tres rutas:
// X GET  /  deberá obtener todos los usuarios, éste sólo debe devolver los datos principales como nombre, correo, tipo de cuenta (rol)

router.get('/',async (req, res) => {
    let usersUF = await manager.getAll();
    let result = usersUF.map((user) => ({"first_name":user.first_name, "last_name":user.last_name,"email":user.email,"role":user.role}));

    if (result === 'User not found'){
        res.status(400).send({status: 'error',message: 'User not found'})
    }
    else {
        res.status(200).send({status: 'ok',message: 'A lot of users', payload:result})
    }
    // res.send("result");
});

router.get('/:mail',async (req, res) => {
    const mail = req.params.mail;
    let result = await manager.getOne(mail);

    if (result === 'User not found'){
        res.status(400).send({status: 'error',message: 'User not found'})
    }
    else {
        res.send(result);
    }
});

// TODOZ X Mover la ruta suelta /api/users/premium/:uid a un router específico para usuarios en /api/users/
router.get('/premium/:uid', async (req, res) => {
    console.log("HOLA");
        const userId = req.params.uid;
        let user = await manager.getById(userId);
        let newRole
        user.documents =  [{name:"Identificación"}, {name:"Comprobante de domicilio"}, {name:"Comprobante de estado de cuenta"}];
        let userDocuments = user.documents.map(doc => (doc.name));
        // let userDocuments = ["Identificación","Comprobante de estado de cuenta","AlGO MAS","Comprobante de domicilio"];
        console.log(userDocuments);

        if (user.role == "User"){
            if (userDocuments.includes("Identificación") && userDocuments.includes("Comprobante de domicilio") &&  userDocuments.includes("Comprobante de estado de cuenta")){
                newRole = "premium"; 
            }
            else {
                // newRole = "premiun";
            }
        }
        else if (user.role == "premium"){
            newRole = "User"; 
        } 
        else {
            res.status(400).send({status: 'error',message: 'The user is an administrator. His role cannot be changed.'});
            return;
        }
        manager.updateRole(user.email,newRole).then((user) => {
            res.send({status: 'success',message: 'The user with id ' + userId + ' was updated successfully. Now his role is ' + newRole});
            });
        });
    
// TODOZ X (PROBAR CERCA DE LA FECHA) DELETE / deberá limpiar a todos los usuarios que no hayan tenido conexión en los últimos 2 días. (puedes hacer pruebas con los últimos 30 minutos, por ejemplo). 
// Deberá enviarse un correo indicando al usuario que su cuenta ha sido eliminada por inactividad
router.delete('/',async (req, res) => {
        const allUsers = await manager.getAll();
        let users = allUsers.map((user) => ({"email":user.email,"last_conection": user.last_conection ?? "0"}));
        let limit = Date.now() - 172800000; // 2dias
        // let limit = Date.now() - 3600000; // 1hora 
        let usersToDelete = users.filter(user => user.last_conection <  limit );

        await usersToDelete.foreach(element => 
            {
                manager.delete(element.email);
                let result = transport.sendMail({
                    from:"Spika Games - CoderNode",
                    to:element.mail,
                    subject:"Link de Recuperacion de Password",
                    html:`<div>
                    <h1>Cuenta Eliminada</h1>
                    <h1>Le informamos que su cuenta ha sido eliminada por estar inactiva por mas de 2 dias.</h1>
                    <img src="cid:Logo"/>
                    <p> Disculpe las molestias ocasionadas. Puede crear una cuenta nuevamente sin compromiso de compra.</p>
                    <div>`,
                    attachments:[{
                        filename:"SPIKAGAMES.png",
                        path:__dirname + "/src/public/img/SPIKAGAMES.png",
                        cid:"Logo"
                    }]
                });
            } )

        res.status(200).send({status: 'OK',message: 'Usuarios inactivos', payload:usersToDelete})
    // }
});
router.delete('/:cid',async (req, res) => {
        const cartid = req.params.cid;
        const result = await manager.delete(cartid);
        if (result === "A cart with that id does not exist.") { res.send({status: 'error', message: 'A cart with that id does not exist.'}) }
        else if (result === "The Cart id is invalid") { res.send({status: 'error', message: 'The Cart id is invalid.'}) }
        else {
        res.send({status: 'success',message: 'The cart with id ' + cartid + ' is now empty.'});
        return result;
}});
    

export default router;
