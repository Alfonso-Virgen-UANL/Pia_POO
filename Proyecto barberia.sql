create database Barberia;
use Barberia;

create table clientes (
	id_c int not null auto_increment,
    nombre varchar(50) not null,
    email varchar(50) not null,
    telefono int(10) not null,
    edad int not null,
    primary key(id_c)
);

create table servicios (
	id_s int not null auto_increment,
    descr varchar(100),
    precio float not null,
    primary key(id_s)
);

create table reserv (
	id_res int not null,
    hora datetime not null,
    fecha date not null,
    id_s int,
    id_c int,
    foreign key(id_s) references servicios(id_s),
    foreign key(id_c) references clientes(id_c)
);
