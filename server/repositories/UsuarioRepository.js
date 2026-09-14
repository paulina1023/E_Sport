import { Usuario } from '../models/ModelosModel.js'

export function buscarPorEmail(email) {
  return Usuario.findOne({ where: { email } })
}

export function crearUsuario(datos) {
  return Usuario.create(datos)
}
