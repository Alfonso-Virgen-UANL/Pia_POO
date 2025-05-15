<?php
require 'funciones.php';
require 'conxBs.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = sanitizeInput($_POST['email']);

    if (!emailExists($email)) {
        echo json_encode(['success' => false, 'error' => 'Email no registrado']);
        exit;
    }

    // Generar token (en producción usaríamos un email real)
    $token = bin2hex(random_bytes(32));
    $expiry = date('Y-m-d H:i:s', strtotime('+1 hour'));

    $stmt = $pdo->prepare("UPDATE usuarios SET token_recuperacion = ?, token_expiracion = ? WHERE email = ?");
    $stmt->execute([$token, $expiry, $email]);

    // En producción enviaríamos un email con el enlace
    $resetLink = "http://tudominio.com/nueva-contraseña.php?token=$token";
    
    echo json_encode([
        'success' => true,
        'message' => 'Enlace de recuperación generado (simulado)',
        'link' => $resetLink // Solo para pruebas
    ]);
    exit;
}
?>