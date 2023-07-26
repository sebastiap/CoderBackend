import { createService,getAllService,getOneService,getByIdService,updateService,validateService,updateRoleService,updateLCService,deleteService } from "../services/user.service.js";
import {formatearProductos} from "../../utils.js"
import TicketController from "../controllers/ticket.controller.js";
import ProductController from "../controllers/product.controller.js";
import { customLogger } from "../logger/logger.js";

const ticketController = new TicketController;
const productController = new ProductController;


import config from "../config/config.js"
export default class UserController {
    constructor(path){
        this.idIndex = 0 ;
    }


    loginPage =  async (req, res) => {
        res.render('auth/login',{title:"Spika Games - Login",host:config.localhost,port:config.port,style:"login.css"})
       }

    resetPage = async (req, res) => {
        let reset = false;
        res.render('auth/reset',{title:"Resetear Password",host:config.localhost,port:config.port,reset,style:"login.css"})
       }
    resetTime =  async (req, res) => {
        let now = Date.now();
        let time = req.params.time;
        let limit = Number(time) + 3600000; 
        if (now < limit){
            let reset = true;
            res.render('auth/reset',{title:"Resetear Password",host:config.localhost,port:config.port,reset,style:"login.css"})
        }
        else
        {
            let timeerror = "El link utilizado ha expirado. Intenta nuevamente."
            res.render('auth/reset',{title:"Resetear Password",host:config.localhost,port:config.port,reset:false,timeerror,style:"login.css"})
        }
    }
    registerPage = async (req, res) => {
        res.render('auth/register',{title:"Spika Games - Registro",host:config.localhost,port:config.port,style:"login.css"})
       }

    failRegister = async (req, res) => {
        res.send({status:'error', message: 'Registration Fail.'});
    }
    failLogin = async (req, res) => {
        res.send({status:'error', message: 'Login Fail.'});
    }
    postRegister = async (req, res) => {
        customLogger(req);
        req.logger.info('user registered successfully.');
        res.send({status:'success', message: 'user registered successfully.'});
    }
    postLogin = async (req, res) => {
        if (!req.user) {res.status(400).send({status:'error', message:"Invalid credentials"})}
        const {email,password} = req.body;
    
        if (!email || !password) {res.status(400).send({status:'error', message:"Incomplete values"})}
             req.session.user = {
                first_name: req.user.first_name,
                last_name: req.user.last_name,
                email: req.user.email,
                age: req.user.age,
                role:req.user.role,
                cart:req.user.cart
    
             };
            customLogger(req);
            let result = await this.updateLC(req.user.email, Date.now());
            req.logger.info('user was logged in successfully.');
            res.send({status:'success', message: 'user was logged in successfully.'});
    }
    postReset = async (req, res) => {
        const {email,password} = req.body;

        if (!email || !password) {res.status(400).send({status:'error', message:"Incomplete values"})}

        try {
            const user = await this.getOne(email);
            if (!user) return res.status(401).send({status:'error', message:'User not found.'});
            
            if (!isValidPassword(user,password)) 
            {
                user.password = createHash(password);
                await this.update(email,user);
                customLogger(req);
                req.logger.info('The password was reseted successfully.');
                res.send({status:'success', message: 'The password was reseted successfully.'});
            }
            else {
                res.status(400).send('The new password must be different than the old one.');
            
        }


        } catch (error) {
            res.status(501).send({status:'error', message: error.message});
        }
    }

    logout = async (req, res) => {
        let user = req.session.user;
        req.session.destroy(err => {
            if (err) {return res.status(500).send({status:'error', message})}
        });
        customLogger(req);
        req.logger.info('User logout successfully.');
        currentCart = "Empty";
        let result = await this.updateLC(user.email, Date.now());
        res.redirect('/');
    }

    github = async (req,res) => {
        req.session.user = req.user;
        res.redirect('/products/');
    }

    create = async (cart) => {
        try {
            let result =  await createService(cart);
            this.idIndex = this.idIndex + 1
            return result;
            
        } catch (error) {
            return error;
        }
    }

    isAdmin = (username,password) => {
        let role = "User";
        if (username.slice(0,5) === 'admin'){
            role = 'admin';
        }
        else if (username === config.adminName  && password === config.adminPassword)
        {
            role = 'superadmin';
        }
        return role;
    }

    getAll = async(req,res) => {
        try {
            const users = await getAllService();
            let result = users.map((user) => ({"first_name":user.first_name, "last_name":user.last_name,"email":user.email,"role":user.role}));

            if (result === 'User not found'){
               return res.status(400).send({status: 'error',message: 'User not found'})
            }
            else {
                return res.status(200).send({status: 'ok',message: 'A lot of users', payload:result})
            }
        } catch (error) {
              return error;
        }

    }
    getAllforAdmin =  async (req, res) => {
        let users = [];
        let usersUF = await getAllService();
        users = usersUF.map((user) => ({"id":user._id,"first_name":user.first_name, "last_name":user.last_name,"email":user.email,"role":user.role}));
        users = users.filter(user => user.role !== "admin");
        const usercart = req.session.user.cart;
        const userisadmin = (req.session.user.role == 'admin' || req.session.user.role == 'superadmin');
        res.render('userRoles',{title:"Administracion de Usuarios",host:config.localhost,port:config.port,cart:usercart,admin:userisadmin,users,style:"styles.css"})
       }

    getByIdPremium = async (req, res) => {
        const userId = req.params.uid;
        let user = await getByIdService(userId);
        let newRole
        user.documents =  [{name:"Identificación"}, {name:"Comprobante de domicilio"}, {name:"Comprobante de estado de cuenta"}];
        let userDocuments = user.documents.map(doc => (doc.name));
        if (user.role == "User"){
            if (userDocuments.includes("Identificación") && userDocuments.includes("Comprobante de domicilio") &&  userDocuments.includes("Comprobante de estado de cuenta")){
                newRole = "premium"; 
            }
        }
        else if (user.role == "premium"){
            newRole = "User"; 
        } 
        else {
            res.status(400).send({status: 'error',message: 'The user is an administrator. His role cannot be changed.'});
            return;
        }
        this.updateRole(user.email,newRole).then((user) => {
            res.send({status: 'success',message: 'The user with id ' + userId + ' was updated successfully. Now his role is ' + newRole});
            });
        };

    getById = async(cid) => {
        const searchedUser= await getByIdService(cid);
        if (!searchedUser || searchedUser.length == 0) {
            return 'User not found';
          }
        return searchedUser;
    }

    mail = async (req, res) => {
        const mail = req.params.mail;
        let result = await  this.getOne(mail);
    
        if (result === 'User not found'){
            res.status(400).send({status: 'error',message: 'User not found'})
        }
        else {
            res.send(result);
        }
    }

    getOne = async(email) => {
        const user = await getOneService( email ); 
            return user;
        }

    realtimeproducts = async (req, res) => {
        let productos = [];
        const usercart = req.session.user.cart;
        const userisadmin = (req.session.user.role == 'admin' || req.session.user.role == 'superadmin');
        res.render('realTimeProducts',{title:"Administracion de Productos",host:config.localhost,port:config.port,cart:usercart,admin:userisadmin,productos,style:"styles.css"})
       }

    premiumproducts =  async (req, res) => {
        let productos = [];
        const usercart = req.session.user.cart;
        const userisadmin = false;
        const mail = req.session.user.email;
        let productosDB = await productController.getByUser(req.session.user.email);
        productos = formatearProductos(productosDB);
        const premium = (req.session.user.role == "premium");
        res.render('premiumProducts',{title:"Administracion de Productos Premium",host:config.localhost,port:config.port,cart:usercart,admin:userisadmin,premium,productos,mail,style:"styles.css"})
       };

    tickets = async (req, res) => {
        let unformatTickets = await ticketController.getAll();
        const usercart = req.session.user.cart;
        const userisadmin = (req.session.user.role == 'admin' || req.session.user.role == 'superadmin');
        let title = "Compras Realizadas en el sitio, de todos los usuarios";
        let userTickets = unformatTickets.map(ticket => ({
            code: ticket.code,
            purchase_datetime: ticket.purchase_datetime,
            amount: ticket.amount,
            user:ticket.purchaser
        }))
        res.render('tickets',{title:"Spika Games - Compras de Usuarios",host:config.localhost,port:config.port,Ptitle:title,userTickets,cart:usercart,admin:userisadmin,style:"styles.css"})
       }
    update = async(email,user) => {
            const uuser = await updateService( email,user ); 
                return uuser;
            }
    updateRole = async(email,role) => {
                const uuser = await updateRoleService( email,role ); 
                    return uuser;
            }
    updateLC = async(email,LC) => {
                const uuser = await updateLCService( email,LC ); 
                    return uuser;
            }
    validate = (suser) => {
            const uuser =  validateService( suser ); 
                return uuser;
            }
    delete = async (req, res) => {
        const email = req.params.email;
        const result = await this.deleteService(email);
        if (result === "A user with that id does not exist.") { res.send({status: 'error', message: 'A user with that id does not exist.'}) }
        else if (result === "The User id is invalid") { res.send({status: 'error', message: 'The User id is invalid.'}) }
        else {
        res.send({status: 'success',message: 'The user with id ' + email + ' was deleted.'});
        return result;
    }}

    deleteInactives = async (req, res) => {
        const allUsers = await this.getAll();
        let users = allUsers.map((user) => ({"email":user.email,"last_conection": user.last_conection ?? "0"}));
        let limit = Date.now() - 172800000; // 2dias
        let usersToDelete = users.filter(user => user.last_conection <  limit );
        console.log(usersToDelete);

         usersToDelete.forEach( async element => 
            {
                await this.delete(element.email);
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
    }

    upload =  (req, res) => {
        try {
            const userId = req.params.uid;
            if (!req.file){
                return res.status(400).send({status: 'error', message: 'No se pudo guardar el archivo.'});
            }
            console.log(req.file);
            let user = req.body;
            user.profile = req.file.path;
            res.send({status: 'success', message: 'Se ha logrado con exito guardar el archivo'})
        } catch (error) {
            console.log("error");
            console.log(error);
        }
    }

    
}