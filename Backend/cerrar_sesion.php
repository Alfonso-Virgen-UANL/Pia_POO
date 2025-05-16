<?php
session_start();

// Función para registrar información en el log
function logDebug($message, $data = null) {
    if ($data !== null) {
        error_log($message . ': ' . print_r($data, true));
    } else {
        error_log($message);
    }
}

// Configurar cabecera para responder en formato JSON
header('Content-Type: application/json');

try {
    logDebug('Cerrando sesión para usuario', $_SESSION['user_id'] ?? 'no identificado');
    
    // Guardar ID para el log
    $userId = $_SESSION['user_id'] ?? 'no identificado';
    
    // Destruir todas las variables de sesión
    $_SESSION = array();
    
    // Si se está usando un cookie de sesión, eliminar también la cookie
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
    
    // Destruir la sesión
    session_destroy();
    
    // Enviar respuesta de éxito
    logDebug('Sesión cerrada correctamente para usuario', $userId);
    echo json_encode([
        'success' => true,
        'message' => 'Sesión cerrada correctamente'
    ]);
    
} catch (Exception $e) {
    logDebug('Error al cerrar sesión: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => 'Error al cerrar la sesión: ' . $e->getMessage()
    ]);
}
?>