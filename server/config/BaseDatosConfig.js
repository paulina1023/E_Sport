import "dotenv/config";
import { Sequelize } from "sequelize";

const conexion = new Sequelize(
  process.env.DB_NAME || "esports_db",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    dialect: "mysql",
    connectTimeout: 3000,
    logging: false,
  },
);

export default conexion;
