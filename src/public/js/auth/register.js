const form = document.getElementById('registerForm');
const errorMessage = document.getElementById('mensajeError');

const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

const validateAge = (age) => {
    return String(age)
      .toLowerCase()
      .match(
        /^[1-9]?[0-9]{1}$|^100$/
      );
  };
const validatePassword = (password) => {
    return (password.length >= 6);
  };

form.addEventListener('submit', function(e) {
    e.preventDefault();

    const data = new FormData(form);
    const obj = {};

    data.forEach((value,key) => obj[key] = value);
    
    if(!validateEmail(obj.email)) {
    errorMessage.innerHTML = 'Registration failed. Invalid email address.';
    return "Invalid email address";}
    if(!validateAge(obj.age)) {
    errorMessage.innerHTML = 'Registration failed. You completed an invalid age.';
    return "Invalid email age";
    }
    if(!validatePassword(obj.password)) {
    errorMessage.innerHTML = 'Registration failed. Your password must be at least 6 digits long.';
    return "Invalid password length";
    }

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