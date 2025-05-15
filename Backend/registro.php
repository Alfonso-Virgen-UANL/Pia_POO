<?php
require 'funciones.php';
require 'conxBs.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = sanitizeInput($_POST['name']);
    $email = sanitizeInput($_POST['email']);
    $password = sanitizeInput($_POST['password']);
    $confirmPassword = sanitizeInput($_POST['confirmPassword']);

    // Esto es para las validaciones
    if ($password !== $confirmPassword) {
        echo json_encode(['success' => false, 'error' => 'Las contraseñas no coinciden']);
        exit;
    }

    if (emailExists($email)) {
        echo json_encode(['success' => false, 'error' => 'El email ya está registrado']);
        exit;
    }

    // Para registrar al usuario
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare("INSERT INTO clientes (nombre, email, password) VALUES (?, ?, ?)");
    $stmt->execute([$name, $email, $hashedPassword]);

    echo json_encode(['success' => true, 'message' => 'Registro exitoso']);
    exit;
}
?>