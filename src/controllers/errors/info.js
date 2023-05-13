export const generateInvalidProductInfo = () => {
    return "Una o mas propiedades del producto a insertar no fueron enviadas.";
}

export const generateduplicatedProductInfo = () => {
    return "El codigo de producto esta duplicado.";
}
export const generateDatabaseErrorInfo = () => {
    return "Ha ocurrido un error al persistir en la base de datos.";
}
export const generateProdNotFoundInfo = () => {
    return "No se ha encontrado un producto con ese ID.";
}
export const generateCartNotFoundInfo = () => {
    return "No se ha encontrado un Carrito con ese ID.";
}