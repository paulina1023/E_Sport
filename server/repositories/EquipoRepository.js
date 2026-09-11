import { Op } from 'sequelize'
import { Equipo, Jugador } from '../models/ModelosModel.js'

export function crearEquipo(datos, opciones = {}) { return Equipo.create(datos, opciones) }
export function agregarJugador(datos) { return Jugador.create(datos) }
export function buscarEquipoPorDelegado(id_delegado) { return Equipo.findOne({ where: { id_delegado } }) }
export function buscarEquipoPorId(id_equipo) { return Equipo.findByPk(id_equipo) }
export function listarEquipos() { return Equipo.findAll({ include: [Jugador], order: [['nombre', 'ASC']] }) }
export function listarEquiposPorDelegado(id_delegado) {
	return Equipo.findAll({ where: { id_delegado }, include: [Jugador], order: [['nombre', 'ASC']] })
}
export function listarNombresPorIds(ids) {
	return Equipo.findAll({ where: { id_equipo: { [Op.in]: ids } }, attributes: ['id_equipo', 'nombre'] })
}
