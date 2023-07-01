const socket = io();
var url_string = window.location;
var port = url_string.port;
var origin = url_string.origin;
let pmail = document.getElementById("mail");
let mail = "";
if (pmail != undefined) {
  mail = String(pmail.innerHTML);
};

const changeRole = async (mail) => {
  socket.emit("Cambiar_Rol_Usuario" , mail);
};
const deleteUser = async (mail) => {
  Swal.fire({
    title: "Eliminar Usuario",
    text: "Estas seguro que desea borrar el usuario?",
    confirmButtonText: 'Eliminar',
    cancelButtonText: 'Cancelar',
    allowOutsideClick: false,
    showCancelButton: true,
}).then((result) => {
  if (result.isConfirmed){
    socket.emit("Borrar_Usuario" , mail);
  }
});
};

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
  // let productToAdd = await axios.get(localhost +':'+ port + '/api/products/'+stringId);
  let productToAdd = await axios.get(origin + '/api/products/'+stringId);
  // let productToAdd = await axios.get(config.localhost +'http://localhost:'+ port + '/api/products/'+stringId);
  let dataid = productToAdd.data[0]._id;
  let owner = productToAdd.data[0].owner;

  if (mail === owner){
    Swal.fire({
      title: 'No es posible cargar el producto.',
      toast: true,
      icon:"error",
      text: "Este producto fue creado por usted, por lo que no es posible agregarlo al carrito.",
      position:"top-end",
      showConfirmButton: false,
      timer:2000
  });
  }
  else {
    let putData = {
      "quantity":1,
      "product":dataid,
      "title":productToAdd.data[0].title,
      };
    
     socket.emit("Agregar_Producto_Carro" , putData); 
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
socket.on('Rol_Cambiado',message =>{

  Swal.fire({
    title: 'Cambio de Rol de Usuario',
    toast: true,
    icon:"success",
    text: message,
    position:"top-end",
    showConfirmButton: false,
    timer:2000
});
});
socket.on('Usuario_Eliminado',message =>{

  Swal.fire({
    title: 'Usuario Eliminado por Administrador',
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



