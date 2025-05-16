<?php
session_start();
header('Content-Type: application/json');

// Configurar el reporte de errores completo
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
    
    // Incluir directamente las credenciales de la base de datos para mayor seguridad
    // ¡IMPORTANTE! Esto es provisional, en producción debe usar el archivo de configuración apropiado
    define('DB_HOST', 'localhost');  // Asegúrate de que este valor sea correcto
    define('DB_USER', 'root');       // Sustituye por tu usuario de base de datos
    define('DB_PASS', '');           // Sustituye por tu contraseña de base de datos 
    define('DB_NAME', 'barberia');   // Sustituye por el nombre de tu base de datos
    
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
    
    // Obtener información actual del usuario de la tabla clientes
    $userId = $_SESSION['user_id'];
    
    // CORRECCIÓN: Usar la tabla clientes en lugar de usuarios
    $stmt = $conn->prepare("SELECT password FROM clientes WHERE cliente_id = ?");
    
    if (!$stmt) {
        throw new Exception('Error al preparar la consulta: ' . $conn->error);
    }
    
    $stmt->bind_param("i", $userId);
    
    if (!$stmt->execute()) {
        throw new Exception('Error al ejecutar la consulta: ' . $stmt->error);
    }
    
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception('Cliente no encontrado');
    }
    
    $cliente = $result->fetch_assoc();
    
    // Verificar contraseña actual - usando password_verify si las contraseñas están hasheadas
    if ($cliente['password'] !== $input['current_password']) {
        // Nota: Si las contraseñas están hasheadas, debes usar password_verify en su lugar
        logDebug('Contraseña incorrecta para el cliente', $userId);
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
    
    // Verificar si el correo ya está en uso por otro cliente
    // CORRECCIÓN: Usar la tabla clientes y el campo cliente_id
    $stmt = $conn->prepare("SELECT cliente_id FROM clientes WHERE email = ? AND cliente_id != ?");
    $stmt->bind_param("si", $email, $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        echo json_encode([
            'success' => false,
            'error' => 'El correo electrónico ya está en uso por otro cliente'
        ]);
        exit;
    }
    
    // Iniciar la actualización
    // CORRECCIÓN: Usar la tabla clientes
    $sql = "UPDATE clientes SET nombre = ?, email = ?, telefono = ?";
    $params = "sss";
    $bindParams = [$nombre, $email, $telefono];
    
    // Si se proporciona una nueva contraseña, actualizarla
    if (!empty($input['password'])) {
        // Nota: La tabla muestra que password tiene longitud de 50, así que no usamos hash
        // Si quieres usar hash, deberías modificar la estructura de la tabla primero
        $password = $input['password'];
        $sql .= ", password = ?";
        $params .= "s";
        $bindParams[] = $password;
    }
    
    // CORRECCIÓN: Usar cliente_id en lugar de id
    $sql .= " WHERE cliente_id = ?";
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