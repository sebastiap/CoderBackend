const socket = io();
var url_string = window.location;
var port = url_string.port;

const deleteCart = async (id) => {
  let qdata = {id:id};
  socket.emit("Borrar_Producto_Carro" , qdata);
};
const QuantityChange = async (id,q) => {
  let qdata = {id:id, quantity:q};
  socket.emit("Cambiar_Cantidad_Carro" , qdata);
};

const AddtoCart = async (productId) => {
  let stringId = productId;
  let activeUser;
  let productToAdd = await axios.get('http://localhost:'+ port + '/api/products/'+stringId);
  let dataid = productToAdd.data[0]._id;
  let owner = productToAdd.data[0].owner;
  console.log(productToAdd);

  let putData = {
    "quantity":1,
    "product":dataid,
    "title":productToAdd.data[0].title,
    };
  
 if (activeUser !== owner){
   // socket.emit("Agregar_Producto_Carro" , putData); 
 }
 else {
  //TODO AGREGAR ESTO
   // socket.emit("Error_Agregar_Producto_Premium" , putData); 
 }

};

socket.on('Mensaje_Carro',message =>{

  Swal.fire({
    title: 'Actualizacion de Carro',
    toast: true,
    icon:"success",
    text: message,
    position:"top-end",
    showConfirmButton: false,
    timer:2000
});
setTimeout(() => {window.location.reload()}, 1000);

});

socket.on('Refrescar',message =>{

  Swal.fire({
    title: 'Ha Ocurrido un error inesperado.',
    toast: true,
    icon:"error",
    text: "Intente nuevamente",
    position:"top-end",
    showConfirmButton: false,
    timer:2000
});
setTimeout(() => {window.location.reload()}, 1000);
});



