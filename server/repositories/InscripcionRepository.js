import { InscripcionTorneo } from '../models/ModelosModel.js'

export function crearInscripcion(datos, opciones = {}) { return InscripcionTorneo.create(datos, opciones) }
export function buscarInscripcion(id_inscripcion) { return InscripcionTorneo.findByPk(id_inscripcion) }
export function actualizarEstado(id_inscripcion, estado) {
	return InscripcionTorneo.update({ estado }, { where: { id_inscripcion }, returning: true }).then(([actualizadas]) => actualizadas ? buscarInscripcion(id_inscripcion) : null)
}
