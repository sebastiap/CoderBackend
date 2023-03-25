import { Router } from "express";
import {userModel} from '../../dao/models/user.model.js'
import { createHash,isValidPassword } from "../../../utils.js";

const router = Router();
export default router;

router.get('/login', async (req, res) => {
    res.render('auth/login',{style:"styles.css"})
   });
router.get('/register', async (req, res) => {
    res.render('auth/register',{style:"styles.css"})
   });

router.post('/register', async (req, res) => {
    const {first_name, last_name,email,age,password} = req.body;

    try {
        const exist = await userModel.findOne({ email });
        if (exist) return res.status(400).send({status:'error', message:'the email is already registered in this site.'});
        console.log(createHash(password));

        const user = {
            first_name,
            last_name,
            email,
            age,
            // password:createHash(password),
            password,
        };

        await userModel.create(user);

        res.send({status:'success', message: 'user registered successfully.'});

    } catch (error) {
        res.status(500).send({status:'error', message: error.message});
    }
});

router.post('/login', async (req, res) => {
    const {email,password} = req.body;

    if (!email || !password) {res.status(400).send({status:'error', message:"Incomplete values"})}

    try {
        const user = await userModel.findOne({ email });
        if (!user) return res.status(400).send({status:'error', message:'User not found.'});
        // if (!isValidPassword(user,password)) return res.status(401).send({status:'error', message:'incorrect password.'});
        if (user.password != password) return res.status(401).send({status:'error', message:'incorrect password.'});

        delete user.password;

         req.session.user = user;

        await userModel.create(user);

        res.send({status:'success', message: 'user was logged in successfully.'});

    } catch (error) {
        res.status(501).send({status:'error', message: error.message});
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {return res.status(500).send({status:'error', message})}
    });
    res.redirect('/');
})