
let myform = document.getElementById("productForm");
let title = document.getElementById("title");
let description = document.getElementById("description");
let price = document.getElementById("price");
let thumbnail = document.getElementById("thumbnail");
let img = document.getElementById("img");
let stock = document.getElementById("stock");
let code = document.getElementById("code");
let mensajeError = document.getElementById("mensajeError");
let mensajeConfirmacion = document.getElementById("mensajeConfirmacion");

const Borro = (id) => {
    socket.emit("Producto Borrado" , id);
};


const Crear = (event) => {
    event.preventDefault();
    return false;
}
;
const ActualizarLista = (lista) => {
    let div = document.getElementById("Listado");
    let contenido = "";
    mensajeError.innerHTML = "";
    mensajeConfirmacion.innerHTML = ""

    lista.forEach(producto => { contenido += `<div class="productDiv"><p class="title">${producto.title}</p>
    <p>${producto.description}</p>
    <img src=${producto.thumbnail} width="100em" height="100em" alt="imagen" />
    <p><b>Precio:</b> ${producto.price}</p>
    <p><b>Codigo de Producto:</b> ${producto.code}</p>
    <p><b>Stock Disponible::</b> ${producto.stock}</p>
    </p><input class="button" type="button" onclick="Borro(${producto.id})" name="" value="Borrar"></div>`});
    div.innerHTML = `   ${contenido}  `;
}
;

const socket = io();

socket.emit('Client_Connect', "Cliente Conectado");

socket.on("Listado de Productos Actualizados", data => {
    console.log("Actualice la lista");
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
    mensajeError.innerHTML = error;
    mensajeConfirmacion.innerHTML = "";
  })

  socket.on('Producto_Agregado',message =>{
    code.value = "";
    stock.value = "";
    title.value = "";
    description.value = "";
    price.value = "";
    thumbnail.value = "";
    img.value = "";
    console.log("stock",stock , "code",code);
    mensajeConfirmacion.innerHTML = message;
  });


