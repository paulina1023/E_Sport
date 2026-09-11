import { Op } from 'sequelize'
import { Partido, Torneo } from '../models/ModelosModel.js'

export function listarPartidos() {
  return Partido.findAll({ include: [Torneo], order: [['fecha_hora', 'ASC']] })
}

export function listarProximos() {
  return Partido.findAll({
    where: { estado: { [Op.ne]: 'Finalizado' } },
    include: [Torneo],
    order: [['fecha_hora', 'ASC']],
    limit: 4,
  })
}

export function crearPartido(datos) { return Partido.create(datos) }
export function buscarPartidoPorId(id_partido) { return Partido.findByPk(id_partido) }

export async function actualizarResultado(id_partido, goles_local, goles_visita) {
  const partido = await buscarPartidoPorId(id_partido)
  if (!partido) return null
  await partido.update({ goles_local, goles_visita, estado: 'Finalizado' })
  return partido
}

export function listarFinalizadosPorTorneo(id_torneo) {
  return Partido.findAll({
    where: { id_torneo, estado: 'Finalizado' },
    include: [
      { model: Torneo, attributes: [] },
    ],
  })
}
