const form = document.getElementById('resetForm');
const errorMessage = document.getElementById('mensajeError');

form.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log("HOLA")

    const data = new FormData(form);
    const obj = {};

    data.forEach((value,key) => obj[key] = value);
    let newObj = JSON.stringify(obj);

    fetch('/auth/reset', {
        method: 'POST',
        body: newObj,
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(result => {
        if(result.status === 200) {
            window.location.replace('/auth/login');
        }
        else if (result.status === 400) {
            errorMessage.innerHTML = 'Password reset failed. The email does not exist in this site.'
        }
        else {
            errorMessage.innerHTML = 'Registration failed. Some Error Ocurred.' 
        }
    }).catch(err => {console.error(err);});
})