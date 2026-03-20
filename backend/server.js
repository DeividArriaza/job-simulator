const http = require("http");
const { waitForDatabase } = require("./config/db");
const { handleRequest } = require("./routes/jobs");

const PORT = process.env.APP_PORT || 3000;

function addCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  addCorsHeaders(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    await handleRequest(req, res, sendJSON);
  } catch (err) {
    console.error("Error interno:", err);
    sendJSON(res, 500, { error: "Error interno del servidor" });
  }
});

async function start() {
  try {
    await waitForDatabase();
    server.listen(PORT, () => {
      console.log(`Servidor escuchando en el puerto ${PORT}`);
    });
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

start();
