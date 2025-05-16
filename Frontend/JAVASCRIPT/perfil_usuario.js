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
        // Verificar que el elemento existe antes de intentar acceder a sus propiedades
        const loadingMessage = document.getElementById('loading-message');
        if (loadingMessage) {
            loadingMessage.style.display = 'none';
        }

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
            
            // Actualizar también el header si existen esos elementos
            const headerUsername = document.getElementById('header-username');
            if (headerUsername) {
                headerUsername.textContent = usuario.nombre;
            }
            
            const loggedOutView = document.getElementById('logged-out-view');
            const loggedInView = document.getElementById('logged-in-view');
            
            if (loggedOutView) loggedOutView.style.display = 'none';
            if (loggedInView) loggedInView.style.display = 'flex';
        } else {
            mostrarMensajeNoSesion();
            
            // Actualizar el header para mostrar los enlaces de sesión
            const loggedOutView = document.getElementById('logged-out-view');
            const loggedInView = document.getElementById('logged-in-view');
            
            if (loggedOutView) loggedOutView.style.display = 'block';
            if (loggedInView) loggedInView.style.display = 'none';
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
    if (!container) {
        console.error('No se encontró el contenedor principal');
        return;
    }
    
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
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            cerrarSesion();
        });
    }
    
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
    
    // Verificar que todos los elementos existen antes de añadir listeners
    if (!modal || !editBtn || !closeBtn || !cancelBtn || !form) {
        console.error('Elementos del modal no encontrados');
        return;
    }
    
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
        
        if (!formMessage) {
            console.error('Elemento de mensaje de formulario no encontrado');
            return;
        }
        
        // Validar coincidencia de contraseñas si se están cambiando
        if (password && password !== passwordConfirm) {
            formMessage.textContent = 'Las contraseñas no coinciden';
            formMessage.classList.add('error');
            return;
        }
        
        // Validar campos obligatorios
        const nombre = document.getElementById('edit-nombre').value.trim();
        const email = document.getElementById('edit-email').value.trim();
        const currentPassword = document.getElementById('current-password').value;
        
        if (!nombre || !email || !currentPassword) {
            formMessage.textContent = 'Por favor, complete todos los campos obligatorios';
            formMessage.classList.add('error');
            return;
        }
        
        // Recopilar datos del formulario
        const formData = {
            nombre: nombre,
            email: email,
            telefono: document.getElementById('edit-telefono').value.trim(),
            password: password,
            current_password: currentPassword
        };
        
        // Enviar datos al servidor
        actualizarPerfil(formData, modal, formMessage);
    });
}

// Función para actualizar el perfil del usuario
function actualizarPerfil(formData, modal, formMessage) {
    if (!formMessage) {
        console.error('Elemento de mensaje de formulario no encontrado');
        return;
    }
    
    formMessage.textContent = 'Actualizando perfil...';
    formMessage.classList.remove('error');
    formMessage.classList.add('info');
    formMessage.style.display = 'block';
    
    // Utilizar directamente la ruta conocida del backend
    const updateUrl = '/barberia/Pia_POO/Backend/actualizar_perfil.php';
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
        
        // Capturar tanto el texto como el estado para mejor diagnóstico
        return response.text().then(text => {
            console.log('Contenido de respuesta:', text);
            
            try {
                // Intentar parsear como JSON si es posible
                const data = JSON.parse(text);
                if (!response.ok) {
                    throw new Error(data.error || `Error HTTP: ${response.status}`);
                }
                return data;
            } catch (e) {
                console.error('Error al parsear JSON:', e);
                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}. Contenido: ${text}`);
                }
                throw new Error('La respuesta no es un JSON válido');
            }
        });
    })
    .then(data => {
        console.log('Datos procesados:', data);
        if (data.success) {
            formMessage.textContent = 'Perfil actualizado correctamente';
            formMessage.classList.remove('error', 'info');
            formMessage.classList.add('success');
            
            // Actualizar los datos en la sesión
            if (data.usuario) {
                setTimeout(() => {
                    if (modal) modal.style.display = 'none';
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
        formMessage.textContent = `Error: ${error.message || 'Error al conectar con el servidor'}`;
        formMessage.classList.remove('info', 'success');
        formMessage.classList.add('error');
    });
}

// Función para mostrar un mensaje cuando no hay sesión
function mostrarMensajeNoSesion() {
    const container = document.getElementById('main-container');
    if (!container) {
        console.error('No se encontró el contenedor principal');
        return;
    }
    
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
    if (!container) {
        console.error('No se encontró el contenedor principal');
        // Como último recurso, mostrar un alert
        alert(`${titulo}: ${mensaje}`);
        return;
    }
    
    container.innerHTML = `
        <div class="error-container">
            <h2>${titulo}</h2>
            <p>${mensaje}</p>
            ${mostrarReintentar ? 
                '<button onclick="verificarSesion()" class="btn-reintentar">Reintentar</button>' : ''}
            <a href="Inicio.html" class="btn-inicio">Volver al Inicio</a>
            <div class="debug-info">
                <h3>Información para diagnóstico:</h3>
                <p>URL: ${window.location.href}</p>
                <p>User Agent: ${navigator.userAgent}</p>
                <p>Timestamp: ${new Date().toISOString()}</p>
            </div>
        </div>
    `;
}

// Función para cerrar sesión
function cerrarSesion() {
    fetch('/barberia/Pia_POO/Backend/cerrar_sesion.php')
        .then(response => {
            // Manejar posibles errores en la respuesta
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            return response.json().catch(error => {
                throw new Error("La respuesta no es JSON válido");
            });
        })
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
    try {
        console.log('Iniciando verificación de sesión');
        verificarSesion();
    } catch (error) {
        console.error('Error al iniciar la verificación de sesión:', error);
        alert('Error al cargar la página. Por favor, intenta nuevamente.');
    }
});