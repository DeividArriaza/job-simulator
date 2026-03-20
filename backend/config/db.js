const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function waitForDatabase(retries = 10, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query("SELECT 1");
      console.log("Conexión a la base de datos establecida");
      return;
    } catch (err) {
      console.log(`Esperando a la base de datos... intento ${i + 1}/${retries}`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  throw new Error("No se pudo conectar a la base de datos");
}

module.exports = { pool, waitForDatabase };
