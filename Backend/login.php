<?php
session_start();
header('Content-Type: application/json');
require '../includes/conxBs.php';
require '../includes/funciones.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $email = sanitizeInput($_POST['email']);
        $password = sanitizeInput($_POST['password']);

        $stmt = $pdo->prepare("SELECT id, password FROM usuarios WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_email'] = $email;
            echo json_encode(['success' => true, 'redirect' => '../Inicio.html']);
        } else {
            echo json_encode(['success' => false, 'error' => 'Credenciales incorrectas']);
        }
    } catch (PDOException $e) {
        error_log('Login error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'Error en el servidor']);
    }
}
?>