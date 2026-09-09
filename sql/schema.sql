CREATE DATABASE IF NOT EXISTS `e-sports`;
USE `e-sports`;

CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  rol ENUM('Administrador', 'Delegado', 'Espectador') NOT NULL DEFAULT 'Espectador',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS torneos (
  id_torneo INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  modalidad ENUM('Eliminacion Directa', 'Fase de Grupos', 'Liga') NOT NULL DEFAULT 'Liga',
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  estado ENUM('Inscripcion', 'En Curso', 'Finalizado') NOT NULL DEFAULT 'Inscripcion',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS equipos (
  id_equipo INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  escudo_url VARCHAR(255),
  id_delegado INT NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (id_delegado) REFERENCES usuarios(id_usuario)
);

CREATE TABLE IF NOT EXISTS jugadores (
  id_jugador INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  apellido VARCHAR(50) NOT NULL,
  dorsal INT NOT NULL,
  id_equipo INT NOT NULL,
  FOREIGN KEY (id_equipo) REFERENCES equipos(id_equipo)
);

CREATE TABLE IF NOT EXISTS inscripciones_torneo (
  id_inscripcion INT AUTO_INCREMENT PRIMARY KEY,
  id_torneo INT NOT NULL,
  id_equipo INT NOT NULL,
  estado ENUM('Pendiente', 'Aprobado', 'Rechazado') NOT NULL DEFAULT 'Pendiente',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  UNIQUE KEY torneo_equipo (id_torneo, id_equipo),
  FOREIGN KEY (id_torneo) REFERENCES torneos(id_torneo),
  FOREIGN KEY (id_equipo) REFERENCES equipos(id_equipo)
);

CREATE TABLE IF NOT EXISTS partidos (
  id_partido INT AUTO_INCREMENT PRIMARY KEY,
  id_torneo INT NOT NULL,
  id_equipo_local INT NOT NULL,
  id_equipo_visita INT NOT NULL,
  jornada_numero INT NOT NULL,
  fecha_hora DATETIME NOT NULL,
  goles_local INT NOT NULL DEFAULT 0,
  goles_visita INT NOT NULL DEFAULT 0,
  cancha VARCHAR(100) NOT NULL,
  estado ENUM('Programado', 'En Juego', 'Finalizado', 'Suspendido') NOT NULL DEFAULT 'Programado',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (id_torneo) REFERENCES torneos(id_torneo),
  FOREIGN KEY (id_equipo_local) REFERENCES equipos(id_equipo),
  FOREIGN KEY (id_equipo_visita) REFERENCES equipos(id_equipo)
);
