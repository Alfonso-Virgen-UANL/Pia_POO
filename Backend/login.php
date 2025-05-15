<?php
session_start();
header('Content-Type: application/json'); // Para respuestas JSON consistentes

require 'funciones.php';
require 'conxBs.php';

$response = ['success' => false, 'error' => ''];

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido');
    }

    // Validación básica
    if (empty($_POST['email']) || empty($_POST['password'])) {
        throw new Exception('Email y contraseña son requeridos');
    }

    $email = $_POST['email']; // No necesitas sanitizar para consultas preparadas
    $password = $_POST['password'];

    // Verificar credenciales (versión para tabla CLIENTES)
    $stmt = $pdo->prepare("SELECT cliente_id, nombre, email, password FROM clientes WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        throw new Exception('Credenciales incorrectas');
    }

    // Versión SIN hash (si password está en texto plano)
    if ($password === $user['password']) {
        $_SESSION['user_id'] = $user['cliente_id'];
        $_SESSION['user_name'] = $user['nombre'];
        
        echo json_encode([
            'success' => true, 
            'redirect' => 'Inicio.html'
        ]);
        exit;
    }
    
    // Si llegas aquí, la contraseña no coincidió
    throw new Exception('Credenciales incorrectas');

} catch (PDOException $e) {
    error_log('Error de base de datos: ' . $e->getMessage());
    $response['error'] = 'Error del sistema';
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
}

echo json_encode($response);
?>