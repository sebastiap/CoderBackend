import passport from "passport";
import GithubStrategy from 'passport-github2';
import local from 'passport-local';
import {userModel} from "../dao/models/user.model.js";
import {cartModel} from "../dao/models/cart.model.js";
import {createHash,isValidPassword} from "../../utils.js"

import config from "./config.js";


const LocalStrategy = local.Strategy;

const initializePassport = () => {

    passport.use('register', new LocalStrategy({
        passReqToCallback: true,
        usernameField:'email'
    },async (req, username, password, done) => {
        const {first_name, last_name,email,age} = req.body;
        try {
            const user = await userModel.findOne({email:username});
            if (user) {
                return done(null,false);
            }
            const resultCart = await cartModel.create({"products":[]});
            const cartId = resultCart._id;
            const newUser = {
                first_name, 
                 last_name,
                 email,
                 age,
                 password:createHash(password),
                 cart:cartId
            }
            let result = await userModel.create(newUser);
            return done(null,user);

        } catch (error) {
            return done(`Error al registrar usuario ${error}`);
        }
    }));

    passport.use('login', new LocalStrategy({
        usernameField:'email'
        },
        async (username, password, done) => {
            try {
                if (username === config.adminName  && password === config.adminPassword)

                {
                    const user = {};
                    user.email = 'Super Admin';
                    user.role = 'superadmin';
                    return done(null,user);

                }

                const user = await userModel.findOne({ email:username });
                if (!user) { 
                    console.log('El usuario no existe.');
                    return done(null,false);   
                };
                if (!isValidPassword(user,password)) {return done(null,false)}
                if (user.email.slice(0,5) === 'admin'){
                    user.role = 'admin';
                }
                else if (user.email === user.adminName  && password === user.adminPassword)
                {
                    user.role = 'superadmin';
                }
                return done(null,user);
            } catch (error) {
                return done(`Error al registrar usuario ${error}`);
            }

        }));

    passport.use('github', new GithubStrategy({
        clientID:'Iv1.6b56347129836044', 
        clientSecret:'36c2ae35bc4693256579d5320928d4a0b83412cc',
        callbackURL:'http://localhost:'+ config.port + '/auth/github-callback'
    }, async (accessToken,refreshToken,profile,done) => {
        try {
            const user = await userModel.findOne({email:profile._json.email})
            if (!user) {
                const resultCart = await cartModel.create({"products":[]});
                const newUser = {
                    first_name:profile._json.name,
                    last_name:'',
                    age:18,
                    email:profile._json.email,
                    password:'',
                    cart:resultCart._id
                }
            const result = await userModel.create(newUser);
            done(null,result);
            }
            else {
                done(null,user);
            }
        } catch (error) {
            done(error);
            
        }
    }));
  
        passport.serializeUser((user,done)=> {
            done(null,user);

        });
        passport.deserializeUser(async(id,done) => {
            let user = await userModel.findById(id);
            done(null,user);
        })
}

export default initializePassport;

