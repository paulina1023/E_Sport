import * as equipoRepository from "../repositories/EquipoRepository.js";
import * as inscripcionRepository from "../repositories/InscripcionRepository.js";
import { conexion } from "../models/ModelosModel.js";

export async function registrarEquipo(datos, id_delegado) {
  const { id_torneo, ...datosEquipo } = datos;
  const transaccion = await conexion.transaction();
  try {
    const equipo = await equipoRepository.crearEquipo(
      { ...datosEquipo, id_delegado },
      { transaction: transaccion },
    );
    const inscripcion = await inscripcionRepository.crearInscripcion(
      { id_torneo, id_equipo: equipo.id_equipo },
      { transaction: transaccion },
    );
    await transaccion.commit();
    return { equipo, inscripcion };
  } catch (error) {
    await transaccion.rollback();
    throw error;
  }
}
export function obtenerEquipos() {
  return equipoRepository.listarEquipos();
}
export function obtenerEquiposDelDelegado(id_delegado) {
  return equipoRepository.listarEquiposPorDelegado(id_delegado);
}
export async function registrarJugador(datos, id_equipo, id_delegado) {
  const equipo = await equipoRepository.buscarEquipoPorId(id_equipo);
  if (!equipo || equipo.id_delegado !== id_delegado) return null;
  return equipoRepository.agregarJugador({ ...datos, id_equipo });
}
export async function solicitarInscripcion(id_torneo, id_equipo, id_delegado) {
  const equipo = await equipoRepository.buscarEquipoPorId(id_equipo);
  if (!equipo || equipo.id_delegado !== id_delegado) return null;
  return inscripcionRepository.crearInscripcion({ id_torneo, id_equipo });
}
export function decidirInscripcion(id_inscripcion, estado) {
  return inscripcionRepository.actualizarEstado(id_inscripcion, estado);
}
