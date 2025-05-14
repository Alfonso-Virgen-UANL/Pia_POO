// Alternar contraseña visible/oculta
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggle = input.nextElementSibling;
    
    if (input.type === "password") {
        input.type = "text";
        toggle.textContent = "Ocultar";
    } else {
        input.type = "password";
        toggle.textContent = "Mostrar";
    }
}

// Cambiar entre formularios
function showLogin() {
    document.getElementById('login-form').classList.add('active');
    document.getElementById('register-form').classList.remove('active');
}

function showRegister() {
    document.getElementById('login-form').classList.remove('active');
    document.getElementById('register-form').classList.add('active');
}

// Manejo de formularios con Fetch API
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(this);

    try {
        const response = await fetch(this.action, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();

        if (data.success) {
            window.location.href = data.redirect || 'Inicio.html';
        } else {
            alert(data.error || 'Error al iniciar sesión');
        }
    } catch (error) {
        alert('Error de conexión');
    }
});

document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (document.getElementById('register-password').value !== 
        document.getElementById('register-confirm-password').value) {
        alert('Las contraseñas no coinciden');
        return;
    }

    const formData = new FormData(this);

    try {
        const response = await fetch(this.action, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();

        if (data.success) {
            alert('Registro exitoso');
            showLogin();
        } else {
            alert(data.error || 'Error al registrar');
        }
    } catch (error) {
        alert('Error de conexión');
    }
});