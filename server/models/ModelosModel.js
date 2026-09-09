import { DataTypes } from "sequelize";
import conexion from "../config/BaseDatosConfig.js";

export const Usuario = conexion.define(
  "Usuario",
  {
    id_usuario: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(255), allowNull: false },
    rol: {
      type: DataTypes.ENUM("Administrador", "Delegado", "Espectador"),
      defaultValue: "Espectador",
    },
  },
  { tableName: "usuarios", createdAt: "created_at", updatedAt: "updated_at" },
);
export const Torneo = conexion.define(
  "Torneo",
  {
    id_torneo: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    categoria: { type: DataTypes.STRING(50), allowNull: false },
    modalidad: {
      type: DataTypes.ENUM("Eliminacion Directa", "Fase de Grupos", "Liga"),
      defaultValue: "Liga",
    },
    fecha_inicio: { type: DataTypes.DATEONLY, allowNull: false },
    fecha_fin: { type: DataTypes.DATEONLY, allowNull: false },
    estado: {
      type: DataTypes.ENUM("Inscripcion", "En Curso", "Finalizado"),
      defaultValue: "Inscripcion",
    },
  },
  { tableName: "torneos", createdAt: "created_at", updatedAt: "updated_at" },
);
export const Equipo = conexion.define(
  "Equipo",
  {
    id_equipo: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    escudo_url: { type: DataTypes.STRING(255) },
    id_delegado: { type: DataTypes.INTEGER, allowNull: false },
  },
  { tableName: "equipos", createdAt: "created_at", updatedAt: "updated_at" },
);
export const Jugador = conexion.define(
  "Jugador",
  {
    id_jugador: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: { type: DataTypes.STRING(50), allowNull: false },
    apellido: { type: DataTypes.STRING(50), allowNull: false },
    dorsal: { type: DataTypes.INTEGER, allowNull: false },
    id_equipo: { type: DataTypes.INTEGER, allowNull: false },
  },
  { tableName: "jugadores", timestamps: false },
);
export const InscripcionTorneo = conexion.define(
  "InscripcionTorneo",
  {
    id_inscripcion: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_torneo: { type: DataTypes.INTEGER, allowNull: false },
    id_equipo: { type: DataTypes.INTEGER, allowNull: false },
    estado: {
      type: DataTypes.ENUM("Pendiente", "Aprobado", "Rechazado"),
      defaultValue: "Pendiente",
    },
  },
  {
    tableName: "inscripciones_torneo",
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [{ unique: true, fields: ["id_torneo", "id_equipo"] }],
  },
);
export const Partido = conexion.define(
  "Partido",
  {
    id_partido: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_torneo: { type: DataTypes.INTEGER, allowNull: false },
    id_equipo_local: { type: DataTypes.INTEGER, allowNull: false },
    id_equipo_visita: { type: DataTypes.INTEGER, allowNull: false },
    jornada_numero: { type: DataTypes.INTEGER, allowNull: false },
    fecha_hora: { type: DataTypes.DATE, allowNull: false },
    goles_local: { type: DataTypes.INTEGER, defaultValue: 0 },
    goles_visita: { type: DataTypes.INTEGER, defaultValue: 0 },
    cancha: { type: DataTypes.STRING(100), allowNull: false },
    estado: {
      type: DataTypes.ENUM(
        "Programado",
        "En Juego",
        "Finalizado",
        "Suspendido",
      ),
      defaultValue: "Programado",
    },
  },
  { tableName: "partidos", createdAt: "created_at", updatedAt: "updated_at" },
);

Usuario.hasMany(Equipo, { foreignKey: "id_delegado" });
Equipo.belongsTo(Usuario, { foreignKey: "id_delegado", as: "delegado" });
Equipo.hasMany(Jugador, { foreignKey: "id_equipo" });
Jugador.belongsTo(Equipo, { foreignKey: "id_equipo" });
Torneo.belongsToMany(Equipo, {
  through: InscripcionTorneo,
  foreignKey: "id_torneo",
});
Equipo.belongsToMany(Torneo, {
  through: InscripcionTorneo,
  foreignKey: "id_equipo",
});
InscripcionTorneo.belongsTo(Torneo, { foreignKey: "id_torneo" });
InscripcionTorneo.belongsTo(Equipo, { foreignKey: "id_equipo" });
Torneo.hasMany(Partido, { foreignKey: "id_torneo" });
Partido.belongsTo(Torneo, { foreignKey: "id_torneo" });
Partido.belongsTo(Equipo, {
  foreignKey: "id_equipo_local",
  as: "equipo_local",
});
Partido.belongsTo(Equipo, {
  foreignKey: "id_equipo_visita",
  as: "equipo_visita",
});
export { conexion };
