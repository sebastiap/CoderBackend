import dotenv from 'dotenv';
import {Command, program} from 'commander'

program.option('--mode <mode>','variable para identificar el ambiente');
program.parse();
const environment = program.opts().mode;

dotenv.config({
    path:environment==="DEVELOPMENT"?"./env/.env.development":"./env/.env.production"
});

export default {
    port:process.env.PORT,
    mongoUrl:process.env.MONGO_URL,
    adminName:process.env.ADMIN_NAME,
    adminPassword:process.env.ADMIN_PASSWORD,
    persistance:process.env.PERSISTANCE,
    githubId:process.env.GITHUBID,
    githubSecret:process.env.GITHUBSECRET,
    mail:process.env.MAIL,
    mailPassword:process.env.MAILPWD,
    environment:environment,
    localhost:process.env.LOCALHOST
}