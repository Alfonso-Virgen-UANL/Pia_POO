<?php
header('Content-Type: application/json');
ini_set('display_errors', 0); // Desactivar visualización de errores en producción
error_reporting(E_ALL); // Mantener registro de errores para debugging

require 'funciones.php';
require 'conxBs.php';

$response = ['success' => false, 'error' => ''];

try {
    // Verificar el método de la petición
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido');
    }

    // Validación de campos requeridos
    if (empty($_POST['name']) || empty($_POST['phone']) || empty($_POST['email']) || empty($_POST['password']) || empty($_POST['confirmPassword'])) {
        throw new Exception('Todos los campos son obligatorios');
    }

    $name = sanitizeInput($_POST['name']);
    $phone = sanitizeInput($_POST['phone']);
    $email = sanitizeInput($_POST['email']);
    $password = $_POST['password']; // No sanitizamos password antes de verificación
    $confirmPassword = $_POST['confirmPassword'];

    // Validaciones
    if (strlen($password) < 8) {
        throw new Exception('La contraseña debe tener al menos 8 caracteres');
    }
    
    if ($password !== $confirmPassword) {
        throw new Exception('Las contraseñas no coinciden');
    }

    // Validar formato de email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('El formato del email no es válido');
    }
    
    // Validar formato de número celular (solo números y 10 dígitos)
    if (!preg_match('/^\d{10}$/', $phone)) {
        throw new Exception('El número celular debe tener 10 dígitos');
    }

    // Verificar si el email ya existe
    $stmt = $pdo->prepare("SELECT COUNT(*) AS count FROM clientes WHERE email = ?");
    $stmt->execute([$email]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($result['count'] > 0) {
        throw new Exception('El email ya está registrado');
    }
    
    // Verificar si el número celular ya existe
    $stmt = $pdo->prepare("SELECT COUNT(*) AS count FROM clientes WHERE telefono = ?");
    $stmt->execute([$phone]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($result['count'] > 0) {
        throw new Exception('El número celular ya está registrado');
    }
    
    $stmt = $pdo->prepare("INSERT INTO clientes (nombre, telefono, email, password) VALUES (?, ?, ?, ?)");
    if ($stmt->execute([$name, $phone, $email, $password])) {
        $response = [
            'success' => true, 
            'message' => 'Registro exitoso. Por favor inicia sesión con tus credenciales.'
        ];
    } else {
        throw new Exception('Error al registrar usuario');
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