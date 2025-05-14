use Barberia;

-- Tabla de Barberos
CREATE TABLE barberos (
    barbero_id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    telefono VARCHAR(15),
    email VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE
);

-- Tabla de Horarios Laborales (disponibilidad base)
CREATE TABLE horarios_laborales (
    horario_id INT PRIMARY KEY AUTO_INCREMENT,
    barbero_id INT NOT NULL,
    dia_semana TINYINT NOT NULL, -- 1=Lunes, 2=Martes, ..., 7=Domingo
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    FOREIGN KEY (barbero_id) REFERENCES barberos(barbero_id),
    UNIQUE KEY (barbero_id, dia_semana, hora_inicio)
);

-- Tabla de Excepciones (vacaciones, días libres)
CREATE TABLE excepciones_horario (
    excepcion_id INT PRIMARY KEY AUTO_INCREMENT,
    barbero_id INT NOT NULL,
    fecha DATE NOT NULL,
    todo_el_dia BOOLEAN DEFAULT TRUE,
    hora_inicio TIME,
    hora_fin TIME,
    motivo VARCHAR(255),
    FOREIGN KEY (barbero_id) REFERENCES barberos(barbero_id)
);

-- Tabla de Clientes
CREATE TABLE clientes (
    cliente_id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    telefono VARCHAR(15) NOT NULL,
    email VARCHAR(100),
    fecha_registro DATE DEFAULT CURRENT_DATE
);

-- Tabla de Servicios
CREATE TABLE servicios (
    servicio_id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT,
    duracion INT NOT NULL, -- en minutos
    precio DECIMAL(10,2) NOT NULL
);

-- Tabla de Citas
CREATE TABLE citas (
    cita_id INT PRIMARY KEY AUTO_INCREMENT,
    barbero_id INT NOT NULL,
    cliente_id INT NOT NULL,
    servicio_id INT NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    estado ENUM('pendiente', 'confirmada', 'completada', 'cancelada') DEFAULT 'pendiente',
    notas TEXT,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (barbero_id) REFERENCES barberos(barbero_id),
    FOREIGN KEY (cliente_id) REFERENCES clientes(cliente_id),
    FOREIGN KEY (servicio_id) REFERENCES servicios(servicio_id),
    UNIQUE KEY (barbero_id, fecha, hora_inicio)
);