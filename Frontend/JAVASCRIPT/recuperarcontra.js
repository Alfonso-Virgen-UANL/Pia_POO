document.getElementById('password-recovery-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Simular envío del formulario
    const email = document.getElementById('email').value;
    
    // Aquí iría la lógica real para enviar el correo de recuperación
    console.log('Enviando enlace de recuperación a:', email);
    
    // Mostrar mensaje de éxito
    document.getElementById('success-message').style.display = 'block';
    document.getElementById('recovery-form').querySelector('p').style.display = 'none';
    
    // Opcional: Limpiar el campo después de enviar
    document.getElementById('email').value = '';
    
});