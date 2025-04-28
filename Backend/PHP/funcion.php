<?php
require 'db.php';

function sanitizeInput($data) {
    return htmlspecialchars(strip_tags(trim($data)));
}

function emailExists($email) {
    global $pdo;
    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
    return $stmt->fetch() !== false;
}

function redirect($url) {
    header("Location: $url");
    exit;
}
?>