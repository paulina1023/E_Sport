import Metric from "./Metric.jsx";
import { formatearFecha, tiempoHasta } from "../utils/appHelpers.js";

export default function DashboardOverview({
  datosPanel,
  recursos,
  partidos,
  onShowPartidos,
  onShowTabla,
}) {
  const partidosConFixture = partidos.filter(
    (partido) => partido.fecha_hora && partido.cancha,
  );
  const porcentajeFixture = partidos.length
    ? Math.round((partidosConFixture.length / partidos.length) * 100)
    : 0;
  const proximoPartido = partidos
    .filter(
      (partido) =>
        partido.estado !== "Finalizado" && partido.estado !== "Suspendido",
    )
    .sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora))[0];

  return (
    <>
      <section className="metrics">
        <Metric
          label="Torneos activos"
          value={datosPanel.torneos}
          note="Datos en tiempo real"
          accent="orange"
        />
        <Metric
          label="Equipos inscritos"
          value={datosPanel.equipos}
          note="Registros activos"
          accent="blue"
        />
        <Metric
          label="Partidos jugados"
          value={datosPanel.partidos}
          note="Resultados registrados"
          accent="green"
        />
        <Metric
          label="Solicitudes"
          value={
            recursos.inscripciones.filter(
              (inscripcion) => inscripcion.estado === "Pendiente",
            ).length
          }
          note="Solicitudes pendientes"
          accent="pink"
        />
      </section>
      <div className="content-grid">
        <section className="panel matches">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">AGENDA</span>
              <h3>Próximos partidos</h3>
            </div>
            <button className="text-button" onClick={onShowPartidos}>
              Ver fixture →
            </button>
          </div>
          {partidos.slice(0, 4).map((partido) => (
            <div className="match" key={partido.id_partido}>
              <div className="match-date">
                <strong>{new Date(partido.fecha_hora).getDate()}</strong>
                <span>
                  {new Intl.DateTimeFormat("es-CO", { month: "short" })
                    .format(new Date(partido.fecha_hora))
                    .toUpperCase()}
                </span>
              </div>
              <div className="match-info">
                <strong>
                  {partido.Torneo?.nombre || "Torneo sin nombre"}
                </strong>
                <span>
                  {formatearFecha(partido.fecha_hora)} · {partido.cancha}
                </span>
              </div>
              <span className="tag">{partido.estado}</span>
              <span className="arrow">›</span>
            </div>
          ))}
        </section>
        <section className="panel standings">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">CLASIFICACIÓN</span>
              <h3>Tabla de posiciones</h3>
            </div>
            <button className="dots" aria-label="Más opciones">
              •••
            </button>
          </div>
          <div className="table-head">
            <span>Equipo</span>
            <span>PJ</span>
            <span>PTS</span>
            <span>DG</span>
          </div>
          {recursos.tabla.map((equipo, index) => (
            <div className="standing-row" key={equipo.id_equipo}>
              <span className="rank">
                {String(index + 1).padStart(2, "0")}
              </span>
              <strong>{equipo.nombre_equipo}</strong>
              <span>{equipo.partidos_jugados}</span>
              <b>{equipo.puntos}</b>
              <span className="goal">
                {equipo.diferencia_goles > 0
                  ? `+${equipo.diferencia_goles}`
                  : equipo.diferencia_goles}
              </span>
            </div>
          ))}
          {!recursos.tabla.length && (
            <p className="empty">Sin resultados finalizados.</p>
          )}
          <button className="full-button" onClick={onShowTabla}>
            Ver tabla completa
          </button>
        </section>
      </div>
      <section className="lower-strip">
        <div>
          <span className="eyebrow">ESTADO DEL SISTEMA</span>
          <h3>Todo listo para la jornada 06</h3>
        </div>
        <div className="progress-wrap">
          <div className="progress-label">
            <span>Fixture publicado</span>
            <strong>{porcentajeFixture}%</strong>
          </div>
          <div className="progress">
            <span style={{ width: `${porcentajeFixture}%` }}/>
          </div>
        </div>
        <div className="next-event">
          <span>PRÓXIMO PARTIDO</span>
          {proximoPartido ? (
            <strong>
              {proximoPartido.Torneo?.nombre || "Partido programado"}
              <small>
                {tiempoHasta(proximoPartido.fecha_hora)} ·{" "}
                {formatearFecha(proximoPartido.fecha_hora)}
              </small>
            </strong>
          ) : (
            <strong>Sin partidos programados</strong>
          )}
        </div>
      </section>
    </>
  );
}