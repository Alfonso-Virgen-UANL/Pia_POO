<?php
session_start();
header('Content-Type: application/json');
require 'conxBs.php';

// Configurar el reporte de errores
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Función para registrar información en el log
function logDebug($message, $data = null) {
    $logPath = dirname(__FILE__);
    $logFile = $logPath . '/debug_perfil.log';
    $timestamp = date('Y-m-d H:i:s');
    
    if ($data !== null) {
        error_log("[$timestamp] $message: " . print_r($data, true) . "\n", 3, $logFile);
    } else {
        error_log("[$timestamp] $message\n", 3, $logFile);
    }
}

// Registrar inicio de la solicitud
logDebug('Solicitud recibida en actualizar_perfil.php');
logDebug('SESSION', $_SESSION);

// Función para sanear entradas
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

// Verificar que el usuario está autenticado
if (!isset($_SESSION['user_id'])) {
    logDebug('Error: Usuario no autenticado');
    echo json_encode([
        'success' => false,
        'error' => 'Usuario no autenticado'
    ]);
    exit;
}

try {
    // Obtener y procesar los datos enviados
    $inputJSON = file_get_contents('php://input');
    logDebug('Datos JSON recibidos', $inputJSON);
    
    $input = json_decode($inputJSON, TRUE);
    
    if ($input === null) {
        $jsonError = json_last_error_msg();
        logDebug('Error al decodificar JSON', $jsonError);
        throw new Exception('Datos JSON inválidos: ' . $jsonError);
    }
    
    logDebug('Datos procesados', $input);
    
    // Validar datos requeridos
    if (empty($input['nombre']) || empty($input['email']) || empty($input['current_password'])) {
        throw new Exception('Faltan campos requeridos');
    }
    
    // Verificar disponibilidad del archivo de configuración
    $dbConfigPath = dirname(__FILE__) . '/db_config.php';
    if (!file_exists($dbConfigPath)) {
        logDebug('Archivo de configuración no encontrado en', $dbConfigPath);
        throw new Exception('Archivo de configuración de la base de datos no encontrado');
    }
    
    // Conexión a la base de datos
    require_once $dbConfigPath;
    
    // Verificar que las constantes de DB estén definidas
    if (!defined('DB_HOST') || !defined('DB_USER') || !defined('DB_PASS') || !defined('DB_NAME')) {
        throw new Exception('Configuración de base de datos incompleta');
    }
    
    logDebug('Intentando conectar a la base de datos', [
        'host' => DB_HOST,
        'database' => DB_NAME,
        'user' => DB_USER,
    ]);
    
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    if ($conn->connect_error) {
        throw new Exception('Error de conexión a la base de datos: ' . $conn->connect_error);
    }
    
    logDebug('Conexión a la base de datos exitosa');
    
    // Obtener información actual del usuario
    $userId = $_SESSION['user_id'];
    $stmt = $conn->prepare("SELECT password FROM usuarios WHERE id = ?");
    
    if (!$stmt) {
        throw new Exception('Error al preparar la consulta: ' . $conn->error);
    }
    
    $stmt->bind_param("i", $userId);
    
    if (!$stmt->execute()) {
        throw new Exception('Error al ejecutar la consulta: ' . $stmt->error);
    }
    
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception('Usuario no encontrado');
    }
    
    $usuario = $result->fetch_assoc();
    
    // Verificar contraseña actual
    if (!password_verify($input['current_password'], $usuario['password'])) {
        logDebug('Contraseña incorrecta para el usuario', $userId);
        echo json_encode([
            'success' => false,
            'error' => 'La contraseña actual es incorrecta'
        ]);
        exit;
    }
    
    // Sanear datos
    $nombre = sanitizeInput($input['nombre']);
    $email = sanitizeInput($input['email']);
    $telefono = isset($input['telefono']) ? sanitizeInput($input['telefono']) : '';
    
    // Validar email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('El formato del correo electrónico es inválido');
    }
    
    // Verificar si el correo ya está en uso por otro usuario
    $stmt = $conn->prepare("SELECT id FROM usuarios WHERE email = ? AND id != ?");
    $stmt->bind_param("si", $email, $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        echo json_encode([
            'success' => false,
            'error' => 'El correo electrónico ya está en uso por otro usuario'
        ]);
        exit;
    }
    
    // Iniciar la actualización
    $sql = "UPDATE usuarios SET nombre = ?, email = ?, telefono = ?";
    $params = "sss";
    $bindParams = [$nombre, $email, $telefono];
    
    // Si se proporciona una nueva contraseña, actualizarla
    if (!empty($input['password'])) {
        // Hash de la nueva contraseña
        $hashedPassword = password_hash($input['password'], PASSWORD_DEFAULT);
        $sql .= ", password = ?";
        $params .= "s";
        $bindParams[] = $hashedPassword;
    }
    
    $sql .= " WHERE id = ?";
    $params .= "i";
    $bindParams[] = $userId;
    
    logDebug('Preparando consulta SQL', [
        'sql' => $sql,
        'params' => $params,
        'userId' => $userId
    ]);
    
    // Preparar y ejecutar la consulta
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        throw new Exception('Error al preparar la actualización: ' . $conn->error);
    }
    
    $stmt->bind_param($params, ...$bindParams);
    
    if (!$stmt->execute()) {
        throw new Exception('Error al actualizar el perfil: ' . $stmt->error);
    }
    
    logDebug('Perfil actualizado con éxito');
    
    // Actualizar datos de sesión
    $_SESSION['user_name'] = $nombre;
    $_SESSION['user_email'] = $email;
    $_SESSION['user_phone'] = $telefono;
    
    // Devolver respuesta exitosa
    echo json_encode([
        'success' => true,
        'message' => 'Perfil actualizado correctamente',
        'usuario' => [
            'id' => $userId,
            'nombre' => $nombre,
            'email' => $email,
            'telefono' => $telefono
        ]
    ]);
    
} catch (Exception $e) {
    logDebug('Error en actualizar_perfil.php: ' . $e->getMessage());
    
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}