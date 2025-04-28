<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *"); 

$conexion = new mysqli(
    'localhost',     
    'root',   
    '123456789', 
    'barberia'      
);

// Esto verifica la conexión
if ($conexion->connect_error) {
    die(json_encode(['success' => false, 'error' => 'Error de conexión: ' . $conexion->connect_error]));
}

// Este es para recibir los datos del formulario
$fecha = $_POST['fecha'];
$hora = $_POST['hora'];
$servicios = implode(", ", $_POST['servicios']);
$barbero = $_POST['barbero'];

// Esto es nada mas para calcular el total
$total = 0;
foreach ($_POST['servicios'] as $precio) {
    $total += intval($precio);
}

// Y ya aca se manda la información a la base de datos
$stmt = $conexion->prepare("INSERT INTO citas (fecha, hora, servicios, barbero, total) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("ssssd", $fecha, $hora, $servicios, $barbero, $total);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Cita guardada']);
} else {
    echo json_encode(['success' => false, 'error' => $stmt->error]);
}

$stmt->close();
$conexion->close();
?>