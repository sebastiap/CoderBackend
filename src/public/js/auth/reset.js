const form = document.getElementById('resetForm');
const passlabel = document.getElementById('passlabel');
const errorMessage = document.getElementById('mensajeError');

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = new FormData(form);
    const obj = {};
    data.forEach((value,key) => obj[key] = value);
    if (passlabel !== undefined && passlabel !== null){
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
                errorMessage.innerHTML = 'The new password must be different than the old one.'
            }
            else if (result.status === 401) {
                errorMessage.innerHTML = 'Password reset failed. The email does not exist in this site.'
            }
            else {
                errorMessage.innerHTML = 'Registration failed. Some Error Ocurred.' 
            }
        }).catch(err => {console.error(err);});
    }
    else{
        window.location.replace("/mail?mail="+ obj.email);
    }

  
})