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
    
    // Setear fecha mínima (hoy)
    document.getElementById('fecha').min = new Date().toISOString().split('T')[0];
    
    // Actualizar el total inicialmente
    actualizarTotal();
    
    // Inicializar listeners para todos los selects existentes desde el inicio
    const serviciosSelects = document.querySelectorAll('#servicios-container select');
    serviciosSelects.forEach(select => {
        select.addEventListener('change', actualizarTotal);
    });
    
    // Agregar el event listener al formulario
    document.getElementById('citaForm').addEventListener('submit', function(e) {
        e.preventDefault();
        enviarFormulario();
    });
    
    // Agregar event listener al botón de submit (respaldo)
    document.getElementById('submit-cita').addEventListener('click', function() {
        enviarFormulario();
    });
    
    console.log('Listeners iniciales configurados a', serviciosSelects.length, 'selects');
});

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
    nuevoSelect.innerHTML = `
        <option value="" selected disabled>Selecciona una opción</option>
        <optgroup label="Corte de Cabello">
            <option value="185">Corte de Caballero - $185</option>
            <option value="165">Corte infantil - $165</option>
            <option value="100">Delineado de Cabello - $100</option>
        </optgroup>
        <optgroup label="Facial">
            <option value="185">Limpieza facial - $185</option>
            <option value="165">Spa - $165</option>
        </optgroup>
        <optgroup label="Barba">
            <option value="120">Recorte de Barba - $120</option>
            <option value="85">Afeitado Clásico - $85</option>
            <option value="115">Recorte de bigote - $115</option>
            <option value="120">Tratamiento barba - $120</option>
            <option value="140">Limpieza barba y bigote - $140</option>
        </optgroup>
    `;
    
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
    console.log('Nuevo select añadido, actualizando total');
    actualizarTotal();
});

// Modificar el primer servicio para añadirle un botón de eliminar
document.addEventListener('DOMContentLoaded', function() {
    const primerServicio = document.querySelector('#servicios-container select');
    if (primerServicio) {
        // Verificar que no esté ya dentro de un grupo
        if (!primerServicio.parentElement.classList.contains('servicio-grupo')) {
            const grupoServicio = document.createElement('div');
            grupoServicio.className = 'servicio-grupo';
            
            // Obtener el select existente y envolverlo
            primerServicio.parentNode.insertBefore(grupoServicio, primerServicio);
            grupoServicio.appendChild(primerServicio);
            
            // No agregar botón de eliminar al primer servicio para asegurar que siempre haya al menos uno
        }
    }
});

function actualizarTotal() {
    console.log('Actualizando total...');
    const selects = document.querySelectorAll('#servicios-container select');
    let total = 0;

    selects.forEach(select => {
        const valor = select.value;
        console.log('Valor del select:', valor);
        const precio = parseInt(valor) || 0;
        total += precio;
    });

    console.log('Nuevo total calculado:', total);
    document.getElementById('total').textContent = `Total: $${total}`;
}

function enviarFormulario() {
    console.log('Función enviarFormulario ejecutada');
    const form = document.getElementById('citaForm');
    const fecha = form.fecha.value;
    const hora = form.hora.value;
    const barbero = form.barbero.value;
    const servicios = Array.from(document.querySelectorAll('[name="servicios[]"]'))
                        .map(select => select.value)
                        .filter(Boolean);

    console.log({
        fecha, 
        hora, 
        barbero, 
        servicios
    });

    if (!fecha || !hora || !barbero || servicios.length === 0) {
        alert('Por favor completa todos los campos obligatorios.');
        return;
    }

    const formData = new FormData();
    formData.append('fecha', fecha);
    formData.append('hora', hora);
    formData.append('barbero', barbero);
    servicios.forEach(servicio => {
        formData.append('servicios[]', servicio);
    });

    enviarDatosAlServidor(formData);
}

async function enviarDatosAlServidor(formData) {
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