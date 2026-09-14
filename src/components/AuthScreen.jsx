import { useState } from "react";
import LoginForm from "./LoginForm.jsx";
import RegistroForm from "./RegistroForm.jsx";

export default function AuthScreen({ onLogin }) {
  const [mostrarRegistro, setMostrarRegistro] = useState(false);

  return (
    <main className="login-shell">
      <section className="login-aside">
        <div className="brand login-brand">
          <span className="brand-mark">E</span>
          <span>
            E-SPORT <small>CONTROL</small>
          </span>
        </div>
      </section>
      <section className="login-card">
        <div className="login-heading">
          <h2>{mostrarRegistro ? "Crea tu cuenta" : "Bienvenido de vuelta"}</h2>
          <p>
            {mostrarRegistro
              ? "Regístrate para participar en la competencia."
              : "Selecciona tu perfil para entrar al centro de operaciones."}
          </p>
        </div>
        {mostrarRegistro ? (
          <RegistroForm onBack={() => setMostrarRegistro(false)} />
        ) : (
          <LoginForm onLogin={onLogin} onRegister={() => setMostrarRegistro(true)} />
        )}
      </section>
    </main>
  );
}
