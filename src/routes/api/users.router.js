import { Router } from "express";
import UserManager from '../../controllers/UserManager.js';
import path from 'path';
import { fileURLToPath } from "url";

import nodemailer from 'nodemailer';
import config from "../../config/config.js";
import __dirname from '../../../utils.js';
import {uploader} from "../../../utils.js";

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

// TODOZ NO FUNCA
router.post('/:uid/documents',uploader.single('file'), (req, res) => {
    console.log("PASE");
    try {
        console.log("PASE");
        const userId = req.params.uid;
        if (!req.file){
            return res.status(400).send({status: 'error', message: 'No se pudo guardar el archivo.'});
        }
        console.log(req.file);
        let user = req.body;
        user.profile = req.file.path;
        // users.push(users)
        res.send({status: 'success', message: 'Se ha logrado con exito guardar el archivo'})
    } catch (error) {
        console.log("error");
        console.log(error);
    }
}
);

// Desde el router de /api/users, crear tres rutas:
// GET  /  deberá obtener todos los usuarios, éste sólo debe devolver los datos principales como nombre, correo, tipo de cuenta (rol)

router.get('/',async (req, res) => {
    let usersUF = await manager.getAll();
    let result = usersUF.map((user) => ({"first_name":user.first_name, "last_name":user.last_name,"email":user.email,"role":user.role}));

    if (result === 'User not found'){
        res.status(400).send({status: 'error',message: 'User not found'})
    }
    else {
        res.status(200).send({status: 'ok',message: 'A lot of users', payload:result})
    }
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

// Mover la ruta suelta /api/users/premium/:uid a un router específico para usuarios en /api/users/
router.get('/premium/:uid', async (req, res) => {
        const userId = req.params.uid;
        let user = await manager.getById(userId);
        let newRole
        user.documents =  [{name:"Identificación"}, {name:"Comprobante de domicilio"}, {name:"Comprobante de estado de cuenta"}];
        let userDocuments = user.documents.map(doc => (doc.name));
        // let userDocuments = ["Identificación","Comprobante de estado de cuenta","AlGO MAS","Comprobante de domicilio"];

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
    
// DELETE / deberá limpiar a todos los usuarios que no hayan tenido conexión en los últimos 2 días. (puedes hacer pruebas con los últimos 30 minutos, por ejemplo). 
// Deberá enviarse un correo indicando al usuario que su cuenta ha sido eliminada por inactividad
router.delete('/',async (req, res) => {
        const allUsers = await manager.getAll();
        let users = allUsers.map((user) => ({"email":user.email,"last_conection": user.last_conection ?? "0"}));
        let limit = Date.now() - 172800000; // 2dias
        // let limit = Date.now() - 3600000; // 1hora 
        let usersToDelete = users.filter(user => user.last_conection <  limit );
        console.log(usersToDelete);

         usersToDelete.forEach( async element => 
            {
                await manager.delete(element.email);
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
router.delete('/:email',async (req, res) => {
        const email = req.params.email;
        const result = await manager.delete(email);
        if (result === "A user with that id does not exist.") { res.send({status: 'error', message: 'A user with that id does not exist.'}) }
        else if (result === "The User id is invalid") { res.send({status: 'error', message: 'The User id is invalid.'}) }
        else {
        res.send({status: 'success',message: 'The user with id ' + email + ' was deleted.'});
        return result;
}});
    

export default router;
