import storage from "../utils/jsonStorage.js";

const NAMESPACE = "memoria_codigo";

function normalizarArchivo(data = {}) {
  const timestamp = new Date().toISOString();
  const nombre = String(data.nombre || data.fileName || "archivo").trim();
  const contenido = typeof data.contenido === "string" ? data.contenido : "";
  const ruta = String(data.ruta || data.path || nombre);
  return {
    id: String(
      data.id ||
      `${storage.sanitizeId(ruta)}_${Date.now()}`
    ),
    nombre,
    ruta,
    lenguaje: String(data.lenguaje || data.language || "texto"),
    resumen: String(data.resumen || data.summary || "").trim(),
    contenido,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    actualizadoEn: data.actualizadoEn || timestamp,
    creadoEn: data.creadoEn || timestamp
  };
}

function listarArchivos(userId) {
  return storage.readUserData(NAMESPACE, userId, []);
}

function guardarArchivo(userId, archivo) {
  const archivos = listarArchivos(userId);
  const normalizado = normalizarArchivo(archivo);
  const indice = archivos.findIndex(item => item.id === normalizado.id || item.ruta === normalizado.ruta);
  if (indice >= 0) {
    normalizado.creadoEn = archivos[indice].creadoEn || normalizado.creadoEn;
    archivos[indice] = { ...archivos[indice], ...normalizado, actualizadoEn: new Date().toISOString() };
  } else {
    archivos.push(normalizado);
  }
  storage.writeUserData(NAMESPACE, userId, archivos);
  return normalizado;
}

function obtenerArchivo(userId, archivoId) {
  return listarArchivos(userId).find(item => item.id === archivoId || item.ruta === archivoId) || null;
}

function buscarArchivos(userId, termino = "") {
  const query = String(termino).toLowerCase().trim();
  if (!query) return listarArchivos(userId);
  return listarArchivos(userId).filter(item => {
    const blob = [item.nombre, item.ruta, item.lenguaje, item.resumen, item.contenido, ...(item.tags || [])].join(" ").toLowerCase();
    return blob.includes(query);
  });
}

function eliminarArchivo(userId, archivoId) {
  const archivos = listarArchivos(userId);
  const filtrados = archivos.filter(item => item.id !== archivoId && item.ruta !== archivoId);
  storage.writeUserData(NAMESPACE, userId, filtrados);
  return filtrados.length !== archivos.length;
}

function contextoBreve(userId, limite = 5) {
  return listarArchivos(userId)
    .slice(-limite)
    .map(item => ({ nombre: item.nombre, ruta: item.ruta, lenguaje: item.lenguaje, resumen: item.resumen }));
}

export default {
  listarArchivos,
  guardarArchivo,
  obtenerArchivo,
  buscarArchivos,
  eliminarArchivo,
  contextoBreve
};
