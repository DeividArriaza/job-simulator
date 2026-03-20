const { pool } = require("../config/db");

const RESOURCE = "/jobs";

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("JSON inválido"));
      }
    });
    req.on("error", reject);
  });
}

function validate(data, partial = false) {
  const errors = [];
  const fields = {
    campo1: "string",
    campo2: "string",
    campo3: "string",
    campo4: "integer",
    campo5: "float",
    campo6: "boolean",
  };

  for (const [field, type] of Object.entries(fields)) {
    const value = data[field];

    if (partial && value === undefined) continue;

    if (value === undefined || value === null || value === "") {
      errors.push(`${field} es requerido`);
      continue;
    }

    switch (type) {
      case "string":
        if (typeof value !== "string") errors.push(`${field} debe ser string`);
        break;
      case "integer":
        if (typeof value !== "number" || !Number.isInteger(value))
          errors.push(`${field} debe ser entero`);
        break;
      case "float":
        if (typeof value !== "number") errors.push(`${field} debe ser numérico`);
        break;
      case "boolean":
        if (typeof value !== "boolean") errors.push(`${field} debe ser booleano`);
        break;
    }
  }

  return errors;
}

function parseUrl(url) {
  const [path] = url.split("?");
  const parts = path.split("/").filter(Boolean);
  // /jobs or /jobs/:id
  if (parts[0] !== RESOURCE.slice(1)) return null;
  return { id: parts[1] ? parseInt(parts[1], 10) : null };
}

async function handleRequest(req, res, sendJSON) {
  const route = parseUrl(req.url);

  if (!route) {
    return sendJSON(res, 404, { error: "Ruta no encontrada" });
  }

  const { id } = route;
  const method = req.method;

  // GET /jobs
  if (method === "GET" && id === null) {
    const result = await pool.query("SELECT * FROM jobs ORDER BY id ASC");
    return sendJSON(res, 200, result.rows);
  }

  // GET /jobs/:id
  if (method === "GET" && id) {
    const result = await pool.query("SELECT * FROM jobs WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return sendJSON(res, 404, { error: "Recurso no encontrado" });
    }
    return sendJSON(res, 200, result.rows[0]);
  }

  // POST /jobs
  if (method === "POST" && id === null) {
    let data;
    try {
      data = await parseBody(req);
    } catch {
      return sendJSON(res, 400, { error: "JSON inválido" });
    }

    const errors = validate(data);
    if (errors.length > 0) {
      return sendJSON(res, 400, { error: errors.join(", ") });
    }

    const result = await pool.query(
      `INSERT INTO jobs (campo1, campo2, campo3, campo4, campo5, campo6)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [data.campo1, data.campo2, data.campo3, data.campo4, data.campo5, data.campo6]
    );
    return sendJSON(res, 201, result.rows[0]);
  }

  // PUT /jobs/:id
  if (method === "PUT" && id) {
    let data;
    try {
      data = await parseBody(req);
    } catch {
      return sendJSON(res, 400, { error: "JSON inválido" });
    }

    const errors = validate(data);
    if (errors.length > 0) {
      return sendJSON(res, 400, { error: errors.join(", ") });
    }

    const exists = await pool.query("SELECT id FROM jobs WHERE id = $1", [id]);
    if (exists.rows.length === 0) {
      return sendJSON(res, 404, { error: "Recurso no encontrado" });
    }

    const result = await pool.query(
      `UPDATE jobs SET campo1=$1, campo2=$2, campo3=$3, campo4=$4, campo5=$5, campo6=$6
       WHERE id=$7 RETURNING *`,
      [data.campo1, data.campo2, data.campo3, data.campo4, data.campo5, data.campo6, id]
    );
    return sendJSON(res, 200, result.rows[0]);
  }

  // DELETE /jobs/:id
  if (method === "DELETE" && id) {
    const result = await pool.query("DELETE FROM jobs WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return sendJSON(res, 404, { error: "Recurso no encontrado" });
    }
    return sendJSON(res, 204, null);
  }

  sendJSON(res, 405, { error: "Método no permitido" });
}

module.exports = { handleRequest };
