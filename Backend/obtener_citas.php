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

logDebug('Solicitud recibida en obtener_citas.php');

// Verificar autenticación
if (!isset($_SESSION['user_id'])) {
    logDebug('No hay sesión de usuario activa');
    echo json_encode(['success' => false, 'error' => 'No autenticado']);
    exit;
}

$cliente_id = $_SESSION['user_id'];
logDebug("Obteniendo citas para el cliente ID: $cliente_id");

try {
    // Consulta principal para obtener citas con información básica
    $stmt = $pdo->prepare("
        SELECT 
            c.cita_id, 
            c.fecha, 
            c.hora_inicio, 
            c.hora_fin, 
            b.nombre as barbero_nombre,
            b.barbero_id,
            s.nombre as servicio_principal_nombre
        FROM 
            citas c
        INNER JOIN 
            barberos b ON c.barbero_id = b.barbero_id
        INNER JOIN 
            servicios s ON c.servicio_id = s.servicio_id
        WHERE 
            c.cliente_id = ?
        ORDER BY 
            c.fecha DESC, c.hora_inicio DESC
    ");
    
    $stmt->execute([$cliente_id]);
    $citas = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Si no hay citas, devolver array vacío
    if (empty($citas)) {
        echo json_encode(['success' => true, 'citas' => []]);
        exit;
    }
    
    // Obtener todos los servicios de cada cita
    foreach ($citas as &$cita) {
        // Obtener todos los servicios de la cita
        $stmtServicios = $pdo->prepare("
            SELECT 
                s.servicio_id, 
                s.nombre, 
                s.precio
            FROM 
                cita_servicios cs
            INNER JOIN 
                servicios s ON cs.servicio_id = s.servicio_id
            WHERE 
                cs.cita_id = ?
        ");
        
        $stmtServicios->execute([$cita['cita_id']]);
        $servicios = $stmtServicios->fetchAll(PDO::FETCH_ASSOC);
        
        // Agregar servicios a la cita
        $cita['servicios'] = $servicios;
        
        // Calcular total
        $total = 0;
        $serviciosNombres = [];
        
        foreach ($servicios as $servicio) {
            $total += floatval($servicio['precio']);
            $serviciosNombres[] = $servicio['nombre'];
        }
        
        $cita['total'] = $total;
        $cita['servicios_nombres'] = implode(', ', $serviciosNombres);
    }
    
    echo json_encode(['success' => true, 'citas' => $citas]);
    
} catch (Exception $e) {
    logDebug('Error en obtener_citas.php: ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}