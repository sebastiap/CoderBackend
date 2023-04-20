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
  stringCart = cartDiv.innerHTML;
  let productToAdd = await axios.get('http://localhost:'+ port + '/api/products/'+stringId);

  let dataid = productToAdd.data[0]._id;

  let putData = {
    "quantity":1
    };
  // TODOZ volver esto un socket
  let putURL = `http://localhost:${port}/api/carts/${stringCart}/products/${dataid}`;

  await axios.put(putURL,putData)
  .then(function () {
      Swal.fire({
        title: 'Nuevo producto agregado al Carro.',
        toast: true,
        icon:"success",
        text: `Se agrego el producto ${productToAdd.data[0].title} al carrito.`,
        position:"top-end",
        showConfirmButton: false,
        timer:3000
    })
  }) 
  .catch(function (error) {
    if (error.response) {
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    }
   else if (error.request) {
    console.log(error.request);
  } else {
    console.log('Error', error.message);
  }})


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



