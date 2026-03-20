// Placeholder — rutas CRUD se implementan en el siguiente commit
async function handleRequest(req, res, sendJSON) {
  sendJSON(res, 404, { error: "Ruta no encontrada" });
}

module.exports = { handleRequest };
