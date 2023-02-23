// Forma to de messages user
// {user:correoDelUsuario, message: mensaje del usuario}
const socket = io();
const coloresChat =["#C1666B","green","slateblue","#48A9A6","bisque","blue","aliceblue"]
let user;
let color;

Swal.fire({
    title: "Identificacion",
    input: "text",
    text: "Ingresa tu usuario para identificarte en el chat",
    inputValidator: (value) => {
        return !value && "Necesitas escribir un nombre de usuario"
    },
    allowOutsideClick: false
}).then((result) => {
    user = result.value;
    color =  coloresChat[Math.floor(Math.random() * coloresChat.length)];
    // console.log(user,"se autentico");
    socket.emit("authenticated",user);
});


const chatbox = document.getElementById("chatbox");

chatbox.addEventListener("keyup", (event) => {
    if(event.key === "Enter") {
        if (chatbox.value.trim().length > 0){
            socket.emit("message",{user , message: chatbox.value})
            chatbox.value = "";
        }
    }
})

const enviar = () => {
    if (chatbox.value.trim().length > 0){
        socket.emit("message",{user , message: chatbox.value})
        chatbox.value = "";
    }
}

socket.on("message_logs", (data) => {
    if(!user){
        return;
    }
    else {
        let log = document.getElementById("messagelogs");
        let messages = "";
        data.forEach(message => {
            if (message.user === user ) {
                messages+= "<em style=color:"+ color + ">"
            }
            else {
                messages+= "<em>"
            }
            messages+=  message.user + " dice: " +  message.message +"</em><br>"
        });
        log.innerHTML = messages;
    }
})

socket.on("new_user_connected", newUser => {
    if (!user) return;
    if (newUser != user) {
    Swal.fire({
        title: `${newUser}`,
        toast: true,
        icon:"success",
        text: `${newUser} se ha unido al chat.`,
        position:"top-end",
        showConfirmButton: false,
        timer:3000
    })
}
})

