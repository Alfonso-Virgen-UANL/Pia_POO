// Función mejorada para verificar sesión
function verificarSesion() {
    fetch('/barberia/Pia_POO/Backend/verificar_sesion.php', {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        credentials: 'include' // Para manejar cookies de sesión
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        return response.json().catch(error => {
            throw new Error("La respuesta no es JSON válido");
        });
    })
    .then(data => {
        console.log("Datos recibidos:", data); // Debug importante
        
        if (!data || typeof data !== 'object') {
            throw new Error("Formato de respuesta inválido");
        }

        const mainContainer = document.getElementById('main-container');
        const loadingMessage = document.getElementById('loading-message');
        loadingMessage.style.display = 'none';

        if (data.success && data.autenticado && data.usuario) {
            // Validación exhaustiva de datos del usuario
            const usuario = data.usuario;
            if (!usuario.id || !usuario.nombre) {
                throw new Error("Datos de usuario incompletos");
            }
            
            // Asegurar que todos los campos tengan valores por defecto
            usuario.email = usuario.email || 'No disponible';
            usuario.telefono = usuario.telefono || 'No disponible';
            
            mostrarPerfil(usuario);
        } else {
            mostrarMensajeNoSesion();
        }
    })
    .catch(error => {
        console.error('Error completo:', error);
        mostrarErrorDetallado(
            "Error al cargar perfil",
            `No se pudieron obtener los datos. ${error.message}`,
            true
        );
    });
}

// Función para mostrar el perfil del usuario
function mostrarPerfil(usuario) {
    const container = document.getElementById('main-container');
    
    // Obtener la fecha actual para calcular el tiempo como cliente
    const fechaActual = new Date();
    
    // Generar contenido HTML para el perfil
    const perfilHTML = `
        <div class="header">
            <a href="Inicio.html">
                <img src="imagenes/logo.svg" alt="Logo Barbería" class="barberia-logo">
            </a>
            <h1>Perfil del Cliente</h1>
            <div class="welcome-container">
                <span id="welcome-message" class="welcome-message">Bienvenido, ${usuario.nombre}</span>
            </div>
        </div>
        
        <div class="profile-section">
            <img src="imagenes/predeterminado.svg" alt="Foto del cliente" class="profile-pic">
            <div class="profile-info">
                <h2>${usuario.nombre}</h2>
                <p><strong>ID de Cliente:</strong> ${usuario.id}</p>
                <p><strong>Correo Electrónico:</strong> ${usuario.email || 'No disponible'}</p>
                <p><strong>Teléfono:</strong> ${usuario.telefono || 'No disponible'}</p>
            </div>
        </div>
        
        <div class="details-section">
            <div class="detail-card">
                <h3>Información de Cuenta</h3>
                <div class="detail-item">
                    <strong>Estado de la cuenta:</strong> Activa
                </div>
                <div class="detail-item">
                    <a href="#" class="edit-btn" id="edit-profile-btn">Editar Perfil</a>
                    <a href="#" class="logout-btn" id="logout-btn">Cerrar Sesión</a>
                </div>
            </div>
        </div>
        
        <!-- Modal para editar perfil -->
        <div id="edit-profile-modal" class="modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>Editar Perfil</h2>
                <form id="edit-profile-form">
                    <div class="form-group">
                        <label for="edit-nombre">Nombre:</label>
                        <input type="text" id="edit-nombre" name="nombre" value="${usuario.nombre}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-email">Correo Electrónico:</label>
                        <input type="email" id="edit-email" name="email" value="${usuario.email !== 'No disponible' ? usuario.email : ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-telefono">Teléfono:</label>
                        <input type="tel" id="edit-telefono" name="telefono" value="${usuario.telefono !== 'No disponible' ? usuario.telefono : ''}">
                    </div>
                    <div class="form-group">
                        <label for="edit-password">Nueva Contraseña (dejar en blanco para no cambiar):</label>
                        <input type="password" id="edit-password" name="password">
                    </div>
                    <div class="form-group">
                        <label for="edit-password-confirm">Confirmar Nueva Contraseña:</label>
                        <input type="password" id="edit-password-confirm" name="password_confirm">
                    </div>
                    <div class="form-group">
                        <label for="current-password">Contraseña Actual (requerida para confirmar cambios):</label>
                        <input type="password" id="current-password" name="current_password" required>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="save-btn">Guardar Cambios</button>
                        <button type="button" class="cancel-btn">Cancelar</button>
                    </div>
                    <div id="form-message" class="form-message"></div>
                </form>
            </div>
        </div>
        
        <div class="footer">
            <p>© 2025 Barberia Hefesto - Todos los derechos reservados</p>
        </div>
    `;
    
    // Insertar el HTML en el contenedor principal
    container.innerHTML = perfilHTML;
    
    // Añadir funcionalidad al botón de cerrar sesión
    document.getElementById('logout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        cerrarSesion();
    });
    
    // Configurar el modal de edición de perfil
    configurarModalEditarPerfil(usuario);
}

// Función para configurar el modal de edición de perfil
function configurarModalEditarPerfil(usuario) {
    const modal = document.getElementById('edit-profile-modal');
    const editBtn = document.getElementById('edit-profile-btn');
    const closeBtn = document.querySelector('.close-modal');
    const cancelBtn = document.querySelector('.cancel-btn');
    const form = document.getElementById('edit-profile-form');
    
    // Abrir modal
    editBtn.addEventListener('click', function(e) {
        e.preventDefault();
        modal.style.display = 'flex';
    });
    
    // Cerrar modal con X
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Cerrar modal con botón Cancelar
    cancelBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Cerrar modal al hacer clic fuera del contenido
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Manejar envío del formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validar formulario
        const password = document.getElementById('edit-password').value;
        const passwordConfirm = document.getElementById('edit-password-confirm').value;
        const formMessage = document.getElementById('form-message');
        
        // Validar coincidencia de contraseñas si se están cambiando
        if (password && password !== passwordConfirm) {
            formMessage.textContent = 'Las contraseñas no coinciden';
            formMessage.classList.add('error');
            return;
        }
        
        // Recopilar datos del formulario
        const formData = {
            nombre: document.getElementById('edit-nombre').value,
            email: document.getElementById('edit-email').value,
            telefono: document.getElementById('edit-telefono').value,
            password: password,
            current_password: document.getElementById('current-password').value
        };
        
        // Enviar datos al servidor
        actualizarPerfil(formData, modal, formMessage);
    });
}

// Función para actualizar el perfil del usuario
function actualizarPerfil(formData, modal, formMessage) {
    formMessage.textContent = 'Actualizando perfil...';
    formMessage.classList.remove('error');
    formMessage.classList.add('info');
    formMessage.style.display = 'block';
    
    // Determinar la URL correcta basada en la estructura actual
    // Obtenemos la URL base del verificar_sesion.php ya que sabemos que funciona
    let baseUrl = '';
    const scriptPath = document.querySelector('script[src*="perfil_usuario.js"]').getAttribute('src');
    
    // Extraemos la ruta base
    if (scriptPath.includes('/JAVASCRIPT/')) {
        baseUrl = scriptPath.substring(0, scriptPath.indexOf('/JAVASCRIPT/'));
    } else {
        baseUrl = '/barberia/Pia_POO';  // Ruta predeterminada
    }
    
    // Construimos la URL completa para actualizar_perfil.php
    const updateUrl = `${baseUrl}/Backend/actualizar_perfil.php`;
    console.log('Enviando solicitud a:', updateUrl);
    
    fetch(updateUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(formData),
        credentials: 'include'
    })
    .then(response => {
        console.log('Respuesta del servidor:', response.status);
        if (!response.ok) {
            return response.text().then(text => {
                console.error('Contenido de error:', text);
                throw new Error(`Error HTTP: ${response.status}`);
            });
        }
        return response.json().catch(err => {
            console.error('Error al parsear JSON:', err);
            throw new Error('La respuesta no es un JSON válido');
        });
    })
    .then(data => {
        console.log('Datos recibidos:', data);
        if (data.success) {
            formMessage.textContent = 'Perfil actualizado correctamente';
            formMessage.classList.remove('error', 'info');
            formMessage.classList.add('success');
            
            // Actualizar los datos en la sesión
            if (data.usuario) {
                setTimeout(() => {
                    modal.style.display = 'none';
                    verificarSesion(); // Recargar la página con los nuevos datos
                }, 1500);
            }
        } else {
            formMessage.textContent = data.error || 'Error al actualizar el perfil';
            formMessage.classList.remove('info', 'success');
            formMessage.classList.add('error');
        }
    })
    .catch(error => {
        console.error('Error completo al actualizar perfil:', error);
        formMessage.textContent = 'Error al conectar con el servidor. Inténtalo de nuevo más tarde.';
        formMessage.classList.remove('info', 'success');
        formMessage.classList.add('error');
    });
}

// Función para mostrar un mensaje cuando no hay sesión
function mostrarMensajeNoSesion() {
    const container = document.getElementById('main-container');
    
    const mensajeHTML = `
        <div class="no-session">
            <h2>No has iniciado sesión</h2>
            <p>Para ver tu perfil, por favor inicia sesión primero.</p>
            <a href="sesion-cliente.html" class="login-btn">Iniciar Sesión</a>
        </div>
        
        <div class="footer">
            <p>© 2025 Barberia Hefesto - Todos los derechos reservados</p>
        </div>
    `;
    
    container.innerHTML = mensajeHTML;
}

// Función mejorada para mostrar errores
function mostrarErrorDetallado(titulo, mensaje, mostrarReintentar = false) {
    const container = document.getElementById('main-container');
    container.innerHTML = `
        <div class="error-container">
            <h2>${titulo}</h2>
            <p>${mensaje}</p>
            ${mostrarReintentar ? 
                '<button onclick="verificarSesion()" class="btn-reintentar">Reintentar</button>' : ''}
            <a href="Inicio.html" class="btn-inicio">Volver al Inicio</a>
            <div class="debug-info" style="display:none">
                <h3>Información para diagnóstico:</h3>
                <p>URL: ${window.location.href}</p>
                <p>User Agent: ${navigator.userAgent}</p>
            </div>
        </div>
    `;
}

// Función para cerrar sesión
function cerrarSesion() {
    fetch('/barberia/Pia_POO/Backend/cerrar_sesion.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Redireccionar a la página de inicio
                window.location.href = 'Inicio.html';
            } else {
                console.error('Error al cerrar sesión:', data.error);
                alert('Error al cerrar sesión. Por favor, intenta nuevamente.');
            }
        })
        .catch(error => {
            console.error('Error al cerrar sesión:', error);
            alert('Error al cerrar sesión. Por favor, intenta nuevamente.');
        });
}

// Ejecutar la verificación de sesión cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    verificarSesion();
});