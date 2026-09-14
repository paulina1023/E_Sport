import { useState } from "react";
import { tieneErrores, validarRegistro } from "../utils/validation.js";
import FormField from "./FormField.jsx";

export default function RegistroForm({ onBack }) {
  const [formulario, setFormulario] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmarPassword: "",
    rol: "Espectador",
  });
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  function actualizar(campo, valor) {
    setFormulario({ ...formulario, [campo]: valor });
    setErrores({ ...errores, [campo]: "" });
    setMensaje("");
  }

  async function registrar(evento) {
    evento.preventDefault();
    const erroresFormulario = validarRegistro(formulario);
    if (tieneErrores(erroresFormulario)) {
      setErrores(erroresFormulario);
      return;
    }
    setCargando(true);
    setMensaje("");
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formulario.nombre.trim(),
          email: formulario.email.trim().toLowerCase(),
          password: formulario.password,
          rol: formulario.rol,
        }),
      });
      const resultado = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(resultado.error || "No fue posible registrarte");
      setMensaje("Registro exitoso. Ya puedes iniciar sesión.");
      setFormulario({
        nombre: "",
        email: "",
        password: "",
        confirmarPassword: "",
        rol: "Espectador",
      });
    } catch (error) {
      setMensaje(error.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <form className="login-form" onSubmit={registrar} noValidate>
      <FormField etiqueta="Nombre completo" error={errores.nombre}>
        <input
          value={formulario.nombre}
          onChange={(evento) => actualizar("nombre", evento.target.value)}
          autoComplete="name"
          aria-invalid={Boolean(errores.nombre)}
        />
      </FormField>
      <FormField etiqueta="Correo electrónico" error={errores.email}>
        <input
          type="email"
          value={formulario.email}
          onChange={(evento) => actualizar("email", evento.target.value)}
          autoComplete="email"
          aria-invalid={Boolean(errores.email)}
        />
      </FormField>
      <FormField etiqueta="Contraseña" error={errores.password}>
        <input
          type="password"
          value={formulario.password}
          onChange={(evento) => actualizar("password", evento.target.value)}
          autoComplete="new-password"
          aria-invalid={Boolean(errores.password)}
        />
      </FormField>
      <FormField etiqueta="Confirmar contraseña" error={errores.confirmarPassword}>
        <input
          type="password"
          value={formulario.confirmarPassword}
          onChange={(evento) => actualizar("confirmarPassword", evento.target.value)}
          autoComplete="new-password"
          aria-invalid={Boolean(errores.confirmarPassword)}
        />
      </FormField>
      <FormField etiqueta="Tipo de cuenta">
        <select
          value={formulario.rol}
          onChange={(evento) => actualizar("rol", evento.target.value)}
        >
          <option value="Delegado">Líder de equipo</option>
          <option value="Espectador">Espectador</option>
        </select>
      </FormField>
      {mensaje && <p className={mensaje.startsWith("Registro exitoso") ? "form-success" : "login-error"}>{mensaje}</p>}
      <button className="primary login-submit" disabled={cargando}>
        {cargando ? "Registrando..." : "Crear cuenta"}
      </button>
      <button type="button" className="auth-link" onClick={onBack}>
        Ya tengo una cuenta, volver al login
      </button>
    </form>
  );
}
