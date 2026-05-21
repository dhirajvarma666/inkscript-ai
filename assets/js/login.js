const form = document.getElementById('loginForm');

const email = document.getElementById('email');
const password = document.getElementById('password');

const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');

form.addEventListener('submit', (e) => {

  e.preventDefault();

  let valid = true;

  emailError.textContent = '';
  passwordError.textContent = '';

  /* EMAIL VALIDATION */

  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if(email.value.trim() === ''){
    emailError.textContent =
      'Email is required';
    valid = false;
  }

  else if(!emailPattern.test(email.value)){
    emailError.textContent =
      'Enter a valid email';
    valid = false;
  }

  /* PASSWORD VALIDATION */

  if(password.value.trim() === ''){
    passwordError.textContent =
      'Password is required';
    valid = false;
  }

  else if(password.value.length < 6){
    passwordError.textContent =
      'Minimum 6 characters';
    valid = false;
  }

  /* SUCCESS */

  if(valid){

    alert('Login Successful');

    form.reset();

  }

});

email.addEventListener('input', () => {
  emailError.textContent = '';
});

password.addEventListener('input', () => {
  passwordError.textContent = '';
});