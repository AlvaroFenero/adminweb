document.addEventListener('DOMContentLoaded', (event) => {
    if (localStorage.getItem('rememberMe') === 'true') {
        document.getElementById('email').value = localStorage.getItem('email');
        document.getElementById('formCheck').checked = true;
    }
});

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleEye = document.getElementById('toggleEye');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleEye.classList.remove('fa-eye');
        toggleEye.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleEye.classList.remove('fa-eye-slash');
        toggleEye.classList.add('fa-eye');
    }
}

function showSpinner() {
    document.getElementById('spinner').style.display = 'block';
}

function hideSpinner() {
    document.getElementById('spinner').style.display = 'none';
}

async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('formCheck').checked;

    showSpinner();

    try {
        const response = await fetch('http://localhost:5000/api/usuario', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        hideSpinner();

        if (response.status === 200) {
            Swal.fire({
                icon: 'success',
                title: 'Login exitoso',
                text: 'Has ingresado correctamente',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                localStorage.setItem('userEmail', email);
                localStorage.setItem('token', data.token);  // Almacenar el token en localStorage
                if (rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
                    localStorage.setItem('email', email);
                } else {
                    localStorage.removeItem('rememberMe');
                    localStorage.removeItem('email');
                }
                window.location.href = '../pages/home.html';
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.message,
            });
        }
    } catch (error) {
        hideSpinner();
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al conectarse al servidor',
        });
    }
}
