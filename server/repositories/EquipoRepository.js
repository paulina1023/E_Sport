import { Op } from "sequelize";
import {
  Equipo,
  Jugador,
  Partido,
  InscripcionTorneo,
  Torneo,
} from "../models/ModelosModel.js";

export function crearEquipo(datos, opciones = {}) {
  return Equipo.create(datos, opciones);
}
export function agregarJugador(datos) {
  return Jugador.create(datos);
}
export function buscarEquipoPorDelegado(id_delegado) {
  return Equipo.findOne({ where: { id_delegado } });
}
export function buscarEquipoPorId(id_equipo) {
  return Equipo.findByPk(id_equipo);
}
export function actualizarEstado(id_equipo, estado) {
  return Equipo.update({ estado }, { where: { id_equipo } });
}
export function listarEquipos() {
  return Equipo.findAll({
    include: [Jugador, { model: Torneo, through: { attributes: ["estado"] } }],
    order: [["nombre", "ASC"]],
  });
}
export function listarEquiposPorDelegado(id_delegado) {
  return Equipo.findAll({
    where: { id_delegado },
    include: [Jugador, { model: Torneo, through: { attributes: ["estado"] } }],
    order: [["nombre", "ASC"]],
  });
}
export function listarNombresPorIds(ids) {
  return Equipo.findAll({
    where: { id_equipo: { [Op.in]: ids } },
    attributes: ["id_equipo", "nombre"],
  });
}

export async function eliminarEquipo(id_equipo, transaccion) {
  await Partido.destroy({ where: { id_equipo_local: id_equipo }, transaction: transaccion });
  await Partido.destroy({ where: { id_equipo_visita: id_equipo }, transaction: transaccion });
  await InscripcionTorneo.destroy({ where: { id_equipo }, transaction: transaccion });
  await Jugador.destroy({ where: { id_equipo }, transaction: transaccion });
  return Equipo.destroy({ where: { id_equipo }, transaction: transaccion });
}
