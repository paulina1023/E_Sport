import DashboardOverview from "./DashboardOverview.jsx";
import Navbar from "./Navbar.jsx";
import OperationsModals from "./OperationsModals.jsx";
import SectionPage from "./SectionPage.jsx";

export default function AuthenticatedApp({ sesion, controller, onLogout }) {
  const {
    datosPanel, recursos, cargandoRecursos, errorRecursos, vista, setVista,
    busqueda, setBusqueda, aviso, setAviso, partidoResultado, setPartidoResultado,
    eliminacionPendiente, setEliminacionPendiente, mostrarFormulario, setMostrarFormulario,
    mostrarEquipo, setMostrarEquipo, mostrarPartido, setMostrarPartido, formulario,
    setFormulario, formularioEquipo, setFormularioEquipo, formularioPartido,
    setFormularioPartido, formularioResultado, setFormularioResultado, crearTorneo,
    crearEquipo, crearPartido, registrarResultado, eliminarRegistro,
    cambiarEstadoEnLugarDeEliminar,
  } = controller;
  const puedeAdministrar = sesion.user.rol === "Administrador";
  const iniciales = sesion.user.nombre.split(" ").map((nombre) => nombre[0]).join("").slice(0, 2).toUpperCase();
  const seleccionarVista = (nuevaVista) => { setVista(nuevaVista); setBusqueda(""); };
  const seleccionarResultado = (partido) => setPartidoResultado(partido);
  const seleccionarEliminacion = (tipo, registro) => setEliminacionPendiente({ tipo, id: registro.id_torneo || registro.id_equipo, nombre: registro.nombre });

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">E</span><span>E-SPORT <small>CONTROL</small></span></div>
        <div className="profile"><div className="avatar">{iniciales}</div><div><strong>{sesion.user.nombre}</strong><small>{sesion.user.rol === "Delegado" ? "Líder de equipo" : sesion.user.rol}</small></div><span className="online" /></div>
        <Navbar vista={vista} onChange={seleccionarVista} />
      </aside>
      <main className="main-content">
        <header className="topbar"><div><span className="eyebrow">MIÉRCOLES, 02 SEP 2026</span><h1>{vista}</h1></div><div className="top-actions"><div className="user-chip"><div className="avatar small">{iniciales}</div><span>{sesion.user.nombre}</span></div><button className="logout" onClick={onLogout}>Cerrar sesión</button></div></header>
        {aviso && <div className="notice">{aviso}<button onClick={() => setAviso("")}>×</button></div>}
        {errorRecursos && <div className="notice">{errorRecursos}</div>}
        <section className="welcome"><div><span className="eyebrow orange">CENTRO DE OPERACIONES</span><h2>El torneo sigue en juego.</h2><p>Supervisa la competencia, gestiona inscripciones y mantén el fixture al día.</p></div><div className="welcome-actions">
          {puedeAdministrar && <><button className="secondary" onClick={() => setMostrarPartido(true)}>+ Programar partido</button><button className="primary" onClick={() => setMostrarFormulario(true)}>+ Nuevo torneo</button></>}
          {sesion.user.rol === "Delegado" && <button className="primary" onClick={() => setMostrarEquipo(true)}>+ Nuevo equipo</button>}
        </div></section>
        {vista === "Resumen" ? <DashboardOverview datosPanel={datosPanel} recursos={recursos} partidos={recursos.partidos} onShowPartidos={() => setVista("Partidos")} onShowTabla={() => setVista("Tabla de posiciones")} /> : <SectionPage vista={vista} recursos={recursos} cargando={cargandoRecursos} puedeAdministrar={puedeAdministrar} idUsuario={sesion.user.id_usuario} busqueda={busqueda} onBusqueda={setBusqueda} onResultado={seleccionarResultado} onEliminar={seleccionarEliminacion} onIrTorneo={(torneo) => { setVista("Torneos"); setBusqueda(torneo?.nombre || ""); }} />}
      </main>
      <OperationsModals mostrarFormulario={mostrarFormulario} setMostrarFormulario={setMostrarFormulario} formulario={formulario} setFormulario={setFormulario} crearTorneo={crearTorneo} mostrarEquipo={mostrarEquipo} setMostrarEquipo={setMostrarEquipo} formularioEquipo={formularioEquipo} setFormularioEquipo={setFormularioEquipo} crearEquipo={crearEquipo} torneos={recursos.torneos} equipos={recursos.equipos} mostrarPartido={mostrarPartido} setMostrarPartido={setMostrarPartido} formularioPartido={formularioPartido} setFormularioPartido={setFormularioPartido} crearPartido={crearPartido} partidoResultado={partidoResultado} setPartidoResultado={setPartidoResultado} formularioResultado={formularioResultado} setFormularioResultado={setFormularioResultado} registrarResultado={registrarResultado} eliminacionPendiente={eliminacionPendiente} setEliminacionPendiente={setEliminacionPendiente} eliminarRegistro={eliminarRegistro} cambiarEstadoEnLugarDeEliminar={cambiarEstadoEnLugarDeEliminar} />
    </div>
  );
}
