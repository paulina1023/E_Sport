import { useEffect, useState } from "react";
import BracketBoard from "./BracketBoard.jsx";
import { formatearFecha, solicitarApi } from "../utils/appHelpers.js";

export default function SpectatorPage({ sesion, datosPanel, recursos, cargando, onLogout }) {
  const [torneoActivo, setTorneoActivo] = useState("");
  const [tablaTorneo, setTablaTorneo] = useState([]);
  const [cargandoTabla, setCargandoTabla] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState("resumen");
  const iniciales = sesion.user.nombre
    .split(" ")
    .map((nombre) => nombre[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const torneos = recursos.torneos;
  const torneoSeleccionado =
    torneos.find(
      (torneo) => String(torneo.id_torneo) === String(torneoActivo),
    ) || torneos[0];
  const idTorneoSeleccionado = torneoSeleccionado?.id_torneo;

  useEffect(() => {
    if (!idTorneoSeleccionado) return undefined;
    let activo = true;
    solicitarApi(
      `/api/torneos/${idTorneoSeleccionado}/tabla-posiciones`,
      sesion.token,
    )
      .then((tablaActualizada) => {
        if (activo) setTablaTorneo(tablaActualizada);
      })
      .catch(() => {
        if (activo) setTablaTorneo([]);
      })
      .finally(() => {
        if (activo) setCargandoTabla(false);
      });
    return () => {
      activo = false;
    };
  }, [idTorneoSeleccionado, sesion.token]);

  const partidosDelTorneo = recursos.partidos.filter(
    (partido) =>
      String(partido.id_torneo) === String(idTorneoSeleccionado),
  );
  const partidos = partidosDelTorneo.length
    ? partidosDelTorneo
    : (datosPanel.proximos || []).filter(
        (partido) =>
          String(partido.id_torneo) === String(idTorneoSeleccionado),
      );
  const equiposEnPartidos = new Set(
    partidos.flatMap((partido) => [
      partido.id_equipo_local,
      partido.id_equipo_visita,
    ]),
  ).size;
  const partidosPorJornada = Object.entries(
    partidos.reduce((jornadas, partido) => {
      const jornada = partido.jornada_numero || 1;
      jornadas[jornada] = [...(jornadas[jornada] || []), partido];
      return jornadas;
    }, {}),
  ).sort(([a], [b]) => Number(a) - Number(b));
  const equiposDelTorneo = new Map(
    tablaTorneo.map((equipo) => [equipo.id_equipo, equipo.nombre_equipo]),
  );
  const nombreEquipo = (idEquipo) =>
    equiposDelTorneo.get(idEquipo) || `Equipo #${idEquipo}`;
  const cambiarTorneo = (evento) => {
    setTorneoActivo(evento.target.value);
    setTablaTorneo([]);
    setCargandoTabla(true);
    setSeccionActiva("resumen");
  };

  return (
    <div className="spectator-shell">
      <header className="spectator-header">
        <div className="spectator-brand">
          <span className="brand-mark">E</span>
          <strong>E-SPORT</strong>
        </div>
        <div className="spectator-user">
          <div className="avatar small">{iniciales}</div>
          <span>{sesion.user.nombre}</span>
          <button className="logout" onClick={onLogout}>Salir</button>
        </div>
      </header>
      <main className="spectator-content">
        <div className="spectator-toolbar">
          <div>
            <span className="eyebrow">TORNEOS PÚBLICOS</span>
            <h1>Consulta la competencia</h1>
          </div>
          {torneos.length > 0 && (
            <select value={torneoSeleccionado.id_torneo} onChange={cambiarTorneo}>
              {torneos.map((torneo) => (
                <option value={torneo.id_torneo} key={torneo.id_torneo}>
                  {torneo.nombre}
                </option>
              ))}
            </select>
          )}
        </div>
        {cargando && (
          <section className="spectator-empty">
            <strong>Cargando torneos...</strong>
            <span>Estamos consultando la información publicada.</span>
          </section>
        )}
        {!cargando && !torneos.length && (
          <section className="spectator-empty">
            <strong>No hay torneos publicados</strong>
            <span>El administrador todavía no ha creado ningún torneo.</span>
          </section>
        )}
        {!cargando && torneoSeleccionado && (
          <>
            <section className="tournament-hero">
              <div>
                <span className="tournament-status">
                  ● {torneoSeleccionado.estado?.toUpperCase() || "EN CURSO"}
                </span>
                <h2>{torneoSeleccionado.nombre}</h2>
                <p>{torneoSeleccionado.categoria || "Competencia de fútbol E-SPORT"} · Temporada 2026</p>
              </div>
              <div className="tournament-meta"><strong>{equiposEnPartidos}</strong><span>equipos inscritos</span></div>
              <div className="tournament-meta"><strong>{partidos.length}</strong><span>partidos registrados</span></div>
            </section>
            <nav className="spectator-tabs" aria-label="Secciones del torneo">
              {["resumen", "bracket", "partidos", "posiciones"].map((seccion) => (
                <button className={seccionActiva === seccion ? "active" : ""} key={seccion} onClick={() => setSeccionActiva(seccion)}>
                  {seccion[0].toUpperCase() + seccion.slice(1)}
                </button>
              ))}
            </nav>
            {seccionActiva === "resumen" && (
              <div className="spectator-grid" id="resumen">
                <section className="spectator-panel bracket-panel">
                  <div className="spectator-panel-heading"><div><span className="eyebrow">FASE FINAL</span><h3>Bracket del torneo</h3></div><span className="round-label">Jornada 06</span></div>
                  <BracketBoard jornadas={partidosPorJornada} nombreEquipo={nombreEquipo} modalidad={torneoSeleccionado.modalidad} />
                </section>
                <section className="spectator-panel">
                  <div className="spectator-panel-heading"><div><span className="eyebrow">AGENDA</span><h3>Próximos partidos</h3></div><span className="live-dot">EN VIVO</span></div>
                  <MatchList partidos={partidos} torneo={torneoSeleccionado} cargando={cargando || cargandoTabla} nombreEquipo={nombreEquipo} />
                </section>
              </div>
            )}
            {seccionActiva === "bracket" && (
              <section className="spectator-panel" id="bracket">
                <div className="spectator-panel-heading"><div><span className="eyebrow">FASE DEL TORNEO</span><h3>Bracket actualizado</h3></div><span className="round-label">{partidos.length} partidos</span></div>
                <BracketBoard jornadas={partidosPorJornada} nombreEquipo={nombreEquipo} modalidad={torneoSeleccionado.modalidad} />
              </section>
            )}
            {seccionActiva === "partidos" && (
              <section className="spectator-panel" id="partidos">
                <div className="spectator-panel-heading"><div><span className="eyebrow">AGENDA COMPLETA</span><h3>Partidos del torneo</h3></div></div>
                  <MatchList partidos={partidos} torneo={torneoSeleccionado} nombreEquipo={nombreEquipo} mostrarEquipos />
              </section>
            )}
            {seccionActiva === "posiciones" && <Standings tabla={tablaTorneo} cargando={cargandoTabla} />}
          </>
        )}
      </main>
    </div>
  );
}

function MatchList({ partidos, torneo, cargando, nombreEquipo, mostrarEquipos = false }) {
  return (
    <div className="spectator-matches">
      {cargando ? <p className="empty">Cargando partidos...</p> : partidos.map((partido) => (
        <div className="spectator-match" key={partido.id_partido}>
          <div>
            <strong>{mostrarEquipos ? `${nombreEquipo(partido.id_equipo_local)} vs ${nombreEquipo(partido.id_equipo_visita)}` : partido.Torneo?.nombre || torneo.nombre}</strong>
            <span>{formatearFecha(partido.fecha_hora)} · {partido.cancha}</span>
          </div>
          <span className="match-tag">{partido.estado}</span>
        </div>
      ))}
      {!cargando && !partidos.length && <p className="empty">No hay partidos programados.</p>}
    </div>
  );
}

function Standings({ tabla, cargando }) {
  return (
    <section className="spectator-panel standings-panel" id="posiciones">
      <div className="spectator-panel-heading"><div><span className="eyebrow">CLASIFICACIÓN</span><h3>Tabla de posiciones</h3></div><span className="round-label">Actualizada hoy</span></div>
      <div className="spectator-table spectator-table-head"><span>#</span><span>Equipo</span><span>PJ</span><span>G-E-P</span><span>PTS</span><span>DG</span></div>
      {cargando ? <p className="empty">Cargando posiciones...</p> : tabla.map((equipo, index) => (
        <div className="spectator-table" key={equipo.id_equipo}>
          <span className="table-rank">{String(index + 1).padStart(2, "0")}</span>
          <strong>{equipo.nombre_equipo}</strong>
          <span>{equipo.partidos_jugados}</span>
          <span>{equipo.ganados}-{equipo.empatados}-{equipo.perdidos}</span>
          <b>{equipo.puntos}</b>
          <span className="goal">{equipo.diferencia_goles > 0 ? `+${equipo.diferencia_goles}` : equipo.diferencia_goles}</span>
        </div>
      ))}
      {!cargando && !tabla.length && <p className="empty">Aún no hay resultados finalizados.</p>}
    </section>
  );
}
