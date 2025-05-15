<?php
session_start();
header('Content-Type: application/json');
require 'conxBs.php';
require 'funciones.php';

// Registrar información para debug
error_log('Solicitud recibida en guardar_cita.php');
error_log('SESSION: ' . print_r($_SESSION, true));
error_log('POST: ' . print_r($_POST, true));

// Verificar autenticación
if (!isset($_SESSION['user_id'])) {
    error_log('No hay sesión de usuario activa');
    echo json_encode(['success' => false, 'error' => 'No autenticado']);
    exit;
}

try {
    $data = [
        'fecha' => $_POST['fecha'] ?? '',
        'hora' => $_POST['hora'] ?? '',
        'servicios' => $_POST['servicios'] ?? [],
        'barbero' => $_POST['barbero'] ?? ''
    ];

    // Registro para debug
    error_log('Datos procesados: ' . print_r($data, true));

    // Validaciones
    if (empty($data['fecha']) || empty($data['hora']) || empty($data['barbero']) || empty($data['servicios'])) {
        throw new Exception('Todos los campos son requeridos');
    }

    // Calcular total
    $total = array_sum(array_map('intval', $data['servicios']));
    error_log('Total calculado: ' . $total);

    // Insertar cita
    $pdo->beginTransaction();

    $stmt = $pdo->prepare("INSERT INTO citas (usuario_id, fecha, hora, barbero_id, total) VALUES (?, ?, ?, ?, ?)");
    $success = $stmt->execute([
        $_SESSION['user_id'],
        $data['fecha'],
        $data['hora'],
        $data['barbero'],
        $total
    ]);
    
    if (!$success) {
        error_log('Error en la inserción de cita: ' . print_r($stmt->errorInfo(), true));
        throw new Exception('Error al guardar la cita en la base de datos');
    }
    
    $citaId = $pdo->lastInsertId();
    error_log('Cita insertada con ID: ' . $citaId);

    // Insertar servicios
    $stmtServicios = $pdo->prepare("INSERT INTO cita_servicios (cita_id, servicio_id) VALUES (?, ?)");
    foreach ($data['servicios'] as $servicioId) {
        $success = $stmtServicios->execute([$citaId, $servicioId]);
        if (!$success) {
            error_log('Error en la inserción de servicio: ' . print_r($stmtServicios->errorInfo(), true));
            throw new Exception('Error al guardar los servicios');
        }
    }

    $pdo->commit();
    echo json_encode(['success' => true, 'message' => 'Cita agendada con éxito']);
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('Error en guardar_cita: ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>