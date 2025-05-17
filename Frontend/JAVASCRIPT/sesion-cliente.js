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

// Cambiar entre formularios (simplificado sin reset)
function showLogin() {
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
    // Eliminamos el reset que causa problemas
}

function showRegister() {
    document.getElementById('register-form').classList.remove('hidden');
    document.getElementById('login-form').classList.add('hidden');
    // Eliminamos el reset que causa problemas
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Mostrar login por defecto
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
    
    // Verificar si el usuario ya inició sesión
    if (localStorage.getItem('userLoggedIn')) {
        const userName = localStorage.getItem('userName');
        if (userName) {
            // Actualizar la interfaz para mostrar que el usuario está conectado
            const loginLink = document.getElementById('login-link');
            if (loginLink) {
                loginLink.style.display = 'none';
            }
            
            const welcomeMessage = document.getElementById('welcome-message');
            if (welcomeMessage) {
                welcomeMessage.style.display = 'inline';
                welcomeMessage.textContent = `Bienvenido, ${userName}`;
            }
        }
    }
});

// Manejo de login
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Crear FormData con los datos del formulario
    const formData = new FormData();
    formData.append('email', document.getElementById('login-email').value);
    formData.append('password', document.getElementById('login-password').value);

    try {
        const response = await fetch('/barberia/Pia_POO/Backend/login.php', {
            method: 'POST',
            body: formData
        });

        // Verificar si la respuesta fue exitosa antes de intentar parsear JSON
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }

        let data;
        try {
            data = await response.json();
            console.log('Respuesta login:', data);
        } catch (parseError) {
            console.error('Error al parsear JSON:', parseError);
            throw new Error('La respuesta del servidor no es un JSON válido');
        }

        if (data && data.success) {
            // Guardar información en localStorage para persistencia entre páginas
            localStorage.setItem('userLoggedIn', 'true');
            localStorage.setItem('userName', data.userName || 'Usuario');
            localStorage.setItem('userId', data.userId || '');
            
            // Mostrar alerta de éxito con window.alert
            window.alert('¡Inicio de sesión exitoso!');
            // Redirigir al usuario
            window.location.href = data.redirect;
        } else {
            window.alert(data?.error || 'Error al iniciar sesión');
        }
    } catch (error) {
        console.error('Error en login:', error);
        window.alert(`Error al conectar con el servidor: ${error.message}`);
    }
});

// Manejo de registro
document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    // Validaciones del cliente
    if (password.length < 8) {
        window.alert('La contraseña debe tener al menos 8 caracteres');
        return;
    }
    
    if (password !== confirmPassword) {
        window.alert('Las contraseñas no coinciden');
        return;
    }
    
    // Validar número de teléfono (solo números y 10 dígitos para México)
    const phone = document.getElementById('register-phone').value;
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
        window.alert('El número celular debe tener 10 dígitos sin espacios ni guiones');
        return;
    }

    // Crear FormData con los datos del formulario
    const formData = new FormData();
    formData.append('name', document.getElementById('register-name').value);
    formData.append('phone', document.getElementById('register-phone').value);
    formData.append('email', document.getElementById('register-email').value);
    formData.append('password', password);
    formData.append('confirmPassword', confirmPassword);

    try {
        const response = await fetch('/barberia/Pia_POO/Backend/registro.php', {
            method: 'POST',
            body: formData
        });

        // Verificar si la respuesta fue exitosa antes de intentar parsear JSON
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }

        let data;
        try {
            data = await response.json();
            console.log('Respuesta registro:', data);
        } catch (parseError) {
            console.error('Error al parsear JSON:', parseError);
            throw new Error('La respuesta del servidor no es un JSON válido');
        }

        if (data && data.success) {
            // Mostrar alerta de éxito con window.alert
            window.alert('¡Registro exitoso! Ahora puedes iniciar sesión con tus credenciales.');
            
            // Limpiar manualmente los campos del formulario de registro
            document.getElementById('register-name').value = '';
            document.getElementById('register-phone').value = '';
            document.getElementById('register-email').value = '';
            document.getElementById('register-password').value = '';
            document.getElementById('register-confirm-password').value = '';
            
            // Cambiar al formulario de login sin intentar hacer reset
            showLogin();
        } else {
            window.alert(data?.error || 'Error en el registro');
        }
    } catch (error) {
        console.error('Error en registro:', error);
        window.alert(`Error al conectar con el servidor: ${error.message}`);
    }
});