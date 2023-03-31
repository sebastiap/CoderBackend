import { Router } from "express";
import passport from "passport";
import {userModel} from '../../dao/models/user.model.js'
import { isValidPassword,publicAccess,createHash,passportCall } from "../../../utils.js";

const router = Router();
export default router;


router.get('/login',publicAccess, async (req, res) => {
    res.render('auth/login',{style:"login.css"})
   });
router.get('/reset',publicAccess, async (req, res) => {
    res.render('auth/reset',{style:"login.css"})
   });
router.get('/register',publicAccess, async (req, res) => {
    res.render('auth/register',{style:"login.css"})
   });

router.get('/fail-register',publicAccess, async (req, res) => {
    res.send({status:'error', message: 'Registration Fail.'});
});
router.get('/fail-login',publicAccess, async (req, res) => {
    res.send({status:'error', message: 'Login Fail.'});
});


router.post('/register',passport.authenticate('register',{failureRedirect: 'fail-register'}), async (req, res) => {
    // const {first_name, last_name,email,age,password,admin,role} = req.body;

    // try {
    //     const exist = await userModel.findOne({ email });
    //     if (exist) return res.status(400).send({status:'error', message:'the email is already registered in this site.'});

    //     const user = {
    //         first_name,
    //         last_name,
    //         email,
    //         age,
    //         admin,
    //         role,
    //         password: createHash(password),
    //     };

    //     await userModel.create(user);

        res.send({status:'success', message: 'user registered successfully.'});

    // } catch (error) {
    //     res.status(500).send({status:'error', message: error.message});
    // }
});

router.post('/login',passportCall('login'), async (req, res) => {
    if (!req.user) {res.status(400).send({status:'error', message:"Invalid credentials"})}
    const {email,password} = req.body;
    console.log(email,password);

    if (!email || !password) {res.status(400).send({status:'error', message:"Incomplete values"})}

    // try {
        // const user = await userModel.findOne({ email });
        // if (!user) return res.status(400).send({status:'error', message:'User not found.'});
        // if (!isValidPassword(user,password)) return res.status(401).send({status:'error', message:'incorrect password.'});
        // // if (user.password != password) return res.status(401).send({status:'error', message:'incorrect password.'});

        // delete user.password; 

        //  req.session.user = user;
         req.session.user = {
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            email: req.user.email,
            age: req.user.age,

         };

        // await userModel.create(user);

        res.send({status:'success', message: 'user was logged in successfully.'});

    // } catch (error) {
    //     res.status(501).send({status:'error', message: error.message});
    // }
});

router.post('/reset', async (req, res) => {
    const {email,password} = req.body;

    if (!email || !password) {res.status(400).send({status:'error', message:"Incomplete values"})}

    try {
        const user = await userModel.findOne({ email });
        if (!user) return res.status(400).send({status:'error', message:'User not found.'});
        user.password = createHash(password);

        await userModel.updateOne({email},user);

        res.send({status:'success', message: 'The password was reseted successfully.'});

    } catch (error) {
        res.status(501).send({status:'error', message: error.message});
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {return res.status(500).send({status:'error', message})}
    });
    res.redirect('/');
});

router.get('/github',
passport.authenticate('github',{scope: ['user:email']})
);

router.get('/github-callback',
passport.authenticate('github',{failureRedirect: '/login'}), async (req,res) => {
req.session.user = req.user;
res.redirect('/');
});