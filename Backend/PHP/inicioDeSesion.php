<?php
require '../includes/funciones.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = sanitizeInput($_POST['email']);
    $password = sanitizeInput($_POST['password']);

    // Esto es para validar las credenciales
    $stmt = $pdo->prepare("SELECT id, password FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        session_start();
        $_SESSION['user_id'] = $user['id'];
        echo json_encode(['success' => true, 'redirect' => 'Inicio.html']);
    } else {
        echo json_encode(['success' => false, 'error' => 'Credenciales incorrectas']);
    }
    exit;
}
?>