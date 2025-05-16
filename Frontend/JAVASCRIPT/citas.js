document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    if (!localStorage.getItem('userLoggedIn')) {
        alert('Debes iniciar sesión para agendar citas');
        window.location.href = 'sesion-cliente.html';
    } else {
        document.getElementById('login-link').style.display = 'none';
        const welcomeMsg = document.getElementById('welcome-message');
        welcomeMsg.style.display = 'inline';
        welcomeMsg.textContent = `Bienvenido, ${localStorage.getItem('userName')}`;
    }
    
    // Cargar datos de la base de datos (barberos y servicios)
    cargarOpcionesDinamicas();
    
    // Setear fecha mínima (hoy)
    document.getElementById('fecha').min = new Date().toISOString().split('T')[0];
    
    // Configurar restricciones de horario
    const horaInput = document.getElementById('hora');
    horaInput.addEventListener('change', function() {
        validarHorario(this);
    });
    
    // Configurar el formulario
    const form = document.getElementById('citaForm');
    
    // Configurar el evento submit del formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        enviarFormulario();
    });
    
    // Configurar el botón submit como respaldo
    document.getElementById('submit-cita').addEventListener('click', function() {
        // Simular el envío del formulario
        document.getElementById('citaForm').dispatchEvent(new Event('submit'));
    });
    
    // Inicializar listeners para todos los selects existentes
    inicializarEventosServicios();
    
    // Actualizar el total inicial
    actualizarTotal();
});

// Función para validar el horario
function validarHorario(input) {
    const hora = input.value;
    
    if (!hora) return;
    
    const [hours, minutes] = hora.split(':').map(Number);
    const horaDecimal = hours + minutes / 60;
    
    if (horaDecimal < 9) {
        alert('No se pueden agendar citas antes de las 9:00 AM');
        input.value = '09:00';
    } else if (horaDecimal > 18) {
        alert('No se pueden agendar citas después de las 6:00 PM');
        input.value = '18:00';
    }
}

// Cargar barberos y servicios desde la base de datos
async function cargarOpcionesDinamicas() {
    try {
        const response = await fetch('/barberia/Pia_POO/Backend/obtener_datos.php?tipo=todo');
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status}`);
        }
        
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'Error al obtener datos');
        }
        
        // Cargar barberos
        if (result.data.barberos && result.data.barberos.length > 0) {
            const barberoSelect = document.getElementById('barbero');
            // Mantener la opción predeterminada
            let defaultOption = barberoSelect.querySelector('option[disabled]');
            barberoSelect.innerHTML = '';
            if (defaultOption) {
                barberoSelect.appendChild(defaultOption);
            }
            
            // Agregar opciones de barberos
            result.data.barberos.forEach(barbero => {
                const option = document.createElement('option');
                option.value = barbero.barbero_id;
                option.textContent = barbero.nombre;
                barberoSelect.appendChild(option);
            });
        }
        
        // Cargar servicios
        if (result.data.servicios && result.data.servicios.length > 0) {
            // Organizar servicios por categorías
            const serviciosPorCategoria = organizarServiciosPorCategoria(result.data.servicios);
            
            // Actualizar todos los selects de servicios existentes
            const serviciosSelects = document.querySelectorAll('#servicios-container select');
            serviciosSelects.forEach(select => {
                actualizarOpcionesServicios(select, serviciosPorCategoria);
            });
            
            // Guardar servicios en una variable global para usarlos luego
            window.serviciosDisponibles = serviciosPorCategoria;
        }
    } catch (error) {
        console.error('Error al cargar opciones:', error);
        alert('No se pudieron cargar los barberos y servicios. Por favor, recarga la página.');
    }
}

// Organizar servicios por categoría
function organizarServiciosPorCategoria(servicios) {
    const categorias = {
        'Cortes': [],
        'Barba': [],
        'Facial': [],
        'Otros': []
    };
    
    servicios.forEach(servicio => {
        // Clasificar servicios por su nombre (podría mejorarse con una columna de categoría en la BD)
        if (servicio.nombre.toLowerCase().includes('corte')) {
            categorias['Cortes'].push(servicio);
        } else if (servicio.nombre.toLowerCase().includes('barba') || 
                servicio.nombre.toLowerCase().includes('afeitado') ||
                servicio.nombre.toLowerCase().includes('bigote')) {
            categorias['Barba'].push(servicio);
        } else if (servicio.nombre.toLowerCase().includes('facial') ||
                servicio.nombre.toLowerCase().includes('limpieza') ||
                servicio.nombre.toLowerCase().includes('spa')) {
            categorias['Facial'].push(servicio);
        } else {
            categorias['Otros'].push(servicio);
        }
    });
    
    return categorias;
}

// Actualizar las opciones de un select de servicios
function actualizarOpcionesServicios(select, serviciosPorCategoria) {
    // Mantener la opción predeterminada
    let defaultOption = select.querySelector('option[disabled]');
    select.innerHTML = '';
    if (defaultOption) {
        select.appendChild(defaultOption);
    }
    
    // Agregar servicios por categoría
    for (const categoria in serviciosPorCategoria) {
        if (serviciosPorCategoria[categoria].length > 0) {
            const group = document.createElement('optgroup');
            group.label = categoria;
            
            serviciosPorCategoria[categoria].forEach(servicio => {
                const option = document.createElement('option');
                option.value = servicio.servicio_id;
                option.textContent = `${servicio.nombre} - $${servicio.precio}`;
                option.dataset.precio = servicio.precio;
                option.dataset.nombre = servicio.nombre;
                group.appendChild(option);
            });
            
            select.appendChild(group);
        }
    }
}

// Inicializar los eventos para los selects de servicios
function inicializarEventosServicios() {
    const serviciosSelects = document.querySelectorAll('#servicios-container select');
    serviciosSelects.forEach(select => {
        select.addEventListener('change', actualizarTotal);
    });
}

// Agregar servicio
document.getElementById('add-servicio').addEventListener('click', function() {
    const serviciosContainer = document.getElementById('servicios-container');
    const selects = serviciosContainer.querySelectorAll('.servicio-grupo');

    if (selects.length >= 3) {
        alert('Solo puedes seleccionar hasta 3 servicios.');
        return;
    }

    // Crear grupo de servicio (select + botón eliminar)
    const grupoServicio = document.createElement('div');
    grupoServicio.className = 'servicio-grupo';
    
    // Crear el select
    const nuevoSelect = document.createElement('select');
    nuevoSelect.name = 'servicios[]';
    nuevoSelect.required = true;
    
    // Opción por defecto
    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = "Selecciona una opción";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    nuevoSelect.appendChild(defaultOption);
    
    // Si tenemos servicios disponibles, los agregamos
    if (window.serviciosDisponibles) {
        actualizarOpcionesServicios(nuevoSelect, window.serviciosDisponibles);
    }
    
    // Crear botón de eliminar
    const btnEliminar = document.createElement('button');
    btnEliminar.type = 'button';
    btnEliminar.className = 'btn-eliminar-servicio';
    btnEliminar.textContent = 'X';
    btnEliminar.addEventListener('click', function() {
        grupoServicio.remove();
        actualizarTotal();
    });
    
    // Agregar elementos al grupo
    grupoServicio.appendChild(nuevoSelect);
    grupoServicio.appendChild(btnEliminar);
    
    // Agregar grupo al contenedor
    serviciosContainer.appendChild(grupoServicio);
    
    // Asegurarnos de que el evento se agregue al nuevo select
    nuevoSelect.addEventListener('change', actualizarTotal);
    
    // Forzar actualización del total después de agregar un nuevo selector
    actualizarTotal();
});

// Modificar el primer servicio para añadirle estructura adecuada
document.addEventListener('DOMContentLoaded', function() {
    const serviciosContainer = document.getElementById('servicios-container');
    const primerSelect = serviciosContainer.querySelector('select');
    
    if (primerSelect && !primerSelect.parentElement.classList.contains('servicio-grupo')) {
        // Crear grupo de servicio
        const grupoServicio = document.createElement('div');
        grupoServicio.className = 'servicio-grupo';
        
        // Obtener el select existente y envolverlo
        primerSelect.parentNode.insertBefore(grupoServicio, primerSelect);
        grupoServicio.appendChild(primerSelect);
    }
});

function actualizarTotal() {
    console.log('Actualizando total...');
    const selects = document.querySelectorAll('#servicios-container select');
    let total = 0;

    selects.forEach(select => {
        if (select.value) {
            // Intentar obtener el precio del dataset si está disponible
            const selectedOption = select.options[select.selectedIndex];
            if (selectedOption && selectedOption.dataset.precio) {
                total += parseFloat(selectedOption.dataset.precio);
            } else {
                // Fallback: usar el valor del select si no hay dataset
                const precio = parseFloat(select.value) || 0;
                total += precio;
            }
        }
    });

    console.log('Nuevo total calculado:', total);
    document.getElementById('total').textContent = `Total: $${total.toFixed(2)}`;
    
    // Guardar el total para enviarlo después
    document.getElementById('citaForm').dataset.total = total.toFixed(2);
}

async function enviarFormulario() {
    console.log('Función enviarFormulario ejecutada');
    const form = document.getElementById('citaForm');
    const fecha = form.fecha.value;
    const hora = form.hora.value;
    const barbero = form.barbero.value;
    const serviciosSelects = document.querySelectorAll('[name="servicios[]"]');
    const total = form.dataset.total || '0';

    // Validar horario antes de enviar
    const [hours, minutes] = hora.split(':').map(Number);
    const horaDecimal = hours + minutes / 60;
    
    if (horaDecimal < 9 || horaDecimal > 18) {
        alert('Por favor selecciona un horario entre las 9:00 AM y las 6:00 PM');
        return;
    }

    // Recolectar servicios con sus IDs y nombres
    const servicios = [];
    const serviciosInfo = [];
    serviciosSelects.forEach(select => {
        if (select.value) {
            servicios.push(select.value);
            
            // Guardar información adicional si está disponible
            const selectedOption = select.options[select.selectedIndex];
            if (selectedOption) {
                serviciosInfo.push({
                    id: select.value,
                    nombre: selectedOption.dataset.nombre || selectedOption.textContent,
                    precio: selectedOption.dataset.precio || '0'
                });
            }
        }
    });

    console.log({
        fecha, 
        hora, 
        barbero, 
        servicios,
        serviciosInfo,
        total
    });

    if (!fecha || !hora || !barbero || servicios.length === 0) {
        alert('Por favor completa todos los campos obligatorios.');
        return;
    }

    const formData = new FormData();
    formData.append('fecha', fecha);
    formData.append('hora', hora);
    formData.append('barbero', barbero);
    formData.append('total', total);
    
    // Enviar los IDs de servicios
    servicios.forEach(servicio => {
        formData.append('servicios[]', servicio);
    });

    try {
        const submitBtn = document.getElementById('submit-cita');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';

        console.log('Enviando datos al servidor...');
        // Usar la ruta correcta al backend
        const response = await fetch('/barberia/Pia_POO/Backend/guardar_cita.php', {
            method: 'POST',
            body: formData,
            credentials: 'include' // Importante para enviar cookies de sesión
        });

        console.log('Respuesta recibida, estado:', response.status);
        
        // Para debug, mostrar el texto de la respuesta en caso de error
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error en la respuesta:', errorText);
            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Respuesta parseada:', result);

        if (result.success) {
            alert('Cita agendada con éxito');
            window.location.reload();
        } else {
            alert('Error: ' + (result.error || 'No se pudo guardar la cita'));
        }
    } catch (error) {
        console.error('Error en la operación:', error);
        alert(`Error al conectar con el servidor: ${error.message}`);
    } finally {
        const submitBtn = document.getElementById('submit-cita');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Confirmar Cita';
        }
    }
}