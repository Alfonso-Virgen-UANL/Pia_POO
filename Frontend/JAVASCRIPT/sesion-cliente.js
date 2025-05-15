// Alternar contraseña visible/oculta (sin cambios, funciona bien)
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

// Cambiar entre formularios (mejorado)
function showLogin() {
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('login-form').reset();
}

function showRegister() {
    document.getElementById('register-form').classList.remove('hidden');
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').reset();
}

// Inicialización (simplificada)
document.addEventListener('DOMContentLoaded', function() {
    showLogin(); // Mostrar login por defecto
});

// Configuración común para fetch
const fetchConfig = {
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
};

// Manejo de login (actualizado)
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        email: document.getElementById('login-email').value,
        password: document.getElementById('login-password').value
    };

    try {
        const response = await fetch('inicioDeSesion.php', {
            method: 'POST',
            ...fetchConfig,
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        console.log('Respuesta login:', data);

        if (!response.ok) throw new Error(data.error || 'Error en la solicitud');

        if (data.success) {
            localStorage.setItem('authToken', data.token || '');
            window.location.href = data.redirect || 'Inicio.html';
        } else {
            throw new Error(data.error || 'Credenciales incorrectas');
        }
    } catch (error) {
        console.error('Error en login:', error);
        showError(error.message);
    }
});

// Manejo de registro (completamente actualizado)
document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    // Validaciones del cliente
    if (password.length < 8) {
        showError('La contraseña debe tener al menos 8 caracteres');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('Las contraseñas no coinciden');
        return;
    }

    const formData = {
        name: document.getElementById('register-name').value,
        email: document.getElementById('register-email').value,
        password: password,
        confirmPassword: confirmPassword
    };

    try {
        const response = await fetch('registro.php', {
            method: 'POST',
            ...fetchConfig,
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        console.log('Respuesta registro:', data);

        if (!response.ok) throw new Error(data.error || 'Error en el registro');

        if (data.success) {
            showMessage('Registro exitoso. Por favor inicia sesión.');
            showLogin();
        } else {
            throw new Error(data.error || 'Error en el registro');
        }
    } catch (error) {
        console.error('Error en registro:', error);
        showError(error.message);
    }
});

// Funciones auxiliares mejoradas
function showError(message) {
    const errorElement = document.getElementById('error-message') || createMessageElement('error');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    setTimeout(() => errorElement.style.display = 'none', 5000);
}

function showMessage(message) {
    const msgElement = document.getElementById('success-message') || createMessageElement('success');
    msgElement.textContent = message;
    msgElement.style.display = 'block';
    setTimeout(() => msgElement.style.display = 'none', 5000);
}

function createMessageElement(type) {
    const element = document.createElement('div');
    element.id = `${type}-message`;
    element.className = `alert alert-${type}`;
    element.style.display = 'none';
    document.body.prepend(element);
    return element;
}