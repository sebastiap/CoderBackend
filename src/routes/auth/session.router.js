import { Router } from "express";
import passport from "passport";
import UserManager from "../../controllers/UserManager.js";
import { publicAccess,createHash,passportCall } from "../../../utils.js";
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
        user.password = createHash(password);

        await manager.update(email,user);
        customLogger(req);
        req.logger.info('The password was reseted successfully.');
        res.send({status:'success', message: 'The password was reseted successfully.'});

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