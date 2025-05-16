<?php
session_start();
header('Content-Type: application/json');
require 'conxBs.php';
require 'funciones.php';

// Función para registrar información en el log
function logDebug($message, $data = null) {
    if ($data !== null) {
        error_log($message . ': ' . print_r($data, true));
    } else {
        error_log($message);
    }
}

logDebug('Solicitud recibida en guardar_cita.php');
logDebug('SESSION', $_SESSION);
logDebug('POST', $_POST);

// Verificar autenticación
if (!isset($_SESSION['user_id'])) {
    logDebug('No hay sesión de usuario activa');
    echo json_encode(['success' => false, 'error' => 'No autenticado']);
    exit;
}

// Variable para controlar si hay una transacción activa
$transaction_active = false;

try {
    // Recoger datos del formulario
    $fecha = isset($_POST['fecha']) ? $_POST['fecha'] : '';
    $hora = isset($_POST['hora']) ? $_POST['hora'] : '';
    $barbero_id = isset($_POST['barbero']) ? intval($_POST['barbero']) : 0;
    $servicios = isset($_POST['servicios']) ? $_POST['servicios'] : [];
    $total = isset($_POST['total']) ? floatval($_POST['total']) : 0;
    
    // Cliente ID lo obtenemos de la sesión
    $cliente_id = $_SESSION['user_id'];
    
    logDebug("Datos procesados", [
        'fecha' => $fecha,
        'hora' => $hora,
        'barbero_id' => $barbero_id,
        'cliente_id' => $cliente_id, 
        'servicios' => $servicios
    ]);
    
    // Validaciones
    if (empty($fecha) || empty($hora) || empty($barbero_id) || empty($servicios)) {
        throw new Exception('Todos los campos son requeridos');
    }
    
    // Si no se proporcionó total, lo calculamos
    if ($total <= 0) {
        // Obtener precios de servicios de la BD
        $stmt = $pdo->prepare("SELECT SUM(precio) as total FROM servicios WHERE servicio_id IN (" . 
                            implode(',', array_fill(0, count($servicios), '?')) . ")");
        $stmt->execute($servicios);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $total = $result['total'] ?? 0;
    }
    
    logDebug("Total calculado: $total");
    
    // Verificar disponibilidad del barbero en esa fecha y hora
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as existe FROM citas 
        WHERE barbero_id = ? AND fecha = ? AND 
        ((hora_inicio <= ? AND hora_fin > ?) OR 
        (hora_inicio < DATE_ADD(?, INTERVAL 30 MINUTE) AND hora_fin >= DATE_ADD(?, INTERVAL 30 MINUTE)))
    ");
    $stmt->execute([$barbero_id, $fecha, $hora, $hora, $hora, $hora]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($result['existe'] > 0) {
        throw new Exception('El barbero no está disponible en ese horario. Por favor, selecciona otra fecha u hora.');
    }
    
    // Calcular hora de finalización (30 minutos por cita)
    $hora_fin = date('H:i:s', strtotime($hora) + 30*60);
    
    // Asegurarnos de que la tabla cita_servicios existe
    try {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS cita_servicios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                cita_id INT NOT NULL,
                servicio_id INT NOT NULL,
                FOREIGN KEY (cita_id) REFERENCES citas(cita_id) ON DELETE CASCADE,
                FOREIGN KEY (servicio_id) REFERENCES servicios(servicio_id)
            )
        ");
        logDebug('Tabla cita_servicios verificada/creada');
    } catch (Exception $e) {
        logDebug('Error al verificar tabla cita_servicios: ' . $e->getMessage());
        // Continuamos a pesar del error ya que la tabla podría existir
    }
    
    // Limpiar cualquier transacción pendiente
    if ($pdo->inTransaction()) {
        logDebug('Cerrando transacción pendiente');
        $pdo->commit();
    }
    
    // Iniciar transacción
    $pdo->beginTransaction();
    $transaction_active = true;
    logDebug('Nueva transacción iniciada');
    
    // Insertar la cita con campo estado VARCHAR
    $stmt = $pdo->prepare("
        INSERT INTO citas (barbero_id, cliente_id, servicio_id, fecha, hora_inicio, hora_fin, estado) 
        VALUES (?, ?, ?, ?, ?, ?, 'pendiente')
    ");
    
    // Para simplificar, usamos el primer servicio como servicio_id principal
    $servicio_principal = $servicios[0];
    
    logDebug('Ejecutando inserción de cita', [
        'barbero_id' => $barbero_id,
        'cliente_id' => $cliente_id,
        'servicio_principal' => $servicio_principal,
        'fecha' => $fecha,
        'hora' => $hora,
        'hora_fin' => $hora_fin,
        'estado' => 'pendiente'
    ]);
    
    $success = $stmt->execute([
        $barbero_id,
        $cliente_id,
        $servicio_principal,
        $fecha,
        $hora,
        $hora_fin
    ]);
    
    if (!$success) {
        logDebug('Error en la inserción de cita', $stmt->errorInfo());
        throw new Exception('Error al guardar la cita en la base de datos');
    }
    
    $cita_id = $pdo->lastInsertId();
    logDebug('Cita insertada con ID: ' . $cita_id);
    
    // Insertar todos los servicios seleccionados
    $stmtServicios = $pdo->prepare("INSERT INTO cita_servicios (cita_id, servicio_id) VALUES (?, ?)");
    foreach ($servicios as $servicio_id) {
        $success = $stmtServicios->execute([$cita_id, $servicio_id]);
        if (!$success) {
            logDebug('Error en la inserción de servicio', $stmtServicios->errorInfo());
            throw new Exception('Error al guardar los servicios');
        }
    }
    
    // Confirmar transacción solo si está activa
    if ($transaction_active) {
        $pdo->commit();
        $transaction_active = false;
        logDebug('Transacción completada correctamente');
    }
    
    echo json_encode([
        'success' => true, 
        'message' => 'Cita agendada con éxito', 
        'cita_id' => $cita_id
    ]);
    
} catch (Exception $e) {
    logDebug('Excepción capturada: ' . $e->getMessage());
    
    // Intentar rollback solo si hay una transacción activa
    try {
        if ($transaction_active && isset($pdo) && $pdo->inTransaction()) {
            logDebug('Haciendo rollback de la transacción');
            $pdo->rollBack();
            $transaction_active = false;
        }
    } catch (Exception $rollback_error) {
        logDebug('Error al hacer rollback: ' . $rollback_error->getMessage());
        // No relanzamos esta excepción para no enmascarar el error original
    }
    
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} finally {
    // Asegurarse de que no queden transacciones pendientes
    try {
        if ($transaction_active && isset($pdo) && $pdo->inTransaction()) {
            logDebug('Cerrando transacción pendiente en finally');
            $pdo->rollBack();
        }
    } catch (Exception $e) {
        logDebug('Error en bloque finally: ' . $e->getMessage());
    }
}