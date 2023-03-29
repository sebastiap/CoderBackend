import passport from "passport";
import local from 'passport-local';
import {userModel} from "../dao/models/user.model.js";
import {createHash,isValidPassword} from "../../utils.js"

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
                console.log('El usuario ya existe.');
                return done(null,false);
            }
            const newUser = {
                first_name,
                 last_name,
                 email,
                 age,
                 password:createHash(password)
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
            console.log(username,password);
            try {
                const user = await userModel.findOne({ email:username });
                console.log(user,username);
                if (!user) { 
                    console.log('El usuario no existe.');
                    return done(null,false);   
                };
                if (!isValidPassword(user,password)) {return done(null,false)}
                // return res.status(401).send({status:'error', message:'incorrect password.'};
                return done(null,user);
            } catch (error) {
                return done(`Error al registrar usuario ${error}`);
            }

        }))


        passport.serializeUser((user,done)=> {
            done(null,user);

        });
        passport.deserializeUser(async(id,done) => {
            let user = await userModel.findById(id);
            done(null,user);
        })
}

export default initializePassport;

