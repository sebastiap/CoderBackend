import dotenv from 'dotenv';
import {Command, program} from 'commander'

// dotenv.config();
// const Program = new Command();
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
    mail:process.env.MAIL,
    mailPassword:process.env.MAILPWD,
}