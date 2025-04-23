create database Barberia;
use Barberia;

create table roles (
    id_rol int not null auto_increment,
    nombre varchar(50) not null,
    privilegios varchar(100) not null,
    primary key(id_rol)
);

create table clientes (
    id_cliente int not null auto_increment,
    nombre varchar(50) not null,
    email varchar(50) not null unique,
    telefono varchar(20) not null,
    fecha_nacimiento date,
    id_rol int not null,
    fecha_registro timestamp default current_timestamp,
    primary key(id_cliente),
    foreign key(id_rol) references roles(id_rol)
);

create table categorias_servicios (
    id_categoria int not null auto_increment,
    nombre varchar(50) not null,
    primary key(id_categoria)
);

create table servicios (
    id_servicio int not null auto_increment,
    nombre varchar(50) not null,
    descripcion varchar(100),
    precio decimal(10,2) not null,
    duracion_min int not null,
    id_categoria int,
    primary key(id_servicio),
    foreign key(id_categoria) references categorias_servicios(id_categoria)
);

create table barberos (
    id_barbero int not null auto_increment,
    nombre varchar(50) not null,
    activo boolean not null default true,
    especialidad varchar(100),
    primary key(id_barbero)
);

create table horarios_barberos (
    id_horario int not null auto_increment,
    id_barbero int not null,
    dia_semana tinyint not null,
    hora_inicio time not null,
    hora_fin time not null,
    primary key(id_horario),
    foreign key(id_barbero) references barberos(id_barbero)
);

create table reservas (
    id_reserva int not null auto_increment,
    id_cliente int not null,
    id_servicio int not null,
    id_barbero int not null,
    fecha date not null,
    hora_inicio time not null,
    hora_fin time not null,
    estado enum('pendiente','confirmada','cancelada','completada') default 'pendiente',
    fecha_creacion timestamp default current_timestamp,
    notas text,
    primary key(id_reserva),
    foreign key(id_cliente) references clientes(id_cliente),
    foreign key(id_servicio) references servicios(id_servicio),
    foreign key(id_barbero) references barberos(id_barbero)
);

create table administradores (
    id_admin int not null auto_increment,
    nombre_usuario varchar(50) not null unique,
    contrasena varchar(255) not null,
    id_rol int not null,
    primary key(id_admin),
    foreign key(id_rol) references roles(id_rol)
);

select * from clientes;
select * from roles;
select * from reserv;
select * from servicios;
select * from admin;