import { useState } from "react";
import { formatearFecha, puedeRegistrarResultado } from "../utils/appHelpers.js";

export default function SectionPage({
  vista,
  recursos,
  cargando,
  puedeAdministrar,
  idUsuario,
  busqueda,
  onBusqueda,
  onResultado,
  onEliminar,
  onIrTorneo,
}) {
  const tablas = recursos.tablas || [];
  const primeraTablaDisponible = tablas.find(({ tabla }) => tabla.length);
  const [torneoTabla, setTorneoTabla] = useState(primeraTablaDisponible?.id_torneo || "");
  const tablaSeleccionada = tablas.find(({ id_torneo }) => String(id_torneo) === String(torneoTabla)) || primeraTablaDisponible;
  const [torneoPartidos, setTorneoPartidos] = useState("todos");
  const filasTorneos = recursos.torneos.map((torneo) => [torneo.nombre, torneo.modalidad, torneo.estado, torneo]);
  const filasEquipos = recursos.equipos.map((equipo) => [
    equipo.nombre,
    `${equipo.Jugadors?.length || equipo.Jugadores?.length || 0} jugadores`,
    (equipo.Torneos?.find((torneo) => torneo.InscripcionTorneo?.estado === "Aprobado") || equipo.Torneos?.[0])?.nombre || "Sin torneo asignado",
    equipo,
    equipo.Torneos?.find((torneo) => torneo.InscripcionTorneo?.estado === "Aprobado") || equipo.Torneos?.[0],
  ]);
  const filasPartidos = recursos.partidos
    .filter((partido) => torneoPartidos === "todos" || String(partido.id_torneo) === String(torneoPartidos))
    .map((partido) => [partido.Torneo?.nombre || "Torneo sin nombre", formatearFecha(partido.fecha_hora), partido.estado, partido]);
  const filasTabla = (tablaSeleccionada?.tabla || []).map((equipo) => [
    equipo.nombre_equipo || `Equipo #${equipo.id_equipo}`,
    `${equipo.partidos_jugados} partidos`,
    `${equipo.puntos} puntos`,
  ]);
  const contenido = {
    Torneos: { label: "GESTIÓN DE COMPETENCIAS", title: "Torneos registrados", description: "Configura modalidades, fechas y estados de cada campeonato.", filas: filasTorneos },
    Equipos: { label: "PARTICIPANTES", title: "Equipos inscritos", description: "Administra delegados y plantillas oficiales.", filas: filasEquipos },
    Partidos: { label: "CALENDARIO", title: "Fixture de partidos", description: "Consulta jornadas, canchas y estados en tiempo real.", filas: filasPartidos },
    "Tabla de posiciones": { label: "COMPETENCIA", title: "Tabla de posiciones", description: "Rendimiento acumulado de los equipos participantes.", filas: filasTabla },
  }[vista];
  const termino = busqueda.trim().toLowerCase();
  const filasFiltradas = contenido.filas.filter((fila) => fila.slice(0, 3).some((valor) => String(valor || "").toLowerCase().includes(termino)));

  return (
    <section className="page-section">
      <div className="page-intro"><span className="eyebrow orange">{contenido.label}</span><h2>{contenido.title}</h2><p>{contenido.description}</p></div>
      <div className="list-toolbar">
        <label className="search-field">Buscar<input type="search" value={busqueda} onChange={(evento) => onBusqueda(evento.target.value)} placeholder="Nombre, estado o modalidad" aria-label={`Buscar en ${vista}`} /></label>
        {vista === "Tabla de posiciones" && tablas.length > 0 && (
          <label className="search-field">Torneo<select value={tablaSeleccionada?.id_torneo || ""} onChange={(evento) => setTorneoTabla(evento.target.value)} aria-label="Seleccionar torneo para la tabla de posiciones">
            {tablas.map((torneo) => <option value={torneo.id_torneo} key={torneo.id_torneo}>{torneo.nombre}</option>)}
          </select></label>
        )}
        {vista === "Partidos" && recursos.torneos.length > 0 && (
          <label className="search-field">Torneo<select value={torneoPartidos} onChange={(evento) => setTorneoPartidos(evento.target.value)} aria-label="Filtrar partidos por torneo">
            <option value="todos">Todos los torneos</option>
            {recursos.torneos.map((torneo) => <option value={torneo.id_torneo} key={torneo.id_torneo}>{torneo.nombre}</option>)}
          </select></label>
        )}
      </div>
      <div className="data-list">
        {cargando ? <p className="empty">Cargando información...</p> : filasFiltradas.length ? filasFiltradas.map((fila) => (
          <div className={`data-row ${fila[0] === "Quantum XI" ? "danger" : ""}`} key={fila[3]?.id_partido || fila[0]}>
            <strong>{fila[0]}</strong><span>{fila[1]}</span><b>{fila[2]}</b>
            {vista === "Partidos" && puedeAdministrar && puedeRegistrarResultado(fila[3]) && <button className="row-action" onClick={() => onResultado(fila[3])}>{fila[3].estado === "Finalizado" ? "Editar resultado" : "Registrar resultado"}</button>}
            {vista === "Torneos" && puedeAdministrar && <button className="row-action danger-action" onClick={() => onEliminar("Torneo", fila[3])}>Terminar</button>}
            {vista === "Equipos" && (puedeAdministrar || fila[3]?.id_delegado === idUsuario) && <button className="row-action danger-action" onClick={() => onEliminar("Equipo", fila[3])}>Descalificar</button>}
            {vista === "Equipos" && fila[4] ? <button className="arrow row-link" title={`Ver torneo ${fila[4].nombre}`} aria-label={`Ver torneo ${fila[4].nombre}`} onClick={() => onIrTorneo(fila[4])}>›</button> : <span className="arrow">›</span>}
          </div>
        )) : <p className="empty">{termino ? "No hay resultados para tu búsqueda." : "No hay registros disponibles todavía."}</p>}
      </div>
    </section>
  );
}
