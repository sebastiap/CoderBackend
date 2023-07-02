import passport from "passport";
import GithubStrategy from 'passport-github2';
import local from 'passport-local';
import UserManager from "../controllers/UserManager.js";
import {createHash,isValidPassword} from "../../utils.js"

import config from "./config.js";
import CartManager from "../controllers/CartManager.js";

const LocalStrategy = local.Strategy;
const manager = new UserManager;
const cartmanager = new CartManager;

const initializePassport = () => {

    passport.use('register', new LocalStrategy({
        passReqToCallback: true,
        usernameField:'email'
    },async (req, username, password, done) => {
        const {first_name, last_name,email,age} = req.body;
        try {
            const user = await manager.getOne(username);
            if (user) {
                return done(null,false);
            }
            let role = manager.isAdmin(username,password);
            if (role == "superadmin") {
                    return done(null,false);
            }
            const resultCart = await cartmanager.aproveCreation(role,{"products":[]});

            const newUser = {
                first_name, 
                 last_name,
                 email,
                 age,
                 password:createHash(password),
                //  cart:cartId
            }
            if (resultCart){
                const cartId = resultCart._id;
                newUser["cart"] = cartId;
            }
            let result = await manager.create(newUser);
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
                let role = manager.isAdmin(username,password);
                if (role == "superadmin")
                {
                    const user = {};
                    user.email = 'Super Admin';
                    user.cart = ""
                    user.role = 'superadmin';
                    return done(null,user);

                }
                const user = await manager.getOne(username);
                if (!user) { 
                    req.logger.error('El usuario no existe.');
                    return done(null,false);   
                };
                if (!isValidPassword(user,password)) {return done(null,false)}
                if (role != 'User')
                {
                    user.role = role;
                }
                return done(null,user);
            } catch (error) {
                return done(`Error al Loguear usuario ${error}`);
            }

        }));

    passport.use('github', new GithubStrategy({
        clientID:config.githubId, 
        clientSecret:config.githubSecret,
        // callbackURL:'http://localhost:'+ config.port + '/auth/github-callback'
        callbackURL: config.localhost +':'+ config.port + '/auth/github-callback',
        redirect_uri:'http://localhost:'+ config.port + '/auth/github-callback'
    }, async (accessToken,refreshToken,profile,done) => {
        try {
            const user = await manager.getOne(profile._json.email);
            // const user = await UserManager.findOne({email:profile._json.email})
            if (!user) {

                const resultCart = await cartmanager.aproveCreation("User",{"products":[]});
                const newUser = {
                    first_name:profile._json.name,
                    last_name:'',
                    age:18,
                    email:profile._json.email,
                    password:'',
                    cart:resultCart._id
                }
            const result = await manager.create(newUser);
            done(null,result);
            }
            else {
                done(null,user);
            }
        } catch (error) {
            console.log(error);
            done(error);
            
        }
    }));
  
        passport.serializeUser((user,done)=> {
            done(null,user);

        });
        passport.deserializeUser(async(id,done) => {
            let user = await manager.getById(id);
            done(null,user);
        })
}

export default initializePassport;

