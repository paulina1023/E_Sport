import * as torneoRepository from "../repositories/TorneoRepository.js";
import * as partidoRepository from "../repositories/PartidoRepository.js";
import * as equipoRepository from "../repositories/EquipoRepository.js";
import { conexion } from "../models/ModelosModel.js";

export async function obtenerResumen() {
  const [torneos, equipos, partidos, proximos] = await Promise.all([
    torneoRepository.contarTorneos(),
    torneoRepository.contarEquipos(),
    torneoRepository.contarPartidos(),
    partidoRepository.listarProximos(),
  ]);
  return { torneos, equipos, partidos, proximos };
}

export function obtenerTorneos() {
  return torneoRepository.listarTorneos();
}
export function registrarTorneo(datos) {
  return torneoRepository.crearTorneo(datos);
}

export async function eliminarTorneo(id_torneo, motivo, usuario) {
  const torneo = await torneoRepository.buscarTorneoPorId(id_torneo);
  if (!torneo) return null;
  const transaccion = await conexion.transaction();
  try {
    await torneoRepository.registrarEliminacion(
      { entidad: "Torneo", id_entidad: id_torneo, motivo, id_usuario: usuario.id_usuario },
      transaccion,
    );
    await torneoRepository.eliminarTorneo(id_torneo, transaccion);
    await transaccion.commit();
    return { eliminado: true };
  } catch (error) {
    await transaccion.rollback();
    throw error;
  }
}

export async function finalizarTorneo(id_torneo) {
  const torneo = await torneoRepository.buscarTorneoPorId(id_torneo);
  if (!torneo) return null;
  await torneoRepository.actualizarEstado(id_torneo, "Finalizado");
  return { actualizado: true, estado: "Finalizado" };
}
export function obtenerInscripciones() {
  return torneoRepository.listarInscripciones();
}
export function obtenerPartidos() {
  return partidoRepository.listarPartidos();
}
export async function registrarPartido(datos) {
  if (Number(datos.id_equipo_local) === Number(datos.id_equipo_visita)) {
    const error = new Error("Un partido necesita dos equipos diferentes");
    error.name = "SequelizeValidationError";
    error.errors = [{ message: error.message }];
    throw error;
  }
  return partidoRepository.crearPartido(datos);
}

export async function obtenerTablaPosiciones(id_torneo) {
  const [partidos, inscripciones] = await Promise.all([
    partidoRepository.listarFinalizadosPorTorneo(id_torneo),
    torneoRepository.listarEquiposInscritos(id_torneo),
  ]);
  const tabla = new Map();
  for (const inscripcion of inscripciones) {
    tabla.set(inscripcion.Equipo.id_equipo, {
      id_equipo: inscripcion.Equipo.id_equipo,
      nombre_equipo: inscripcion.Equipo.nombre,
      partidos_jugados: 0,
      ganados: 0,
      empatados: 0,
      perdidos: 0,
      goles_favor: 0,
      goles_contra: 0,
      puntos: 0,
    });
  }
  const actualizar = (id_equipo, goles_favor, goles_contra, puntos) => {
    const registro = tabla.get(id_equipo) || {
      id_equipo,
      partidos_jugados: 0,
      ganados: 0,
      empatados: 0,
      perdidos: 0,
      goles_favor: 0,
      goles_contra: 0,
      puntos: 0,
    };
    registro.partidos_jugados += 1;
    registro.goles_favor += goles_favor;
    registro.goles_contra += goles_contra;
    registro.puntos += puntos;
    if (puntos === 3) registro.ganados += 1;
    else if (puntos === 1) registro.empatados += 1;
    else registro.perdidos += 1;
    tabla.set(id_equipo, registro);
  };
  for (const partido of partidos) {
    const resultado = Math.sign(partido.goles_local - partido.goles_visita);
    actualizar(
      partido.id_equipo_local,
      partido.goles_local,
      partido.goles_visita,
      resultado > 0 ? 3 : resultado === 0 ? 1 : 0,
    );
    actualizar(
      partido.id_equipo_visita,
      partido.goles_visita,
      partido.goles_local,
      resultado < 0 ? 3 : resultado === 0 ? 1 : 0,
    );
  }
  const registros = [...tabla.values()];
  const equipos = await equipoRepository.listarNombresPorIds(
    registros.map(({ id_equipo }) => id_equipo),
  );
  const nombres = new Map(
    equipos.map((equipo) => [equipo.id_equipo, equipo.nombre]),
  );
  return registros
    .map((registro) => ({
      ...registro,
      nombre_equipo:
        registro.nombre_equipo ||
        nombres.get(registro.id_equipo) ||
        `Equipo #${registro.id_equipo}`,
      diferencia_goles: registro.goles_favor - registro.goles_contra,
    }))
    .sort(
      (a, b) => b.puntos - a.puntos || b.diferencia_goles - a.diferencia_goles,
    );
}

export async function registrarResultado(
  id_partido,
  goles_local,
  goles_visita,
) {
  const partido = await partidoRepository.buscarPartidoPorId(id_partido);
  if (!partido) return null;
  const terminoPartido =
    new Date(partido.fecha_hora).getTime() + 90 * 60 * 1000;
  if (
    partido.estado !== "Finalizado" &&
    Date.now() < terminoPartido
  ) {
    const error = new Error(
      "El resultado solo puede registrarse cuando termina el partido",
    );
    error.name = "SequelizeValidationError";
    throw error;
  }
  return partidoRepository.actualizarResultado(
    id_partido,
    goles_local,
    goles_visita,
  );
}
