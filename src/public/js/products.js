const socket = io();

const AddtoCart = async (productId) => {
  let stringId = productId;
  // TODO hacer generico para cada user
  let stringCart = '64135d02acdf495d33f1a229';
  // console.log("id",string);
  let productToAdd = await axios.get('http://localhost:8080/api/products/'+stringId);
  let cartToFill = await axios.get('http://localhost:8080/api/carts/'+stringCart);
  // console.log("cartProducts",cartToFill.data.products);
  // let cartProducts = cartToFill.data.products;
  
  // TODO que no devuelva data
  let dataid = productToAdd.data[0]._id;

  // let putData = {product:dataid, quantity:1};
  let putData = {
    "quantity":1
    };
  // cartProducts.push(putData);
  let putURL = `http://localhost:8080/api/carts/${stringCart}/products/${dataid}`;
  // console.log(putURL);
  // console.log(putData);

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
// TODO ver si se puede y conviene hacer con sockets
// socket.on('Producto_Agregado_Carro',message =>{
//   Swal.fire({
//     title: 'Nuevo producto agregado al Carro.',
//     toast: true,
//     icon:"success",
//     text: message,
//     position:"top-end",
//     showConfirmButton: false,
//     timer:3000
// })
//   code.value = "";
//   stock.value = "";
//   title.value = "";
//   description.value = "";
//   price.value = "";
//   thumbnail.value = "";

// });

