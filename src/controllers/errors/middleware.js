import errorDictionary from './enums.js'

export default (error,req,res,next) => {

    switch(error.code){
        case errorDictionary.PRODUCT_CODE_DUPLICATED:
            res.status(400).send({
                status:"error",
                error:error.name,
                cause:error.cause,
            });
            break;
        case errorDictionary.PRODUCT_DONT_EXIST:
            res.status(400).send({
                status:"error",
                error:error.name});
            break;
        default:
            res.status(400).send({
                status:"error",
                error:"unhandled error"});
            break;
    }
    next()

}