import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as usuarioRepository from "../repositories/UsuarioRepository.js";

export const usuariosIniciales = [
  {
    nombre: "Espectador General",
    email: "espectador@esports.local",
    password: "Espectador123!",
    rol: "Espectador",
  },
  {
    nombre: "Líder de Equipo",
    email: "lider@esports.local",
    password: "Lider123!",
    rol: "Delegado",
  },
  {
    nombre: "Administrador de Torneos",
    email: "admin@esports.local",
    password: "Admin123!",
    rol: "Administrador",
  },
];

export async function crearUsuariosIniciales() {
  for (const datos of usuariosIniciales) {
    const usuarioExistente = await usuarioRepository.buscarPorEmail(
      datos.email,
    );
    if (!usuarioExistente) {
      await usuarioRepository.crearUsuario({
        ...datos,
        password: await bcrypt.hash(datos.password, 10),
      });
    }
  }
}

export async function registrar(datos) {
  const usuarioExistente = await usuarioRepository.buscarPorEmail(datos.email);
  if (usuarioExistente) return { conflicto: true };
  const password = await bcrypt.hash(datos.password, 10);
  const rol = datos.rol === "Delegado" ? "Delegado" : "Espectador";
  const usuario = await usuarioRepository.crearUsuario({
    ...datos,
    rol,
    password,
  });
  return { usuario };
}

export async function iniciarSesion(email, password) {
  const usuario = await usuarioRepository.buscarPorEmail(email);
  if (!usuario || !(await bcrypt.compare(password, usuario.password)))
    return null;
  const token = jwt.sign(
    {
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      rol: usuario.rol,
    },
    process.env.JWT_SECRET || "esports-dev-secret",
    { expiresIn: "8h" },
  );
  return { token, usuario };
}
