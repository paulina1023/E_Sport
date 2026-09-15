import {
  Equipo,
  InscripcionTorneo,
  Partido,
  Torneo,
  RegistroEliminacion,
} from "../models/ModelosModel.js";

export function contarTorneos() {
  return Torneo.count();
}
export function contarEquipos() {
  return Equipo.count();
}
export function contarPartidos() {
  return Partido.count();
}
export function listarTorneos() {
  return Torneo.findAll({ order: [["fecha_inicio", "DESC"]] });
}
export function crearTorneo(datos) {
  return Torneo.create(datos);
}
export function buscarTorneoPorId(id_torneo) {
  return Torneo.findByPk(id_torneo);
}
export function actualizarEstado(id_torneo, estado) {
  return Torneo.update({ estado }, { where: { id_torneo } });
}
export function listarInscripciones() {
  return InscripcionTorneo.findAll({
    include: [Torneo, Equipo],
    order: [["created_at", "DESC"]],
  });
}

export function listarEquiposInscritos(id_torneo) {
  return InscripcionTorneo.findAll({
    where: { id_torneo, estado: "Aprobado" },
    include: [{ model: Equipo, attributes: ["id_equipo", "nombre"] }],
    order: [[Equipo, "nombre", "ASC"]],
  });
}

export async function eliminarTorneo(id_torneo, transaccion) {
  await Partido.destroy({ where: { id_torneo }, transaction: transaccion });
  await InscripcionTorneo.destroy({ where: { id_torneo }, transaction: transaccion });
  return Torneo.destroy({ where: { id_torneo }, transaction: transaccion });
}

export function registrarEliminacion(datos, transaccion) {
  return RegistroEliminacion.create(datos, { transaction: transaccion });
}
