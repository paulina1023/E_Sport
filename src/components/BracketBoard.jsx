export default function BracketBoard({ jornadas, nombreEquipo, modalidad }) {
  if (!jornadas.length) {
    return <p className="empty">Todavía no hay cruces para mostrar.</p>;
  }

  return (
    <div className="bracket-board">
      {jornadas.map(([jornada, partidos]) => (
        <div className="bracket-round" key={jornada}>
          <span className="bracket-round-title">
            {modalidad === "Liga" ? `Jornada ${jornada}` : `Ronda ${jornada}`}
          </span>
          <div className="bracket-games">
            {partidos.map((partido) => {
              const finalizado = partido.estado === "Finalizado";
              const localGana = partido.goles_local > partido.goles_visita;
              const visitaGana = partido.goles_visita > partido.goles_local;
              return (
                <div className="bracket-game" key={partido.id_partido}>
                  <span className={finalizado && localGana ? "winner" : ""}>
                    {nombreEquipo(partido.id_equipo_local)}
                  </span>
                  <b>{finalizado ? partido.goles_local : "-"}</b>
                  <span className={finalizado && visitaGana ? "winner" : ""}>
                    {nombreEquipo(partido.id_equipo_visita)}
                  </span>
                  <b>{finalizado ? partido.goles_visita : "-"}</b>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
