export function validarEmail(valor) {
  const email = valor.trim();
  if (!email) return "El correo es obligatorio";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Introduce un correo electrónico válido";
  }
  return "";
}

export function validarNombre(valor) {
  const nombre = valor.trim();
  if (!nombre) return "El nombre es obligatorio";
  if (nombre.length < 2) return "El nombre debe tener al menos 2 caracteres";
  if (nombre.length > 100) return "El nombre no puede superar 100 caracteres";
  return "";
}

export function validarPassword(valor) {
  if (!valor) return "La contraseña es obligatoria";
  if (valor.length < 8) return "La contraseña debe tener al menos 8 caracteres";
  if (valor.length > 72) return "La contraseña no puede superar 72 caracteres";
  return "";
}

export function validarLogin(formulario) {
  return {
    email: validarEmail(formulario.email),
    password: validarPassword(formulario.password),
  };
}

export function validarRegistro(formulario) {
  const errores = {
    nombre: validarNombre(formulario.nombre),
    email: validarEmail(formulario.email),
    password: validarPassword(formulario.password),
    confirmarPassword: "",
  };
  if (!formulario.confirmarPassword) {
    errores.confirmarPassword = "Confirma la contraseña";
  } else if (formulario.password !== formulario.confirmarPassword) {
    errores.confirmarPassword = "Las contraseñas no coinciden";
  }
  return errores;
}

export function tieneErrores(errores) {
  return Object.values(errores).some(Boolean);
}
