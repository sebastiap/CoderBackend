const form = document.getElementById('loginForm');
const errorMessage = document.getElementById('mensajeError');

form.addEventListener('submit', function(e) {
    e.preventDefault();

    const data = new FormData(form);
    const obj = {};

    data.forEach((value,key) => obj[key] = value);

    fetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify(obj),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(result => {
        if(result.status === 200) {
            //esta es la version del frontend del redirect
            window.location.replace('/products');
        }
        else if (result.status === 400) {
            errorMessage.innerHTML = 'Authentication failed. Invalid email or incomplete data.'
        }
        else if (result.status === 401) {
            errorMessage.innerHTML = 'Authentication failed. Invalid Username or Password.'
        }
        else {
            errorMessage.innerHTML = 'Authentication failed. Some Error Ocurred.' 
        }
    })
})