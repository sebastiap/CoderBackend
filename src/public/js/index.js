const socket = io();
// console.log("Estoy en el cliente");

socket.emit('message', "Hola, estoy usando sockets desde el cliente");

socket.on('evento_socket_individual', message => console.log(message));
socket.on('evento_para_todos_menos_socket_actual', message => console.log(message));
socket.on('evento_para_todos', message => console.log(message));

