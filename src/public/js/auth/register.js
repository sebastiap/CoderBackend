const form = document.getElementById('registerForm');
const errorMessage = document.getElementById('mensajeError');

form.addEventListener('submit', function(e) {
    e.preventDefault();

    const data = new FormData(form);
    const obj = {};

    data.forEach((value,key) => obj[key] = value);
// TODOZ Agregar mas validaciones, campos completos y validos
    if (obj.email.slice(0,5) === 'admin'){
        obj.role = 'admin';
    }
    else {
        obj.role = 'user';
    }
    let newObj = JSON.stringify(obj);
    
    fetch('/auth/register', {
        method: 'POST',
        body: newObj,
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(result => {
        if(result.status === 200) {
            //esta es la version del frontend del redirect
            window.location.replace('/auth/login');
        }
        else if (result.status === 400) {
            errorMessage.innerHTML = 'Registration failed. The email is already registered in this site.'
        }
        else {
            errorMessage.innerHTML = 'Registration failed. Some Error Ocurred.' 
        }
    }).catch(err => {console.error(err);});
})