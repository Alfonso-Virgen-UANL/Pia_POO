async function submitRecovery() {
    const email = document.getElementById('email').value;
        try {
        const response = await fetch('recupDeCont.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })});
    const data = await response.json();
        lert(data.message || 'Si el email existe, recibirás instrucciones');
        window.location.href = 'sesion-cliente.html';
        } catch (error) {
        alert('Error de conexión');
        }
}
