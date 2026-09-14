import { Router } from "express";
import { autenticar, autorizar } from "./middleware/autenticacion.js";
import { validarCamposRequeridos } from "./middleware/validacion.js";
import * as autenticacionController from "./controllers/AutenticacionController.js";
import * as torneoController from "./controllers/TorneoController.js";

const enrutador = Router();
enrutador.get("/health", (req, res) =>
  res.json({ status: "ok", service: "E-Sports API" }),
);
enrutador.post(
  "/auth/register",
  validarCamposRequeridos("nombre", "email", "password"),
  autenticacionController.registrar,
);
enrutador.post(
  "/auth/login",
  validarCamposRequeridos("email", "password"),
  autenticacionController.iniciarSesion,
);
enrutador.get("/dashboard", torneoController.obtenerResumen);
enrutador.get("/torneos", torneoController.obtenerTorneos);
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
enrutador.get("/partidos", torneoController.obtenerPartidos);
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
