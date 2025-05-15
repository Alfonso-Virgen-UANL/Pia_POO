<?php
header('Content-Type: application/json');
ini_set('display_errors', 0); // Desactivar visualización de errores en producción
error_reporting(E_ALL); // Mantener registro de errores para debugging

// Verificar si se están recibiendo los datos
error_log("Datos recibidos en login.php: " . print_r($_POST, true));

// Iniciamos la sesión para poder guardar datos
session_start();

// Incluir después de los logs para no interferir con la respuesta
require_once 'funciones.php';
require_once 'conxBs.php';

$response = ['success' => false, 'error' => ''];

try {
    // Verificar el método de la petición
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido');
    }

    // Validación básica
    if (empty($_POST['email']) || empty($_POST['password'])) {
        throw new Exception('Email y contraseña son requeridos');
    }

    $email = $_POST['email'];
    $password = $_POST['password'];

    // Registrar datos recibidos (solo para debugging)
    error_log("Intento de login - Email: {$email}");

    // Verificar credenciales
    $stmt = $pdo->prepare("SELECT cliente_id, nombre, telefono, email, password FROM clientes WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        throw new Exception('Credenciales incorrectas');
    }

    // Verificar si la contraseña está en texto plano o con hash
    if ($password === $user['password'] || password_verify($password, $user['password'])) {
        // Guardar datos del usuario en la sesión
        $_SESSION['user_id'] = $user['cliente_id'];
        $_SESSION['user_name'] = $user['nombre'];
        $_SESSION['user_phone'] = $user['telefono'];
        $_SESSION['user_email'] = $user['email'];
        
        $response = [
            'success' => true, 
            'redirect' => 'Inicio.html',
            'userName' => $user['nombre']
        ];
    } else {
        throw new Exception('Credenciales incorrectas');
    }

} catch (PDOException $e) {
    error_log('Error de base de datos: ' . $e->getMessage());
    $response['error'] = 'Error del sistema. Por favor, inténtelo más tarde.';
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
}

echo json_encode($response);
exit;
?>