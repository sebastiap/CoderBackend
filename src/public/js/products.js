const socket = io();
let cartDiv = document.getElementById('cart');

const deleteCart = async (id) => {
  let stringId = id;
  socket.emit("Borrar_Producto_Carro" , stringId);
};
const QuantityChange = async (id,q) => {

  let qdata = {id:id, quantity:q};
  socket.emit("Cambiar_Cantidad_Carro" , qdata);
};

const AddtoCart = async (productId) => {
  let stringId = productId;
  // TODOZ hacer generico para cada user
  let stringCart = '64135d02acdf495d33f1a229';
  // let stringCart = cartDiv.innerHTML;
  let productToAdd = await axios.get('http://localhost:8080/api/products/'+stringId);
  let cartToFill = await axios.get('http://localhost:8080/api/carts/'+stringCart);
  // TODOZ que no devuelva data
  let dataid = productToAdd.data[0]._id;

  // let putData = {product:dataid, quantity:1};
  let putData = {
    "quantity":1
    };
  let putURL = `http://localhost:8080/api/carts/${stringCart}/products/${dataid}`;

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


