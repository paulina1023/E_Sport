import { useState } from "react";
import { tieneErrores, validarLogin } from "../utils/validation.js";
import FormField from "./FormField.jsx";

const perfilesIniciales = [
  {
    rol: "Espectador",
    etiqueta: "Espectador",
    email: "espectador@esports.local",
    password: "Espectador123!",
  },
  {
    rol: "Delegado",
    etiqueta: "Líder de equipo",
    email: "lider@esports.local",
    password: "Lider123!",
  },
  {
    rol: "Administrador",
    etiqueta: "Administrador de torneos",
    email: "admin@esports.local",
    password: "Admin123!",
  },
];

export default function LoginForm({ onLogin, onRegister }) {
  const [perfil, setPerfil] = useState(perfilesIniciales[2]);
  const [formulario, setFormulario] = useState({
    email: perfilesIniciales[2].email,
    password: perfilesIniciales[2].password,
  });
  const [errores, setErrores] = useState({});
  const [errorServidor, setErrorServidor] = useState("");
  const [cargando, setCargando] = useState(false);

  function seleccionarPerfil(nuevoPerfil) {
    setPerfil(nuevoPerfil);
    setFormulario({ email: nuevoPerfil.email, password: nuevoPerfil.password });
    setErrores({});
    setErrorServidor("");
  }

  function actualizar(campo, valor) {
    setFormulario({ ...formulario, [campo]: valor });
    setErrores({ ...errores, [campo]: "" });
    setErrorServidor("");
  }

  async function iniciarSesion(evento) {
    evento.preventDefault();
    const erroresFormulario = validarLogin(formulario);
    if (tieneErrores(erroresFormulario)) {
      setErrores(erroresFormulario);
      return;
    }
    setCargando(true);
    setErrorServidor("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formulario.email.trim().toLowerCase(),
          password: formulario.password,
        }),
      });
      const resultado = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(resultado.error || "El correo o la contraseña no coinciden");
      }
      onLogin(resultado);
    } catch (error) {
      setErrorServidor(error.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <form className="login-form" onSubmit={iniciarSesion} noValidate>
      <div className="role-options">
        {perfilesIniciales.map((opcion) => (
          <button
            type="button"
            className={perfil.rol === opcion.rol ? "role-option selected" : "role-option"}
            onClick={() => seleccionarPerfil(opcion)}
            key={opcion.rol}
          >
            <span className="role-icon">{opcion.rol[0]}</span>
            <span>{opcion.etiqueta}</span>
          </button>
        ))}
      </div>
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
          autoComplete="current-password"
          aria-invalid={Boolean(errores.password)}
        />
      </FormField>
      {errorServidor && <p className="login-error">{errorServidor}</p>}
      <button className="primary login-submit" disabled={cargando}>
        {cargando ? "Ingresando..." : "Entrar al sistema"}
      </button>
      <button type="button" className="auth-link" onClick={onRegister}>
        ¿No tienes cuenta? Regístrate
      </button>
    </form>
  );
}
