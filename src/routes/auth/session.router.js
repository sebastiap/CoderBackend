import { Router } from "express";
import passport from "passport";
import UserManager from "../../controllers/UserManager.js";
import { publicAccess,createHash,passportCall, isValidPassword } from "../../../utils.js";
import config from "../../config/config.js";

import { customLogger } from "../../logger/logger.js";

const router = Router();
const manager = new UserManager;
export default router;


router.get('/login',publicAccess, async (req, res) => {
    res.render('auth/login',{title:"Spika Games - Login",port:config.port,style:"login.css"})
   });
router.get('/reset',publicAccess, async (req, res) => {
    res.render('auth/reset',{title:"Resetear Password",port:config.port,style:"login.css"})
   });

router.get('/reset/:time',publicAccess, async (req, res) => {
    let now = Date.now();
    let limit = time + 3600000; 
    let time = req.params.time;
    console.log(now,limit,time);
    if (now < limit){
        res.render('auth/reset',{title:"Resetear Password",port:config.port,style:"login.css"})
    }
    else
    {
        res.send({status:'error', message: 'Your reset link has expired. Please try again, a new link will be created is you access ' + `http://localhost:${config.port}/mail`});
    }
});
router.get('/register',publicAccess, async (req, res) => {
    res.render('auth/register',{title:"Spika Games - Registro",port:config.port,style:"login.css"})
   });

router.get('/fail-register',publicAccess, async (req, res) => {
    res.send({status:'error', message: 'Registration Fail.'});
});
router.get('/fail-login',publicAccess, async (req, res) => {
    res.send({status:'error', message: 'Login Fail.'});
});


router.post('/register',passport.authenticate('register',{failureRedirect: 'fail-register'}), async (req, res) => {
        customLogger(req);
        req.logger.info('user registered successfully.');
        res.send({status:'success', message: 'user registered successfully.'});
});

router.post('/login',passportCall('login'), async (req, res) => {
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
        req.logger.info('user was logged in successfully.');
        res.send({status:'success', message: 'user was logged in successfully.'});
});

router.post('/reset', async (req, res) => {
    const {email,password} = req.body;

    if (!email || !password) {res.status(400).send({status:'error', message:"Incomplete values"})}

    try {
        const user = await manager.getOne(email);
        if (!user) return res.status(400).send({status:'error', message:'User not found.'});
        let oldPassword = user.password;
        let newPassword = createHash(password);
        user.password = createHash(password);
        console.log(oldPassword,newPassword);
        console.log(password);
        console.log(!isValidPassword(user,password));
        console.log(user.password);
        console.log(!isValidPassword(user,oldPassword));

        if (!isValidPassword(user,password)) 
        ;
        // if (!isValidPassword(user,newPassword))
        {
        //     await manager.update(email,user);
        //     customLogger(req);
        //     req.logger.info('The password was reseted successfully.');
        //     res.send({status:'success', message: 'The password was reseted successfully.'});
        // }
        // else {
            res.send({status:'error', message: 'The new password must be different than the old one.'});
        // 
    }


    } catch (error) {
        res.status(501).send({status:'error', message: error.message});
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {return res.status(500).send({status:'error', message})}
    });
    customLogger(req);
    req.logger.info('User logout successfully.');
    currentCart = "Empty";
    res.redirect('/');
});

router.get('/github',
passport.authenticate('github',{scope: ['user:email']})
);

router.get('/github-callback',
passport.authenticate('github',{failureRedirect: '/login'}), async (req,res) => {
req.session.user = req.user;
res.redirect('/products/');
});