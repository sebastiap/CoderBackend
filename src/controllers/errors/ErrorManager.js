export default class CustomError {
    // Al ser metodo estatico no necesito una instancia de la clase para usarlo.
    static createError({name ="Error",cause, message,code=1}){
        let error = new Error(message,{cause});
        error.name = name;
        error.code = code;
        return error;
    } 
}