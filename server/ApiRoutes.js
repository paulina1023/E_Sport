import { Router } from "express";
import { autenticar, autorizar } from "./middleware/AuthMiddleware.js";

import {
  validarCamposRequeridos,
  validarLogin,
  validarRegistro,
} from "./middleware/ValidationMiddleware.js";

import * as autenticacionController from "./controllers/AutenticacionController.js";
import * as torneoController from "./controllers/TorneoController.js";
import * as equipoController from "./controllers/EquipoController.js";

const enrutador = Router();
enrutador.get("/health", (req, res) =>
  res.json({ status: "ok", service: "E-Sports API" }),
);
enrutador.post(
  "/auth/register",
  validarRegistro,
  autenticacionController.registrar,
);
enrutador.post(
  "/auth/login",
  validarLogin,
  validarLogin,
  autenticacionController.iniciarSesion,
);
enrutador.get("/dashboard", torneoController.obtenerResumen);
enrutador.get("/torneos", torneoController.obtenerTorneos);
enrutador.get("/equipos", equipoController.obtenerEquipos);
enrutador.get(
  "/equipos/mios",
  autenticar,
  autorizar("Delegado"),
  equipoController.obtenerEquiposDelDelegado,
);
enrutador.post(
  "/torneos",
  autenticar,
  autorizar("Administrador"),
  validarCamposRequeridos("nombre", "categoria", "fecha_inicio", "fecha_fin"),
  torneoController.registrarTorneo,
);
enrutador.get(
  "/inscripciones",
  autenticar,
  autorizar("Administrador", "Delegado"),
  torneoController.obtenerInscripciones,
);
enrutador.post(
  "/equipos",
  autenticar,
  autorizar("Delegado"),
  validarCamposRequeridos("nombre", "id_torneo"),
  equipoController.registrarEquipo,
);
enrutador.post(
  "/equipos/:id_equipo/jugadores",
  autenticar,
  autorizar("Delegado"),
  validarCamposRequeridos("nombre", "apellido", "dorsal"),
  equipoController.registrarJugador,
);
enrutador.post(
  "/torneos/:id_torneo/equipos/:id_equipo/inscripcion",
  autenticar,
  autorizar("Delegado"),
  equipoController.solicitarInscripcion,
);
enrutador.patch(
  "/inscripciones/:id_inscripcion",
  autenticar,
  autorizar("Administrador"),
  validarCamposRequeridos("estado"),
  equipoController.decidirInscripcion,
);
enrutador.get("/partidos", torneoController.obtenerPartidos);
enrutador.get(
  "/torneos/:id_torneo/tabla-posiciones",
  torneoController.obtenerTablaPosiciones,
);
enrutador.post(
  "/partidos",
  autenticar,
  autorizar("Administrador"),
  validarCamposRequeridos(
    "id_torneo",
    "id_equipo_local",
    "id_equipo_visita",
    "jornada_numero",
    "fecha_hora",
    "cancha",
  ),
  torneoController.registrarPartido,
);
enrutador.patch(
  "/partidos/:id_partido/resultado",
  autenticar,
  autorizar("Administrador"),
  validarCamposRequeridos("goles_local", "goles_visita"),
  torneoController.registrarResultado,
);
export default enrutador;