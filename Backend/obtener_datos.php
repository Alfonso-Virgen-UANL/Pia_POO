<?php
session_start();
header('Content-Type: application/json');
require 'conxBs.php';

// Función para obtener todos los barberos activos
function obtenerBarberos($pdo) {
    try {
        $stmt = $pdo->prepare("SELECT barbero_id, nombre FROM barberos WHERE activo = 1");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        error_log('Error al obtener barberos: ' . $e->getMessage());
        return [];
    }
}

// Función para obtener todos los servicios
function obtenerServicios($pdo) {
    try {
        $stmt = $pdo->prepare("SELECT servicio_id, nombre, descripcion, precio FROM servicios");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        error_log('Error al obtener servicios: ' . $e->getMessage());
        return [];
    }
}

// Procesar la solicitud
try {
    $tipo = isset($_GET['tipo']) ? $_GET['tipo'] : 'todo';
    $resultados = [];
    
    if ($tipo === 'barberos' || $tipo === 'todo') {
        $resultados['barberos'] = obtenerBarberos($pdo);
    }
    
    if ($tipo === 'servicios' || $tipo === 'todo') {
        $resultados['servicios'] = obtenerServicios($pdo);
    }
    
    echo json_encode(['success' => true, 'data' => $resultados]);
} catch (Exception $e) {
    error_log('Error en obtener_datos.php: ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>