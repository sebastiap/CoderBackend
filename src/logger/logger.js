import winston from "winston";
import config from "../config/config.js";

const customLevelOptions = {
levels:{
    fatal:0,
    error:1,
    warning:2,
    info:3,
    http:4,
    debug:5,
},
colors:{
    fatal:"bgRed",
    error:"red",
    warning:"yellow",
    info:"green",
    http:"blue",
    debug:"white",
}

}
let logger ;
if (config.environment === "DEVELOPMENT"){
    logger = winston.createLogger({
        levels:customLevelOptions.levels,
        transports:[
            new winston.transports.Console({level: 'debug', 
            format: winston.format.combine(
                winston.format.colorize({colors: customLevelOptions.colors}),
                winston.format.simple()
            )
            })
        ],
    })
}
else {
    logger = winston.createLogger({
        levels:customLevelOptions.levels,
        transports:[
            new winston.transports.Console({level: 'info', 
            format: winston.format.combine(
                winston.format.colorize({colors: customLevelOptions.colors}),
                winston.format.simple()
            )
            }),
            new winston.transports.File({filename:'./errors.log',level: 'error',format: winston.format.simple()})
        ],
    })
}

export const addLogger = (req,res,next) =>
{
    req.logger = logger;
    req.logger.http(`${req.method} en ${req.url} - ${new Date().toLocaleTimeString()}` );
    next();
}

export const customLogger = (req) =>
{
    req.logger = logger;
    req.logger.http(`${req.method} en ${req.url} - ${new Date().toLocaleTimeString()}` );
    return;
}