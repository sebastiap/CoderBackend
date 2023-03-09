
let myform = document.getElementById("productForm");
let title = document.getElementById("title");
let description = document.getElementById("description");
let price = document.getElementById("price");
let thumbnail = document.getElementById("thumbnail");
let stock = document.getElementById("stock");
let code = document.getElementById("code");
let mensajeError = document.getElementById("mensajeError");
let mensajeConfirmacion = document.getElementById("mensajeConfirmacion");

const Borro = (id) => {
    socket.emit("Producto Borrado" , id);
};


const ActualizarLista = (lista) => {
    let ltitle = document.getElementById("Ltitle");
    let div = document.getElementById("Listado");
    let npdiv = document.getElementById("NoProdHero");
    let contenido = "";
    mensajeError.innerHTML = "";
    // mensajeConfirmacion.innerHTML = ""

    lista.forEach(producto => { contenido += `<div class="productDiv"><p class="title">${producto.title}</p>
    <p>${producto.description}</p>
    <img src=${producto.thumbnail} width="100em" height="100em" alt="imagen" />
    <p><b>Precio:</b> ${producto.price}</p>
    <p><b>Codigo de Producto:</b> ${producto.code}</p>
    <p><b>Stock Disponible::</b> ${producto.stock}</p>
    </p><input class="button" type="button" onclick="Borro(${producto.id})" name="" value="Borrar"></div>`});
    if (lista.length > 0) 
    {ltitle.innerHTML = 'Lista de Productos Actuales';
    div.innerHTML = `   ${contenido}  `;
    npdiv.innerHTML = '<div></div>'}
    else {
      ltitle.innerHTML = 'No hay productos disponibles en este momento.';
      div.innerHTML = '';
      npdiv.innerHTML =  `<div id="NoProdHero">
      <div class="noPdiv">
          <img src="https://img.freepik.com/free-vector/add-cart-concept-illustration_114360-1435.jpg?w=826&t=st=1678233850~exp=1678234450~hmac=e83dfbf30df5a067add1aca70bb273e7fabf6de157bde44f9f84358889d3f9f1" />
      </div>
      <h2> Que tal si cargamos uno ? </h2>
      <h2> Usa el formulario de la derecha para cargar uno nuevo.</h2>
  </div>`;
    }

}
;

const socket = io();

socket.emit('Client_Connect', "Cliente Conectado");

socket.on("Listado de Productos Actualizados", data => {
      ActualizarLista(data);


})

myform.addEventListener("submit", (e) => {
    e.preventDefault();
    const producto = {"title": title.value, "description": description.value, "price": price.value , 
    "thumbnail": thumbnail.value, "stock": stock.value, "code": code.value,
    "category":"Misc", "status":true
}
    
    socket.emit("Ingresar Nuevo Producto",producto);
  });

  socket.on("error_al_insertar", (error) => {
    Swal.fire({
      title: "Error al Insertar",
      text: `El error reportado es el siguiente : ${error}`,
      icon:"error",
      confirmButtonColor: 'slateblue',
      allowOutsideClick: false,
  })
    mensajeError.innerHTML = error;
    mensajeConfirmacion.innerHTML = "";
  })

  socket.on('Producto_Agregado',message =>{
    Swal.fire({
      title: 'Nuevo producto insertado.',
      toast: true,
      icon:"success",
      text: message,
      position:"top-end",
      showConfirmButton: false,
      timer:3000
  })
    code.value = "";
    stock.value = "";
    title.value = "";
    description.value = "";
    price.value = "";
    thumbnail.value = "";

  });

  socket.on('Borrado confirmado', message => {
    Swal.fire({
      title: 'Producto Borrado',
      toast: true,
      icon:"info",
      text: message,
      position:"top-end",
      showConfirmButton: false,
      timer:3000
  })})
