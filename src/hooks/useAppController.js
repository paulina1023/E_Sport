import { useEffect, useState } from "react";
import { solicitarApi } from "../utils/appHelpers.js";

const datosIniciales = {
  torneos: 0,
  equipos: 0,
  partidos: 0,
  proximos: [],
};

async function cargarRecursosApi(sesion) {
  const [dashboard, torneos, equipos, partidos] = await Promise.all([
    solicitarApi("/api/dashboard", sesion.token),
    solicitarApi("/api/torneos"),
    solicitarApi("/api/equipos"),
    solicitarApi("/api/partidos"),
  ]);
  const tablas = await Promise.all(
    torneos.map(async (torneo) => ({
      id_torneo: torneo.id_torneo,
      nombre: torneo.nombre,
      tabla: await solicitarApi(
        `/api/torneos/${torneo.id_torneo}/tabla-posiciones`,
      ),
    })),
  );
  const tabla = tablas.find(({ tabla: datos }) => datos.length)?.tabla || [];
  const inscripciones =
    sesion.user.rol === "Espectador"
      ? []
      : await solicitarApi("/api/inscripciones", sesion.token);
  return {
    dashboard,
    recursos: { torneos, equipos, partidos, tabla, tablas, inscripciones },
  };
}

function validarTextoRequerido(valor, etiqueta) {
  return typeof valor === "string" && valor.trim()
    ? ""
    : `${etiqueta} es obligatorio`;
}

function validarFormularioOperativo(tipo, formulario) {
  const reglas =
    tipo === "torneo"
      ? [
          validarTextoRequerido(formulario.nombre, "El nombre"),
          validarTextoRequerido(formulario.categoria, "La categoría"),
          validarTextoRequerido(formulario.fecha_inicio, "La fecha de inicio"),
          validarTextoRequerido(formulario.fecha_fin, "La fecha de cierre"),
        ]
      : tipo === "equipo"
        ? [
            validarTextoRequerido(formulario.nombre, "El nombre del equipo"),
            validarTextoRequerido(formulario.id_torneo, "El torneo"),
          ]
        : [
            validarTextoRequerido(formulario.id_torneo, "El torneo"),
            validarTextoRequerido(formulario.id_equipo_local, "El equipo local"),
            validarTextoRequerido(formulario.id_equipo_visita, "El equipo visitante"),
            validarTextoRequerido(formulario.fecha_hora, "La fecha y hora"),
            validarTextoRequerido(formulario.cancha, "La cancha"),
          ];
  return reglas.find(Boolean) || "";
}

export default function useAppController(sesion) {
  const [datosPanel, setDatosPanel] = useState(datosIniciales);
  const [recursos, setRecursos] = useState({ torneos: [], equipos: [], partidos: [], tabla: [], inscripciones: [], tablas: [] });
  const [cargandoRecursos, setCargandoRecursos] = useState(true);
  const [errorRecursos, setErrorRecursos] = useState("");
  const [vista, setVista] = useState("Resumen");
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarEquipo, setMostrarEquipo] = useState(false);
  const [mostrarPartido, setMostrarPartido] = useState(false);
  const [partidoResultado, setPartidoResultado] = useState(null);
  const [aviso, setAviso] = useState("");
  const [eliminacionPendiente, setEliminacionPendiente] = useState(null);
  const [formularioEquipo, setFormularioEquipo] = useState({ nombre: "", escudo_url: "", id_torneo: "" });
  const [formularioPartido, setFormularioPartido] = useState({ id_torneo: "", id_equipo_local: "", id_equipo_visita: "", jornada_numero: 1, fecha_hora: "", cancha: "" });
  const [formularioResultado, setFormularioResultado] = useState({ goles_local: 0, goles_visita: 0 });
  const [formulario, setFormulario] = useState({ nombre: "", categoria: "Mayores", modalidad: "Liga", fecha_inicio: "", fecha_fin: "" });

  async function actualizarRecursos() {
    try {
      const actualizados = await cargarRecursosApi(sesion);
      setDatosPanel(actualizados.dashboard);
      setRecursos(actualizados.recursos);
      setErrorRecursos("");
      return true;
    } catch (error) {
      setErrorRecursos(error.message);
      setDatosPanel(datosIniciales);
      return false;
    } finally {
      setCargandoRecursos(false);
    }
  }

  useEffect(() => {
    if (!sesion) return undefined;
    let activo = true;
    const actualizar = () => cargarRecursosApi(sesion).then((actualizados) => {
      if (!activo) return;
      setDatosPanel(actualizados.dashboard);
      setRecursos(actualizados.recursos);
      setErrorRecursos("");
    }).catch((error) => {
      if (!activo) return;
      setErrorRecursos(error.message);
      setDatosPanel(datosIniciales);
    }).finally(() => {
      if (activo) setCargandoRecursos(false);
    });
    actualizar();
    const intervalo = window.setInterval(actualizar, 15000);
    return () => { activo = false; window.clearInterval(intervalo); };
  }, [sesion]);

  async function ejecutarOperacion(operacion) {
    try {
      await operacion();
      const actualizados = await cargarRecursosApi(sesion);
      setDatosPanel(actualizados.dashboard);
      setRecursos(actualizados.recursos);
      return true;
    } catch (error) {
      setAviso(error.message);
      return false;
    }
  }

  async function crearTorneo(evento) {
    evento.preventDefault();
    const error = validarFormularioOperativo("torneo", formulario);
    if (error) return setAviso(error);
    try {
      const response = await fetch("/api/torneos", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${sesion.token}` }, body: JSON.stringify(formulario) });
      if (!response.ok) throw new Error();
      setAviso("Torneo creado correctamente");
      setMostrarFormulario(false);
      if (!(await actualizarRecursos())) throw new Error();
    } catch { setAviso("Inicia sesión como administrador para crear torneos"); }
  }

  async function crearEquipo(evento) {
    evento.preventDefault();
    const error = validarFormularioOperativo("equipo", formularioEquipo);
    if (error) return setAviso(error);
    if (!(await ejecutarOperacion(() => solicitarApi("/api/equipos", sesion.token, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formularioEquipo) })))) return;
    setAviso("Equipo creado y registrado en el torneo correctamente");
    setMostrarEquipo(false);
  }

  async function crearPartido(evento) {
    evento.preventDefault();
    const error = validarFormularioOperativo("partido", formularioPartido);
    if (error) return setAviso(error);
    if (!(await ejecutarOperacion(() => solicitarApi("/api/partidos", sesion.token, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...formularioPartido, jornada_numero: Number(formularioPartido.jornada_numero) }) })))) return;
    setAviso("Partido programado correctamente");
    setMostrarPartido(false);
  }

  async function registrarResultado(evento) {
    evento.preventDefault();
    if (Number(formularioResultado.goles_local) < 0 || Number(formularioResultado.goles_visita) < 0) return setAviso("Los goles no pueden ser negativos");
    if (!(await ejecutarOperacion(() => solicitarApi(`/api/partidos/${partidoResultado.id_partido}/resultado`, sesion.token, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ goles_local: Number(formularioResultado.goles_local), goles_visita: Number(formularioResultado.goles_visita) }) })))) return;
    setAviso("Resultado registrado correctamente");
    setPartidoResultado(null);
  }

  async function eliminarRegistro(evento) {
    evento.preventDefault();
    if (!(await ejecutarOperacion(() => solicitarApi(`/api/${eliminacionPendiente.tipo === "Torneo" ? "torneos" : "equipos"}/${eliminacionPendiente.id}`, sesion.token, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ motivo: "Sancionado" }) })))) return;
    setAviso(`${eliminacionPendiente.tipo} eliminado correctamente`);
    setEliminacionPendiente(null);
  }

  async function cambiarEstadoEnLugarDeEliminar() {
    const esTorneo = eliminacionPendiente.tipo === "Torneo";
    if (!(await ejecutarOperacion(() => solicitarApi(`/api/${esTorneo ? "torneos" : "equipos"}/${eliminacionPendiente.id}/${esTorneo ? "finalizar" : "descalificar"}`, sesion.token, { method: "PATCH" })))) return;
    setAviso(esTorneo ? "Torneo marcado como finalizado" : "Equipo marcado como descalificado");
    setEliminacionPendiente(null);
  }

  return { datosPanel, recursos, cargandoRecursos, errorRecursos, vista, setVista, busqueda, setBusqueda, mostrarFormulario, setMostrarFormulario, mostrarEquipo, setMostrarEquipo, mostrarPartido, setMostrarPartido, partidoResultado, setPartidoResultado, aviso, setAviso, eliminacionPendiente, setEliminacionPendiente, formularioEquipo, setFormularioEquipo, formularioPartido, setFormularioPartido, formularioResultado, setFormularioResultado, formulario, setFormulario, crearTorneo, crearEquipo, crearPartido, registrarResultado, eliminarRegistro, cambiarEstadoEnLugarDeEliminar };
}
