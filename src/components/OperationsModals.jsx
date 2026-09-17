export default function OperationsModals({
  mostrarFormulario,
  setMostrarFormulario,
  formulario,
  setFormulario,
  crearTorneo,
  mostrarEquipo,
  setMostrarEquipo,
  formularioEquipo,
  setFormularioEquipo,
  crearEquipo,
  torneos,
  equipos,
  mostrarPartido,
  setMostrarPartido,
  formularioPartido,
  setFormularioPartido,
  crearPartido,
  partidoResultado,
  setPartidoResultado,
  formularioResultado,
  setFormularioResultado,
  registrarResultado,
  eliminacionPendiente,
  setEliminacionPendiente,
  eliminarRegistro,
  cambiarEstadoEnLugarDeEliminar,
}) {
  return (
    <>
      {mostrarFormulario && (
        <div className="modal-backdrop" onClick={() => setMostrarFormulario(false)}>
          <form className="modal" onSubmit={crearTorneo} onClick={(evento) => evento.stopPropagation()}>
            <div className="panel-heading">
              <div>
                <span className="eyebrow orange">ADMINISTRACIÓN</span>
                <h3>Crear torneo</h3>
              </div>
              <button type="button" className="close" onClick={() => setMostrarFormulario(false)}>×</button>
            </div>
            {[
              ["nombre", "Nombre del torneo", "text"],
              ["categoria", "Categoría", "text"],
              ["fecha_inicio", "Fecha de inicio", "date"],
              ["fecha_fin", "Fecha de cierre", "date"],
            ].map(([nombreCampo, etiqueta, tipo]) => (
              <label key={nombreCampo}>
                {etiqueta}
                <input
                  required
                  type={tipo}
                  value={formulario[nombreCampo]}
                  onChange={(evento) => setFormulario({ ...formulario, [nombreCampo]: evento.target.value })}
                />
              </label>
            ))}
            <label>
              Modalidad
              <select value={formulario.modalidad} onChange={(evento) => setFormulario({ ...formulario, modalidad: evento.target.value })}>
                <option>Liga</option>
                <option>Fase de Grupos</option>
                <option>Eliminacion Directa</option>
              </select>
            </label>
            <button className="primary" type="submit">Guardar torneo</button>
          </form>
        </div>
      )}
      {mostrarEquipo && (
        <div className="modal-backdrop" onClick={() => setMostrarEquipo(false)}>
          <form className="modal" onSubmit={crearEquipo} onClick={(evento) => evento.stopPropagation()}>
            <div className="panel-heading">
              <div>
                <span className="eyebrow orange">PARTICIPANTES</span>
                <h3>Registrar equipo</h3>
              </div>
              <button type="button" className="close" onClick={() => setMostrarEquipo(false)}>×</button>
            </div>
            <label>
              Torneo
              <select required value={formularioEquipo.id_torneo} onChange={(evento) => setFormularioEquipo({ ...formularioEquipo, id_torneo: evento.target.value })}>
                <option value="">Selecciona un torneo</option>
                {torneos.map((torneo) => (
                  <option value={torneo.id_torneo} key={torneo.id_torneo}>{torneo.nombre}</option>
                ))}
              </select>
            </label>
            <label>
              Nombre del equipo
              <input required value={formularioEquipo.nombre} onChange={(evento) => setFormularioEquipo({ ...formularioEquipo, nombre: evento.target.value })} />
            </label>
            <label>
              URL del escudo
              <input value={formularioEquipo.escudo_url} onChange={(evento) => setFormularioEquipo({ ...formularioEquipo, escudo_url: evento.target.value })} />
            </label>
            <button className="primary" type="submit">Guardar equipo</button>
          </form>
        </div>
      )}
      {mostrarPartido && (
        <div className="modal-backdrop" onClick={() => setMostrarPartido(false)}>
          <form className="modal" onSubmit={crearPartido} onClick={(evento) => evento.stopPropagation()}>
            <div className="panel-heading">
              <div>
                <span className="eyebrow orange">CALENDARIO</span>
                <h3>Programar partido</h3>
              </div>
              <button type="button" className="close" onClick={() => setMostrarPartido(false)}>×</button>
            </div>
            <label>
              Torneo
              <select required value={formularioPartido.id_torneo} onChange={(evento) => setFormularioPartido({ ...formularioPartido, id_torneo: evento.target.value })}>
                <option value="">Selecciona un torneo</option>
                {torneos.map((torneo) => (
                  <option value={torneo.id_torneo} key={torneo.id_torneo}>{torneo.nombre}</option>
                ))}
              </select>
            </label>
            <label>
              Equipo local
              <select required value={formularioPartido.id_equipo_local} onChange={(evento) => setFormularioPartido({ ...formularioPartido, id_equipo_local: evento.target.value })}>
                <option value="">Selecciona un equipo</option>
                {equipos.map((equipo) => (
                  <option value={equipo.id_equipo} key={equipo.id_equipo}>{equipo.nombre}</option>
                ))}
              </select>
            </label>
            <label>
              Equipo visitante
              <select required value={formularioPartido.id_equipo_visita} onChange={(evento) => setFormularioPartido({ ...formularioPartido, id_equipo_visita: evento.target.value })}>
                <option value="">Selecciona un equipo</option>
                {equipos.map((equipo) => (
                  <option value={equipo.id_equipo} key={equipo.id_equipo}>{equipo.nombre}</option>
                ))}
              </select>
            </label>
            <label>
              Fecha y hora
              <input required type="datetime-local" value={formularioPartido.fecha_hora} onChange={(evento) => setFormularioPartido({ ...formularioPartido, fecha_hora: evento.target.value })} />
            </label>
            <label>
              Cancha
              <input required value={formularioPartido.cancha} onChange={(evento) => setFormularioPartido({ ...formularioPartido, cancha: evento.target.value })} />
            </label>
            <button className="primary" type="submit">Programar partido</button>
          </form>
        </div>
      )}
      {partidoResultado && (
        <div className="modal-backdrop" onClick={() => setPartidoResultado(null)}>
          <form className="modal" onSubmit={registrarResultado} onClick={(evento) => evento.stopPropagation()}>
            <div className="panel-heading">
              <div>
                <span className="eyebrow orange">PARTIDO</span>
                <h3>Registrar resultado</h3>
              </div>
              <button type="button" className="close" onClick={() => setPartidoResultado(null)}>×</button>
            </div>
            <p className="modal-context">{partidoResultado.Torneo?.nombre || "Partido programado"}</p>
            <label>
              Goles equipo local
              <input required min="0" type="number" value={formularioResultado.goles_local} onChange={(evento) => setFormularioResultado({ ...formularioResultado, goles_local: evento.target.value })} />
            </label>
            <label>
              Goles equipo visitante
              <input required min="0" type="number" value={formularioResultado.goles_visita} onChange={(evento) => setFormularioResultado({ ...formularioResultado, goles_visita: evento.target.value })} />
            </label>
            <button className="primary" type="submit">Guardar resultado</button>
          </form>
        </div>
      )}
      {eliminacionPendiente && (
        <div className="modal-backdrop" onClick={() => setEliminacionPendiente(null)}>
          <form className="modal" onSubmit={eliminarRegistro} onClick={(evento) => evento.stopPropagation()}>
            <div className="panel-heading">
              <div>
                <span className="eyebrow orange">CONFIRMAR ACCIÓN</span>
                <h3>{eliminacionPendiente.tipo === "Equipo" ? "Descalificar equipo" : "Terminar torneo"}</h3>
              </div>
              <button type="button" className="close" onClick={() => setEliminacionPendiente(null)}>×</button>
            </div>
            <p className="modal-context">
              {eliminacionPendiente.tipo === "Equipo" ? "¿Desea descalificar este equipo?" : "¿Desea eliminar este torneo?"}
              <br />
              {eliminacionPendiente.nombre || "Registro seleccionado"}
            </p>
            {eliminacionPendiente.tipo === "Equipo" ? (
              <button className="primary danger-action" type="button" onClick={cambiarEstadoEnLugarDeEliminar}>Descalificar</button>
            ) : (
              <div className="modal-actions">
                <button className="primary danger-action" type="submit">Sí, terminar</button>
                <button className="secondary" type="button" onClick={cambiarEstadoEnLugarDeEliminar}>No, terminar</button>
              </div>
            )}
          </form>
        </div>
      )}
    </>
  );
}
