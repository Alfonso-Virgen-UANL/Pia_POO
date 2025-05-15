<?php
session_start();
header('Content-Type: application/json');
require 'conxBs.php';
require 'funciones.php';

// Verificar autenticación
if (!isset($_SESSION['user_id'])) {
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

    // Validaciones
    if (empty($data['fecha']) || empty($data['hora']) || empty($data['barbero']) || empty($data['servicios'])) {
        throw new Exception('Todos los campos son requeridos');
    }

    // Calcular total
    $total = array_sum(array_map('intval', $data['servicios']));

    // Insertar cita
    $pdo->beginTransaction();

    $stmt = $pdo->prepare("INSERT INTO citas (usuario_id, fecha, hora, barbero_id, total) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([
        $_SESSION['user_id'],
        $data['fecha'],
        $data['hora'],
        $data['barbero'],
        $total
    ]);
    $citaId = $pdo->lastInsertId();

    // Insertar servicios
    $stmtServicios = $pdo->prepare("INSERT INTO cita_servicios (cita_id, servicio_id) VALUES (?, ?)");
    foreach ($data['servicios'] as $servicioId) {
        $stmtServicios->execute([$citaId, $servicioId]);
    }

    $pdo->commit();
    echo json_encode(['success' => true, 'message' => 'Cita agendada']);
} catch (Exception $e) {
    $pdo->rollBack();
    error_log('Error en guardar_cita: ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>