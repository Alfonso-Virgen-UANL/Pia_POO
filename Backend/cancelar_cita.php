<?php
session_start();
header('Content-Type: application/json');
require 'conxBs.php';

// Función para registrar información en el log
function logDebug($message, $data = null) {
    if ($data !== null) {
        error_log($message . ': ' . print_r($data, true));
    } else {
        error_log($message);
    }
}

logDebug('Solicitud recibida en cancelar_cita.php');
logDebug('SESSION', $_SESSION);
logDebug('POST', $_POST);

// Verificar autenticación
if (!isset($_SESSION['user_id'])) {
    logDebug('No hay sesión de usuario activa');
    echo json_encode(['success' => false, 'error' => 'No autenticado']);
    exit;
}

$cliente_id = $_SESSION['user_id'];
logDebug("Cliente ID: $cliente_id intentando eliminar cita");

try {
    // Verificar que se recibió el ID de la cita
    if (!isset($_POST['cita_id']) || empty($_POST['cita_id'])) {
        throw new Exception('ID de cita no proporcionado');
    }
    
    $cita_id = intval($_POST['cita_id']);
    
    // Verificar que la cita pertenece al cliente actual y está en estado pendiente
    $stmt = $pdo->prepare("
        SELECT cita_id, estado FROM citas 
        WHERE cita_id = ? AND cliente_id = ?
    ");
    $stmt->execute([$cita_id, $cliente_id]);
    $cita = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$cita) {
        throw new Exception('Cita no encontrada o no pertenece a este cliente');
    }
    
    if ($cita['estado'] !== 'pendiente') {
        throw new Exception('Solo se pueden eliminar citas en estado pendiente');
    }
    
    // Eliminar la cita de la base de datos
    $stmt = $pdo->prepare("DELETE FROM citas WHERE cita_id = ?");
    $success = $stmt->execute([$cita_id]);
    
    if (!$success) {
        throw new Exception('Error al eliminar la cita');
    }
    
    logDebug("Cita ID: $cita_id eliminada exitosamente");
    echo json_encode(['success' => true, 'message' => 'Cita eliminada con éxito']);
    
} catch (Exception $e) {
    logDebug('Error al eliminar cita: ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}