import { useEffect, useState } from "react";
import "./index.css";
import AuthScreen from "./components/AuthScreen.jsx";
import Navbar from "./components/Navbar.jsx";
import { normalizarSesion } from "./utils/session.js";

const datosIniciales = {
  torneos: 0,
  equipos: 0,
  partidos: 0,
  proximos: [],
};

function formatearFecha(valor) {
  return new Intl.DateTimeFormat("es-CO", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(valor));
}

function tiempoHasta(valor) {
  const diferencia = new Date(valor).getTime() - Date.now();
  const minutos = Math.round(diferencia / 60000);
  if (minutos < 0) return "En curso o finalizado";
  if (minutos < 60) return `en ${minutos} min`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `en ${horas} h`;
  const dias = Math.round(horas / 24);
  return `en ${dias} ${dias === 1 ? "día" : "días"}`;
}

async function solicitarApi(ruta, token, opciones = {}) {
  const respuesta = await fetch(ruta, {
    ...opciones,
    headers: {
      ...(opciones.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok)
    throw new Error(datos.error || "No fue posible completar la solicitud");
  return datos;
}

async function cargarRecursosApi(sesion) {
  const [dashboard, torneos, equipos, partidos] = await Promise.all([
    solicitarApi("/api/dashboard", sesion.token),
    solicitarApi("/api/torneos"),
    solicitarApi("/api/equipos"),
    solicitarApi("/api/partidos"),
  ]);
  const primerTorneo = torneos[0];
  const tabla = primerTorneo
    ? await solicitarApi(
        `/api/torneos/${primerTorneo.id_torneo}/tabla-posiciones`,
      )
    : [];
  const inscripciones =
    sesion.user.rol === "Espectador"
      ? []
      : await solicitarApi("/api/inscripciones", sesion.token);
  return {
    dashboard,
    recursos: { torneos, equipos, partidos, tabla, inscripciones },
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

function App() {
  const [sesion, setSesion] = useState(() => {
    try {
      return normalizarSesion(
        JSON.parse(localStorage.getItem("esports-sesion")),
      );
    } catch {
      return null;
    }
  });
  const [datosPanel, setDatosPanel] = useState(datosIniciales);
  const [recursos, setRecursos] = useState({
    torneos: [],
    equipos: [],
    partidos: [],
    tabla: [],
    inscripciones: [],
  });
  const [cargandoRecursos, setCargandoRecursos] = useState(true);
  const [errorRecursos, setErrorRecursos] = useState("");
  const [vista, setVista] = useState("Resumen");
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarEquipo, setMostrarEquipo] = useState(false);
  const [mostrarPartido, setMostrarPartido] = useState(false);
  const [partidoResultado, setPartidoResultado] = useState(null);
  const [aviso, setAviso] = useState("");
  const [formularioEquipo, setFormularioEquipo] = useState({
    nombre: "",
    escudo_url: "",
    id_torneo: "",
  });
  const [formularioPartido, setFormularioPartido] = useState({
    id_torneo: "",
    id_equipo_local: "",
    id_equipo_visita: "",
    jornada_numero: 1,
    fecha_hora: "",
    cancha: "",
  });
  const [formularioResultado, setFormularioResultado] = useState({
    goles_local: 0,
    goles_visita: 0,
  });
  const [formulario, setFormulario] = useState({
    nombre: "",
    categoria: "Mayores",
    modalidad: "Liga",
    fecha_inicio: "",
    fecha_fin: "",
  });

  useEffect(() => {
    if (!sesion) return;
    let activo = true;
    const actualizarRecursos = () =>
      cargarRecursosApi(sesion)
        .then(({ dashboard, recursos: recursosActuales }) => {
          if (!activo) return;
          setDatosPanel(dashboard);
          setRecursos(recursosActuales);
          setErrorRecursos("");
        })
        .catch((error) => {
          if (!activo) return;
          setErrorRecursos(error.message);
          setDatosPanel(datosIniciales);
        })
        .finally(() => {
          if (activo) setCargandoRecursos(false);
        });
    actualizarRecursos();
    const intervalo = window.setInterval(actualizarRecursos, 15000);
    return () => {
      activo = false;
      window.clearInterval(intervalo);
    };
  }, [sesion]);

  function cerrarSesion() {
    localStorage.removeItem("esports-sesion");
    setSesion(null);
  }

  async function crearTorneo(evento) {
    evento.preventDefault();
    const errorValidacion = validarFormularioOperativo("torneo", formulario);
    if (errorValidacion) {
      setAviso(errorValidacion);
      return;
    }
    try {
      const response = await fetch("/api/torneos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sesion.token}`,
        },
        body: JSON.stringify(formulario),
      });
      if (!response.ok) throw new Error();
      setAviso("Torneo creado correctamente");
      setMostrarFormulario(false);
      const actualizados = await cargarRecursosApi(sesion);
      setDatosPanel(actualizados.dashboard);
      setRecursos(actualizados.recursos);
    } catch {
      setAviso("Inicia sesión como administrador para crear torneos");
    }
  }

  async function crearEquipo(evento) {
    evento.preventDefault();
    const errorValidacion = validarFormularioOperativo("equipo", formularioEquipo);
    if (errorValidacion) {
      setAviso(errorValidacion);
      return;
    }
    try {
      await solicitarApi("/api/equipos", sesion.token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formularioEquipo),
      });
      setAviso("Equipo creado y registrado en el torneo correctamente");
      setMostrarEquipo(false);
      const actualizados = await cargarRecursosApi(sesion);
      setDatosPanel(actualizados.dashboard);
      setRecursos(actualizados.recursos);
    } catch (error) {
      setAviso(error.message);
    }
  }

  async function crearPartido(evento) {
    evento.preventDefault();
    const errorValidacion = validarFormularioOperativo("partido", formularioPartido);
    if (errorValidacion) {
      setAviso(errorValidacion);
      return;
    }
    try {
      await solicitarApi("/api/partidos", sesion.token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formularioPartido,
          jornada_numero: Number(formularioPartido.jornada_numero),
        }),
      });
      setAviso("Partido programado correctamente");
      setMostrarPartido(false);
      const actualizados = await cargarRecursosApi(sesion);
      setDatosPanel(actualizados.dashboard);
      setRecursos(actualizados.recursos);
    } catch (error) {
      setAviso(error.message);
    }
  }

  async function registrarResultado(evento) {
    evento.preventDefault();
    if (
      Number(formularioResultado.goles_local) < 0 ||
      Number(formularioResultado.goles_visita) < 0
    ) {
      setAviso("Los goles no pueden ser negativos");
      return;
    }
    try {
      await solicitarApi(
        `/api/partidos/${partidoResultado.id_partido}/resultado`,
        sesion.token,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            goles_local: Number(formularioResultado.goles_local),
            goles_visita: Number(formularioResultado.goles_visita),
          }),
        },
      );
      setAviso("Resultado registrado correctamente");
      setPartidoResultado(null);
      const actualizados = await cargarRecursosApi(sesion);
      setDatosPanel(actualizados.dashboard);
      setRecursos(actualizados.recursos);
    } catch (error) {
      setAviso(error.message);
    }
  }

  if (!sesion) {
    return (
      <AuthScreen
        onLogin={(resultado) => {
          const sesionNormalizada = normalizarSesion(resultado);
          localStorage.setItem(
            "esports-sesion",
            JSON.stringify(sesionNormalizada),
          );
          setSesion(sesionNormalizada);
        }}
      />
    );
  }

  if (sesion.user.rol === "Espectador") {
    return (
      <SpectatorPage
        sesion={sesion}
        datosPanel={datosPanel}
        recursos={recursos}
        cargando={cargandoRecursos}
        onLogout={cerrarSesion}
      />
    );
  }

  const puedeAdministrar = sesion.user.rol === "Administrador";
  const partidos = recursos.partidos;
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
  const iniciales = sesion.user.nombre
    .split(" ")
    .map((nombre) => nombre[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">E</span>
          <span>
            E-SPORT <small>CONTROL</small>
          </span>
        </div>
        <div className="profile">
          <div className="avatar">{iniciales}</div>
          <div>
            <strong>{sesion.user.nombre}</strong>
            <small>
              {sesion.user.rol === "Delegado"
                ? "Líder de equipo"
                : sesion.user.rol}
            </small>
          </div>
          <span className="online" />
        </div>
        <Navbar
          vista={vista}
          onChange={(nuevaVista) => {
            setVista(nuevaVista);
            setBusqueda("");
          }}
        />
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="eyebrow">MIÉRCOLES, 02 SEP 2026</span>
            <h1>{vista}</h1>
          </div>
          <div className="top-actions">
            <div className="user-chip">
              <div className="avatar small">{iniciales}</div>
              <span>{sesion.user.nombre}</span>
            </div>
            <button className="logout" onClick={cerrarSesion}>
              Cerrar sesión
            </button>
          </div>
        </header>
        {aviso && (
          <div className="notice">
            {aviso}
            <button onClick={() => setAviso("")}>×</button>
          </div>
        )}
        {errorRecursos && <div className="notice">{errorRecursos}</div>}
        <section className="welcome">
          <div>
            <span className="eyebrow orange">CENTRO DE OPERACIONES</span>
            <h2>El torneo sigue en juego.</h2>
            <p>
              Supervisa la competencia, gestiona inscripciones y mantén el
              fixture al día.
            </p>
          </div>
          <div className="welcome-actions">
            {puedeAdministrar && (
              <>
                <button
                  className="secondary"
                  onClick={() => setMostrarPartido(true)}
                >
                  + Programar partido
                </button>
                <button
                  className="primary"
                  onClick={() => setMostrarFormulario(true)}
                >
                  + Nuevo torneo
                </button>
              </>
            )}
            {sesion.user.rol === "Delegado" && (
              <button
                className="primary"
                onClick={() => setMostrarEquipo(true)}
              >
                + Nuevo equipo
              </button>
            )}
          </div>
        </section>
        {vista === "Resumen" ? (
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
                  <button
                    className="text-button"
                    onClick={() => setVista("Partidos")}
                  >
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
                <button
                  className="full-button"
                  onClick={() => setVista("Tabla de posiciones")}
                >
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
        ) : (
          <SectionPage
            vista={vista}
            recursos={recursos}
            cargando={cargandoRecursos}
            puedeAdministrar={puedeAdministrar}
            busqueda={busqueda}
            onBusqueda={setBusqueda}
            onResultado={(partido) => setPartidoResultado(partido)}
          />
        )}
      </main>
      {mostrarFormulario && (
        <div
          className="modal-backdrop"
          onClick={() => setMostrarFormulario(false)}
        >
          <form
            className="modal"
            onSubmit={crearTorneo}
            onClick={(evento) => evento.stopPropagation()}
          >
            <div className="panel-heading">
              <div>
                <span className="eyebrow orange">ADMINISTRACIÓN</span>
                <h3>Crear torneo</h3>
              </div>
              <button
                type="button"
                className="close"
                onClick={() => setMostrarFormulario(false)}
              >
                ×
              </button>
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
                  onChange={(evento) =>
                    setFormulario({
                      ...formulario,
                      [nombreCampo]: evento.target.value,
                    })
                  }
                />
              </label>
            ))}
            <label>
              Modalidad
              <select
                value={formulario.modalidad}
                onChange={(evento) =>
                  setFormulario({
                    ...formulario,
                    modalidad: evento.target.value,
                  })
                }
              >
                <option>Liga</option>
                <option>Fase de Grupos</option>
                <option>Eliminacion Directa</option>
              </select>
            </label>
            <button className="primary" type="submit">
              Guardar torneo
            </button>
          </form>
        </div>
      )}
      {mostrarEquipo && (
        <div className="modal-backdrop" onClick={() => setMostrarEquipo(false)}>
          <form
            className="modal"
            onSubmit={crearEquipo}
            onClick={(evento) => evento.stopPropagation()}
          >
            <div className="panel-heading">
              <div>
                <span className="eyebrow orange">PARTICIPANTES</span>
                <h3>Registrar equipo</h3>
              </div>
              <button
                type="button"
                className="close"
                onClick={() => setMostrarEquipo(false)}
              >
                ×
              </button>
            </div>
            <label>
              Torneo
              <select
                required
                value={formularioEquipo.id_torneo}
                onChange={(evento) =>
                  setFormularioEquipo({
                    ...formularioEquipo,
                    id_torneo: evento.target.value,
                  })
                }
              >
                <option value="">Selecciona un torneo</option>
                {recursos.torneos.map((torneo) => (
                  <option value={torneo.id_torneo} key={torneo.id_torneo}>
                    {torneo.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Nombre del equipo
              <input
                required
                value={formularioEquipo.nombre}
                onChange={(evento) =>
                  setFormularioEquipo({
                    ...formularioEquipo,
                    nombre: evento.target.value,
                  })
                }
              />
            </label>
            <label>
              URL del escudo
              <input
                value={formularioEquipo.escudo_url}
                onChange={(evento) =>
                  setFormularioEquipo({
                    ...formularioEquipo,
                    escudo_url: evento.target.value,
                  })
                }
              />
            </label>
            <button className="primary" type="submit">
              Guardar equipo
            </button>
          </form>
        </div>
      )}
      {mostrarPartido && (
        <div
          className="modal-backdrop"
          onClick={() => setMostrarPartido(false)}
        >
          <form
            className="modal"
            onSubmit={crearPartido}
            onClick={(evento) => evento.stopPropagation()}
          >
            <div className="panel-heading">
              <div>
                <span className="eyebrow orange">CALENDARIO</span>
                <h3>Programar partido</h3>
              </div>
              <button
                type="button"
                className="close"
                onClick={() => setMostrarPartido(false)}
              >
                ×
              </button>
            </div>
            <label>
              Torneo
              <select
                required
                value={formularioPartido.id_torneo}
                onChange={(evento) =>
                  setFormularioPartido({
                    ...formularioPartido,
                    id_torneo: evento.target.value,
                  })
                }
              >
                <option value="">Selecciona un torneo</option>
                {recursos.torneos.map((torneo) => (
                  <option value={torneo.id_torneo} key={torneo.id_torneo}>
                    {torneo.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Equipo local
              <select
                required
                value={formularioPartido.id_equipo_local}
                onChange={(evento) =>
                  setFormularioPartido({
                    ...formularioPartido,
                    id_equipo_local: evento.target.value,
                  })
                }
              >
                <option value="">Selecciona un equipo</option>
                {recursos.equipos.map((equipo) => (
                  <option value={equipo.id_equipo} key={equipo.id_equipo}>
                    {equipo.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Equipo visitante
              <select
                required
                value={formularioPartido.id_equipo_visita}
                onChange={(evento) =>
                  setFormularioPartido({
                    ...formularioPartido,
                    id_equipo_visita: evento.target.value,
                  })
                }
              >
                <option value="">Selecciona un equipo</option>
                {recursos.equipos.map((equipo) => (
                  <option value={equipo.id_equipo} key={equipo.id_equipo}>
                    {equipo.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Fecha y hora
              <input
                required
                type="datetime-local"
                value={formularioPartido.fecha_hora}
                onChange={(evento) =>
                  setFormularioPartido({
                    ...formularioPartido,
                    fecha_hora: evento.target.value,
                  })
                }
              />
            </label>
            <label>
              Cancha
              <input
                required
                value={formularioPartido.cancha}
                onChange={(evento) =>
                  setFormularioPartido({
                    ...formularioPartido,
                    cancha: evento.target.value,
                  })
                }
              />
            </label>
            <button className="primary" type="submit">
              Programar partido
            </button>
          </form>
        </div>
      )}
      {partidoResultado && (
        <div
          className="modal-backdrop"
          onClick={() => setPartidoResultado(null)}
        >
          <form
            className="modal"
            onSubmit={registrarResultado}
            onClick={(evento) => evento.stopPropagation()}
          >
            <div className="panel-heading">
              <div>
                <span className="eyebrow orange">PARTIDO</span>
                <h3>Registrar resultado</h3>
              </div>
              <button
                type="button"
                className="close"
                onClick={() => setPartidoResultado(null)}
              >
                ×
              </button>
            </div>
            <p className="modal-context">
              {partidoResultado.Torneo?.nombre || "Partido programado"}
            </p>
            <label>
              Goles equipo local
              <input
                required
                min="0"
                type="number"
                value={formularioResultado.goles_local}
                onChange={(evento) =>
                  setFormularioResultado({
                    ...formularioResultado,
                    goles_local: evento.target.value,
                  })
                }
              />
            </label>
            <label>
              Goles equipo visitante
              <input
                required
                min="0"
                type="number"
                value={formularioResultado.goles_visita}
                onChange={(evento) =>
                  setFormularioResultado({
                    ...formularioResultado,
                    goles_visita: evento.target.value,
                  })
                }
              />
            </label>
            <button className="primary" type="submit">
              Guardar resultado
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function SpectatorPage({ sesion, datosPanel, recursos, cargando, onLogout }) {
  const [torneoActivo, setTorneoActivo] = useState("");
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
  const partidos = recursos.partidos.length
    ? recursos.partidos
    : datosPanel.proximos || [];
  const tabla = recursos.tabla.length ? recursos.tabla : [];

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
          <button className="logout" onClick={onLogout}>
            Salir
          </button>
        </div>
      </header>
      <main className="spectator-content">
        <div className="spectator-toolbar">
          <div>
            <span className="eyebrow">TORNEOS PÚBLICOS</span>
            <h1>Consulta la competencia</h1>
          </div>
          {torneos.length > 0 && (
            <select
              value={torneoSeleccionado.id_torneo}
              onChange={(evento) => setTorneoActivo(evento.target.value)}
            >
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
                <span className="tournament-status">● EN CURSO</span>
                <h2>{torneoSeleccionado.nombre}</h2>
                <p>
                  {torneoSeleccionado.categoria ||
                    "Competencia de fútbol E-SPORT"}{" "}
                  · Temporada 2026
                </p>
              </div>
              <div className="tournament-meta">
                <strong>{datosPanel.equipos}</strong>
                <span>equipos inscritos</span>
              </div>
              <div className="tournament-meta">
                <strong>{datosPanel.partidos}</strong>
                <span>partidos jugados</span>
              </div>
            </section>
            <nav className="spectator-tabs" aria-label="Secciones del torneo">
              <a className="active" href="#resumen">
                Resumen
              </a>
              <a href="#bracket">Bracket</a>
              <a href="#partidos">Partidos</a>
              <a href="#posiciones">Posiciones</a>
            </nav>
            <div className="spectator-grid" id="resumen">
              <section className="spectator-panel bracket-panel" id="bracket">
                <div className="spectator-panel-heading">
                  <div>
                    <span className="eyebrow">FASE FINAL</span>
                    <h3>Bracket del torneo</h3>
                  </div>
                  <span className="round-label">Jornada 06</span>
                </div>
                <div className="bracket-board">
                  <BracketRound
                    title="Cuartos"
                    teams={[
                      ["Titanes FC", "2"],
                      ["Pixel Warriors", "1"],
                      ["Neon United", "3"],
                      ["Quantum XI", "2"],
                    ]}
                  />
                  <BracketRound
                    title="Semifinal"
                    teams={[
                      ["Titanes FC", ""],
                      ["Neon United", ""],
                    ]}
                  />
                  <BracketRound
                    title="Final"
                    teams={[
                      ["Por definir", ""],
                      ["Por definir", ""],
                    ]}
                    final
                  />
                </div>
              </section>
              <section className="spectator-panel" id="partidos">
                <div className="spectator-panel-heading">
                  <div>
                    <span className="eyebrow">AGENDA</span>
                    <h3>Próximos partidos</h3>
                  </div>
                  <span className="live-dot">EN VIVO</span>
                </div>
                <div className="spectator-matches">
                  {cargando ? (
                    <p className="empty">Cargando partidos...</p>
                  ) : (
                    partidos.map((partido) => (
                      <div className="spectator-match" key={partido.id_partido}>
                        <div>
                          <strong>
                            {partido.Torneo?.nombre ||
                              torneoSeleccionado.nombre}
                          </strong>
                          <span>
                            {formatearFecha(partido.fecha_hora)} ·{" "}
                            {partido.cancha}
                          </span>
                        </div>
                        <span className="match-tag">{partido.estado}</span>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
            <section
              className="spectator-panel standings-panel"
              id="posiciones"
            >
              <div className="spectator-panel-heading">
                <div>
                  <span className="eyebrow">CLASIFICACIÓN</span>
                  <h3>Tabla de posiciones</h3>
                </div>
                <span className="round-label">Actualizada hoy</span>
              </div>
              <div className="spectator-table spectator-table-head">
                <span>#</span>
                <span>Equipo</span>
                <span>PJ</span>
                <span>PTS</span>
                <span>DG</span>
              </div>
              {tabla.map((equipo, index) => (
                <div className="spectator-table" key={equipo.id_equipo}>
                  <span className="table-rank">
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
              {!cargando && !tabla.length && (
                <p className="empty">Aún no hay resultados finalizados.</p>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function BracketRound({ title, teams, final = false }) {
  return (
    <div className={`bracket-round ${final ? "final" : ""}`}>
      <span className="bracket-round-title">{title}</span>
      <div className="bracket-games">
        {teams.map(([team, score], index) => (
          <div className="bracket-game" key={`${team}-${index}`}>
            <span>{team}</span>
            <b>{score}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value, note, accent }) {
  return (
    <div className="metric">
      <span className={`metric-icon ${accent}`}>↗️</span>
      <span className="metric-label">{label}</span>
      <strong>{value}</strong>
      <small className={accent === "pink" ? "muted" : ""}>{note}</small>
    </div>
  );
}

function SectionPage({
  vista,
  recursos,
  cargando,
  puedeAdministrar,
  busqueda,
  onBusqueda,
  onResultado,
}) {
  const filasTorneos = recursos.torneos.map((torneo) => [
    torneo.nombre,
    torneo.modalidad,
    torneo.estado,
  ]);
  const filasEquipos = recursos.equipos.map((equipo) => [
    equipo.nombre,
    `${equipo.Jugadors?.length || equipo.Jugadores?.length || 0} jugadores`,
    "Registrado",
  ]);
  const filasPartidos = recursos.partidos.map((partido) => [
    partido.Torneo?.nombre || "Torneo sin nombre",
    formatearFecha(partido.fecha_hora),
    partido.estado,
    partido,
  ]);
  const filasTabla = recursos.tabla.map((equipo) => [
    equipo.nombre_equipo || `Equipo #${equipo.id_equipo}`,
    `${equipo.partidos_jugados} partidos`,
    `${equipo.puntos} puntos`,
  ]);
  const contenido = {
    Torneos: {
      label: "GESTIÓN DE COMPETENCIAS",
      title: "Torneos registrados",
      description:
        "Configura modalidades, fechas y estados de cada campeonato.",
      filas: filasTorneos,
    },
    Equipos: {
      label: "PARTICIPANTES",
      title: "Equipos inscritos",
      description: "Administra delegados y plantillas oficiales.",
      filas: filasEquipos,
    },
    Partidos: {
      label: "CALENDARIO",
      title: "Fixture de partidos",
      description: "Consulta jornadas, canchas y estados en tiempo real.",
      filas: filasPartidos,
    },
    "Tabla de posiciones": {
      label: "COMPETENCIA",
      title: "Tabla de posiciones",
      description: "Rendimiento acumulado de los equipos participantes.",
      filas: filasTabla,
    },
  }[vista];
  const termino = busqueda.trim().toLowerCase();
  const filasFiltradas = contenido.filas.filter((fila) =>
    fila.slice(0, 3).some((valor) =>
      String(valor || "").toLowerCase().includes(termino),
    ),
  );
  return (
    <section className="page-section">
      <div className="page-intro">
        <span className="eyebrow orange">{contenido.label}</span>
        <h2>{contenido.title}</h2>
        <p>{contenido.description}</p>
      </div>
      <div className="list-toolbar">
        <label className="search-field">
          Buscar
          <input
            type="search"
            value={busqueda}
            onChange={(evento) => onBusqueda(evento.target.value)}
            placeholder="Nombre, estado o modalidad"
            aria-label={`Buscar en ${vista}`}
          />
        </label>
      </div>
      <div className="data-list">
        {cargando ? (
          <p className="empty">Cargando información...</p>
        ) : filasFiltradas.length ? (
          filasFiltradas.map((fila) => (
            <div
              className={`data-row ${fila[0] === "Quantum XI" ? "danger" : ""}`}
              key={fila[3]?.id_partido || fila[0]}
            >
              <strong>{fila[0]}</strong>
              <span>{fila[1]}</span>
              <b>{fila[2]}</b>
              {vista === "Partidos" &&
                puedeAdministrar &&
                fila[3]?.estado !== "Finalizado" && (
                  <button
                    className="row-action"
                    onClick={() => onResultado(fila[3])}
                  >
                    Resultado
                  </button>
                )}
              <span className="arrow">›</span>
            </div>
          ))
        ) : (
          <p className="empty">
            {termino
              ? "No hay resultados para tu búsqueda."
              : "No hay registros disponibles todavía."}
          </p>
        )}
      </div>
    </section>
  );
}

export default App;