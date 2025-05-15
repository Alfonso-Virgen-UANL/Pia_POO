<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$host = 'localhost';
$dbname = 'barberia';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "¡Conexión exitosa!";
    
    // Verifica si la tabla usuarios existe
    $stmt = $pdo->query("SHOW TABLES LIKE 'usuarios'");
    if ($stmt->rowCount() > 0) {
        echo "<br>La tabla 'usuarios' existe";
    } else {
        echo "<br>Advertencia: La tabla 'usuarios' NO existe";
    }
    
} catch (PDOException $e) {
    echo "<strong>Error detallado:</strong><br>";
    echo "Mensaje: " . $e->getMessage() . "<br>";
    echo "Código: " . $e->getCode() . "<br>";
    
    // Diagnóstico adicional
    echo "<br><strong>Diagnóstico:</strong><br>";
    if (!extension_loaded('pdo_mysql')) {
        echo "La extensión PDO_MySQL no está habilitada<br>";
    } else {
        echo "PDO_MySQL está habilitado<br>";
    }
    
    echo "PHP Version: " . phpversion();
}