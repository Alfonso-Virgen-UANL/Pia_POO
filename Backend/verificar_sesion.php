<?php
session_start();
header('Content-Type: application/json');

// Función para registrar información en el log
function logDebug($message, $data = null) {
    if ($data !== null) {
        error_log($message . ': ' . print_r($data, true));
    } else {
        error_log($message);
    }
}

logDebug('Solicitud recibida en verificar_sesion.php');
logDebug('SESSION', $_SESSION);

try {
    // Verificar si hay una sesión activa
    if (isset($_SESSION['user_id']) && isset($_SESSION['user_name'])) {
        // Devolver información básica del usuario
        $usuario = [
            'id' => $_SESSION['user_id'],
            'nombre' => $_SESSION['user_name'],
            'email' => $_SESSION['user_email'] ?? '',
            'telefono' => $_SESSION['user_phone'] ?? ''
        ];
        
        echo json_encode([
            'success' => true,
            'autenticado' => true,
            'usuario' => $usuario
        ]);
    } else {
        // No hay sesión activa
        echo json_encode([
            'success' => true,
            'autenticado' => false
        ]);
    }
} catch (Exception $e) {
    logDebug('Error en verificar_sesion.php: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => 'Error al verificar la sesión'
    ]);
}