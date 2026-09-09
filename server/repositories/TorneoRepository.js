import { Equipo, InscripcionTorneo, Partido, Torneo } from '../models/ModelosModel.js'

export function contarTorneos() { return Torneo.count() }
export function contarEquipos() { return Equipo.count() }
export function contarPartidos() { return Partido.count() }
export function listarTorneos() { return Torneo.findAll({ order: [['fecha_inicio', 'DESC']] }) }
export function crearTorneo(datos) { return Torneo.create(datos) }
export function listarInscripciones() {
  return InscripcionTorneo.findAll({ include: [Torneo, Equipo], order: [['created_at', 'DESC']] })
}
