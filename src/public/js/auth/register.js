const form = document.getElementById('registerForm');

form.addEventListener('submit', function(e) {
    e.preventDefault();

    const data = new FormData(form);
    const obj = {};

    data.forEach((value,key) => obj[key] = value);
    console.log(JSON.stringify(obj));

    fetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(obj),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(result => {
        if(result.status === 200) {
            //esta es la version del frontend del redirect
            window.location.replace('/');
        }
    }).catch(err => {console.error(err);});
})