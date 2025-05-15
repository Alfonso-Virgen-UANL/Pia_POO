
document.getElementById('add-servicio').addEventListener('click', function() {
    const serviciosContainer = document.getElementById('servicios-container');
    const selects = serviciosContainer.querySelectorAll('select');

    if (selects.length >= 3) {
        alert('Solo puedes seleccionar hasta 3 servicios.');
        return;
    }

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
    serviciosContainer.appendChild(nuevoSelect);
    nuevoSelect.addEventListener('change', actualizarTotal);
});


function actualizarTotal() {
    const selects = document.querySelectorAll('#servicios-container select');
    let total = 0;

    selects.forEach(select => {
        const precio = parseInt(select.value) || 0;
        total += precio;
    });

    document.getElementById('total').textContent = `Total: $${total}`;
}


document.getElementById('servicios').addEventListener('change', actualizarTotal);


document.querySelector('.form-citas').addEventListener('submit', async function(e) {
    e.preventDefault();

    const fecha = e.target.fecha.value;
    const hora = e.target.hora.value;
    const barbero = e.target.barbero.value;
    const servicios = Array.from(document.querySelectorAll('[name="servicios[]"]'))
                        .map(select => select.value)
                        .filter(Boolean);

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

    try {
        const submitBtn = e.target.querySelector('[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';

        const response = await fetch('/Backend/guardar_cita.php', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            alert('Cita agendada con éxito');
            window.location.reload(); 
        } else {
            alert('Error: ' + (result.error || 'No se pudo guardar'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor. Verifica tu conexión.');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Agendar Cita';
        }
    }
});