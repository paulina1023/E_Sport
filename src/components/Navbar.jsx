const opciones = [
  "Resumen",
  "Torneos",
  "Equipos",
  "Partidos",
  "Tabla de posiciones",
];

export default function Navbar({ vista, onChange }) {
  return (
    <nav aria-label="Navegación principal">
      {opciones.map((elemento, index) => (
        <button
          className={vista === elemento ? "nav-item active" : "nav-item"}
          onClick={() => onChange(elemento)}
          key={elemento}
        >
          <span>{String(index + 1).padStart(2, "0")}</span>
          {elemento}
        </button>
      ))}
    </nav>
  );
}
