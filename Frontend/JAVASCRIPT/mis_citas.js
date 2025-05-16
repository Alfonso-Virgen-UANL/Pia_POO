document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    if (!localStorage.getItem('userLoggedIn')) {
        alert('Debes iniciar sesión para ver tus citas');
        window.location.href = 'sesion-cliente.html';
    } else {
        document.getElementById('login-link').style.display = 'none';
        const welcomeMsg = document.getElementById('welcome-message');
        welcomeMsg.style.display = 'inline';
        welcomeMsg.textContent = `Bienvenido, ${localStorage.getItem('userName')}`;
        
        // Cargar citas del usuario
        cargarCitas();
    }
    
    // Configurar filtros
    document.getElementById('filtro-estado').addEventListener('change', aplicarFiltros);
    document.getElementById('filtro-fecha').addEventListener('change', aplicarFiltros);
    document.getElementById('btn-limpiar-filtros').addEventListener('click', limpiarFiltros);
    
    // Configurar modal
    document.querySelector('.modal-close').addEventListener('click', function() {
        document.getElementById('cita-detalle').style.display = 'none';
    });
    
    // Cerrar modal al hacer clic fuera de él
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('cita-detalle');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Función para cargar citas desde el backend
async function cargarCitas() {
    try {
        // Mostrar indicador de carga
        const citasBody = document.getElementById('citas-body');
        citasBody.innerHTML = '<tr><td colspan="7" class="cargando">Cargando citas...</td></tr>';
        
        // Hacer solicitud al servidor
        const response = await fetch('/barberia/Pia_POO/Backend/obtener_citas.php', {
            method: 'GET',
            credentials: 'include' // Para enviar cookies de sesión
        });
        
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Error al obtener las citas');
        }
        
        // Mostrar las citas en la tabla
        mostrarCitas(result.citas);
        
    } catch (error) {
        console.error('Error al cargar citas:', error);
        document.getElementById('citas-body').innerHTML = 
            `<tr><td colspan="7" class="error">Error al cargar citas: ${error.message}</td></tr>`;
    }
}

// Función para mostrar las citas en la tabla
function mostrarCitas(citas) {
    const citasBody = document.getElementById('citas-body');
    const sinCitas = document.getElementById('sin-citas');
    
    // Si no hay citas, mostrar mensaje
    if (!citas || citas.length === 0) {
        citasBody.innerHTML = '';
        sinCitas.style.display = 'block';
        return;
    }
    
    // Ocultar mensaje de sin citas
    sinCitas.style.display = 'none';
    
    // Generar filas de la tabla
    let html = '';
    
    citas.forEach(cita => {
        // Formato de fecha: YYYY-MM-DD a DD/MM/YYYY
        const fechaPartes = cita.fecha.split('-');
        const fechaFormateada = `${fechaPartes[2]}/${fechaPartes[1]}/${fechaPartes[0]}`;
        
        // Formato de hora: HH:MM:SS a HH:MM
        const horaFormateada = cita.hora_inicio.substring(0, 5);
        
        // Clase CSS según el estado
        let estadoClase = '';
        switch(cita.estado) {
            case 'pendiente':
                estadoClase = 'estado-pendiente';
                break;
            case 'completada':
                estadoClase = 'estado-completada';
                break;
            case 'cancelada':
                estadoClase = 'estado-cancelada';
                break;
            default:
                estadoClase = '';
        }
        
        // Verificar si hay servicios y procesar nombres de servicios
        let serviciosNombre = 'No disponible';
        if (cita.servicios && cita.servicios.length > 0) {
            // Crear lista de nombres de servicios
            const nombresServicios = cita.servicios.map(servicio => servicio.nombre);
            serviciosNombre = nombresServicios.join(', ');
        } else if (cita.servicios_nombres) {
            // Usar la cadena preformateada si está disponible
            serviciosNombre = cita.servicios_nombres;
        } else if (cita.servicio_principal_nombre) {
            // Fallback al servicio principal
            serviciosNombre = cita.servicio_principal_nombre;
        }
        
        // Asegurar que el total sea un número válido
        const total = parseFloat(cita.total || 0).toFixed(2);
        
        html += `
        <tr data-cita-id="${cita.cita_id}" data-estado="${cita.estado}" data-fecha="${cita.fecha}">
            <td>${fechaFormateada}</td>
            <td>${horaFormateada}</td>
            <td>${cita.barbero_nombre || 'No asignado'}</td>
            <td>${serviciosNombre}</td>
            <td>$${total}</td>
            <td class="${estadoClase}">${cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1)}</td>
            <td class="acciones">
                <button class="btn-detalle" onclick="verDetalle(${cita.cita_id})">Ver detalle</button>
                ${cita.estado === 'pendiente' ? 
                    `<button class="btn-cancelar" onclick="cancelarCita(${cita.cita_id})">Eliminar</button>` : 
                    ''}
            </td>
        </tr>
        `;
        
        // Almacenar los datos completos de la cita para usarlos en el detalle
        window[`cita_${cita.cita_id}`] = cita;
    });
    
    citasBody.innerHTML = html;
    
    // Aplicar filtros actuales (si hay)
    aplicarFiltros();
}

// Función para ver detalles de una cita
function verDetalle(citaId) {
    const cita = window[`cita_${citaId}`];
    if (!cita) return;
    
    // Formato de fecha: YYYY-MM-DD a DD/MM/YYYY
    const fechaPartes = cita.fecha.split('-');
    const fechaFormateada = `${fechaPartes[2]}/${fechaPartes[1]}/${fechaPartes[0]}`;
    
    // Preparar listado de servicios
    let serviciosHTML = '<h4>Servicios:</h4>';
    let totalCalculado = 0;
    
    // Verificar si tenemos el array de servicios detallados
    if (cita.servicios && cita.servicios.length > 0) {
        serviciosHTML += '<ul class="servicios-lista">';
        cita.servicios.forEach(servicio => {
            const precio = parseFloat(servicio.precio || 0);
            totalCalculado += precio;
            serviciosHTML += `<li>${servicio.nombre} - $${precio.toFixed(2)}</li>`;
        });
        serviciosHTML += '</ul>';
    } else if (cita.servicios_nombres) {
        // Si no tenemos detalles pero tenemos los nombres
        serviciosHTML += `<p>${cita.servicios_nombres}</p>`;
        totalCalculado = parseFloat(cita.total || 0);
    } else if (cita.servicio_principal_nombre) {
        // Fallback al servicio principal
        const servicioPrecio = parseFloat(cita.servicio_precio || 0);
        serviciosHTML += `<p>${cita.servicio_principal_nombre} - $${servicioPrecio.toFixed(2)}</p>`;
        totalCalculado = servicioPrecio;
    }
    
    // Asegurar que usamos el total calculado o el proporcionado
    const total = parseFloat(cita.total || totalCalculado).toFixed(2);
    
    // Preparar contenido del detalle
    let contenidoHTML = `
        <div class="detalle-info">
            <p><strong>Fecha:</strong> ${fechaFormateada}</p>
            <p><strong>Hora:</strong> ${cita.hora_inicio.substring(0, 5)} - ${cita.hora_fin ? cita.hora_fin.substring(0, 5) : '?'}</p>
            <p><strong>Barbero:</strong> ${cita.barbero_nombre || 'No asignado'}</p>
            <p><strong>Estado:</strong> <span class="estado-${cita.estado}">${cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1)}</span></p>
            
            ${serviciosHTML}
            <p class="total-detalle"><strong>Total:</strong> $${total}</p>
        </div>
    `;
    
    // Si la cita está pendiente, mostrar botón de eliminar
    if (cita.estado === 'pendiente') {
        contenidoHTML += `
            <div class="detalle-acciones">
                <button class="btn-cancelar" onclick="cancelarCita(${cita.cita_id})">Eliminar cita</button>
            </div>
        `;
    }
    
    // Mostrar el modal con los detalles
    document.getElementById('detalle-contenido').innerHTML = contenidoHTML;
    document.getElementById('cita-detalle').style.display = 'block';
}

// Función para cancelar una cita
async function cancelarCita(citaId) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta cita? Esta acción no se puede deshacer.')) {
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('cita_id', citaId);
        
        const response = await fetch('/barberia/Pia_POO/Backend/cancelar_cita.php', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Error al eliminar la cita');
        }
        
        // Actualizar la vista
        alert('Cita eliminada con éxito');
        
        // Cerrar el modal si está abierto
        document.getElementById('cita-detalle').style.display = 'none';
        
        // Recargar las citas
        cargarCitas();
        
    } catch (error) {
        console.error('Error al eliminar cita:', error);
        alert(`Error al eliminar la cita: ${error.message}`);
    }
}

// Aplicar filtros de estado y fecha
function aplicarFiltros() {
    const estado = document.getElementById('filtro-estado').value;
    const fecha = document.getElementById('filtro-fecha').value;
    
    const filas = document.querySelectorAll('#citas-body tr');
    let citasVisibles = 0;
    
    filas.forEach(fila => {
        let mostrar = true;
        
        // Filtrar por estado
        if (estado !== 'todos' && fila.dataset.estado !== estado) {
            mostrar = false;
        }
        
        // Filtrar por fecha
        if (fecha && fila.dataset.fecha !== fecha) {
            mostrar = false;
        }
        
        // Mostrar u ocultar fila
        fila.style.display = mostrar ? '' : 'none';
        
        if (mostrar) citasVisibles++;
    });
    
    // Mostrar mensaje si no hay citas visibles
    const sinCitas = document.getElementById('sin-citas');
    if (citasVisibles === 0 && filas.length > 0) {
        sinCitas.innerHTML = '<p>No hay citas que coincidan con los filtros. <button onclick="limpiarFiltros()">Limpiar filtros</button></p>';
        sinCitas.style.display = 'block';
    } else {
        sinCitas.style.display = filas.length === 0 ? 'block' : 'none';
        if (filas.length === 0) {
            sinCitas.innerHTML = '<p>No tienes citas programadas. <a href="citas.html">¡Agenda ahora!</a></p>';
        }
    }
}

// Limpiar filtros
function limpiarFiltros() {
    document.getElementById('filtro-estado').value = 'todos';
    document.getElementById('filtro-fecha').value = '';
    aplicarFiltros();
}