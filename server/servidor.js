import "dotenv/config";
import express from "express";
import cors from "cors";
import conexion from "./config/BaseDatosConfig.js";
import "./models/ModelosModel.js";
import enrutador from "./ApiRoutes.js";
import { manejarErrores } from "./middleware/ValidationMiddleware.js";
import { crearUsuariosIniciales } from "./services/AutenticacionService.js";

const aplicacion = express();
const puerto = Number(process.env.PORT || 3000);

async function normalizarColumnasDeFecha() {
  for (const tabla of [
    "usuarios",
    "torneos",
    "equipos",
    "inscripciones_torneo",
    "partidos",
  ]) {
    const [columnas] = await conexion.query(`SHOW COLUMNS FROM \`${tabla}\``);
    const nombres = columnas.map(({ Field }) => Field);
    if (nombres.includes("createdAt") && !nombres.includes("created_at")) {
      await conexion.query(
        `ALTER TABLE \`${tabla}\` CHANGE COLUMN createdAt created_at DATETIME NOT NULL`,
      );
    }
    if (nombres.includes("updatedAt") && !nombres.includes("updated_at")) {
      await conexion.query(
        `ALTER TABLE \`${tabla}\` CHANGE COLUMN updatedAt updated_at DATETIME NOT NULL`,
      );
    }
  }
}

aplicacion.use(cors());
aplicacion.use(express.json());
aplicacion.get("/", (req, res) =>
  res.json({
    servicio: "E-Sports API",
    estado: "activo",
    api: "/api",
    frontend: "http://localhost:5173",
  }),
);
aplicacion.use("/api", enrutador);
aplicacion.use(manejarErrores);

try {
  await conexion.authenticate();
  await normalizarColumnasDeFecha();
  await conexion.sync();
  await crearUsuariosIniciales();
  aplicacion.listen(puerto, () =>
    console.log(`E-Sports API en http://localhost:${puerto}`),
  );
} catch (error) {
  console.error("No fue posible conectar con MySQL:", error.message);
  aplicacion.listen(puerto, () =>
    console.log(
      `E-Sports API en modo sin base de datos: http://localhost:${puerto}`,
    ),
  );
}
