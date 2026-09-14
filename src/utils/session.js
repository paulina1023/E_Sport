export function normalizarSesion(valor) {
  if (!valor?.token) return null;
  const usuario = valor.user || valor.usuario;
  if (!usuario) return null;
  return { ...valor, user: usuario };
}
