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
                    <a href="#" class="edit-btn">Editar Perfil</a>
                    <a href="#" class="logout-btn" id="logout-btn">Cerrar Sesión</a>
                </div>
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