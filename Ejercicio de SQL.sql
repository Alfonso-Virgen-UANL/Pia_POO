create database ejercicio;
use ejercicio;
create table clientes (
	id_c int not null auto_increment,
    name varchar(50) not null,
    email varchar(50) not null,
    primary key(id_c)
);

create table pedidos (
	id int not null auto_increment,
    id_c int,
    p_name varchar(50) not null,
    precio float,
    primary key(id), 
    foreign key(id_c) references clientes(id_c)
);

insert into clientes (name, email) 
values 
("Juan","juan@gmail.com"),
("Oscar","oscar@gmail.com"),
("Elsa","elsa@outlook.com"),
("Esteban","esteban@gmail.com"),
("Daniel","daniel@uanl.edu.mx")
;

insert into pedidos (id_c, p_name, precio)
value 
	(1, "leche", 20.5),
    (1, "huevo", 10.5),
    (1, "jamon", 40),
    (2, "queso", 35.70),
    (2, "leche", 20.5),
    (4, "huevo", 10.5),
    (3, "chocolate", 12.25),
    (5, "carne", 50.85),
    (1, "pollo", 45.44),
    (3, "agua", 8.20),
    (2, "huevo", 10.5),
    (4, "leche", 20.5),
    (5, "huevo", 10.5),
    (3, "leche", 20.5),
    (2, "pan", 22.32)
;

select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_name = "clientes";
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_name = "pedidos";

alter table clientes add column telefono varchar(15);

insert into clientes (name,email,telefono) values ("Jose", "jose@gmail.com", "8153952481");
insert into pedidos (id_c, p_name, precio) 
values 
	(6,"pan", 22.32),
    (6, "pollo", 45.44),
    (6, "agua", 8.20),
    (6, "huevo", 10.5)
;

select * from clientes;
select * from pedidos;

select c.id_c, c.name, p.p_name, p.precio from clientes c left join pedidos p on c.id_c = p.id_c;

select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_name = "clientes";