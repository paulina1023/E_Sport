import { useState } from "react";
import "./index.css";
import AuthScreen from "./components/AuthScreen.jsx";
import AuthenticatedApp from "./components/AuthenticatedApp.jsx";
import SpectatorPage from "./components/SpectatorPage.jsx";
import useAppController from "./hooks/useAppController.js";
import { normalizarSesion } from "./utils/session.js";

function cargarSesionInicial() {
  try {
    return normalizarSesion(JSON.parse(localStorage.getItem("esports-sesion")));
  } catch {
    return null;
  }
}

function App() {
  const [sesion, setSesion] = useState(cargarSesionInicial);
  const controller = useAppController(sesion);
  const cerrarSesion = () => {
    localStorage.removeItem("esports-sesion");
    setSesion(null);
  };

  if (!sesion) {
    return <AuthScreen onLogin={(resultado) => {
      const sesionNormalizada = normalizarSesion(resultado);
      localStorage.setItem("esports-sesion", JSON.stringify(sesionNormalizada));
      setSesion(sesionNormalizada);
    }} />;
  }
  if (sesion.user.rol === "Espectador") {
    return <SpectatorPage sesion={sesion} datosPanel={controller.datosPanel} recursos={controller.recursos} cargando={controller.cargandoRecursos} onLogout={cerrarSesion} />;
  }
  return <AuthenticatedApp sesion={sesion} controller={controller} onLogout={cerrarSesion} />;
}

export default App;
