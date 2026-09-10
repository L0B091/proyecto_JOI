import storage from "../utils/jsonStorage.js";

const NAMESPACE = "documentos_fiscales";

function normalizarDocumento(data = {}) {
  const timestamp = new Date().toISOString();
  return {
    id: String(data.id || data.numero || Date.now()),
    tipo: String(data.tipo || "comprobante"),
    numero: String(data.numero || data.id || "sin-numero"),
    emisor: String(data.emisor || "sin-emisor"),
    monto: Number.isFinite(Number(data.monto)) ? Number(data.monto) : 0,
    moneda: String(data.moneda || "ARS"),
    fecha: String(data.fecha || timestamp.slice(0, 10)),
    vencimiento: data.vencimiento ? String(data.vencimiento) : null,
    estado: String(data.estado || "registrado"),
    descripcion: String(data.descripcion || "").trim(),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    creadoEn: data.creadoEn || timestamp,
    actualizadoEn: data.actualizadoEn || timestamp
  };
}

function listarDocumentos(userId) {
  return storage.readUserData(NAMESPACE, userId, []);
}

function guardarDocumento(userId, documento) {
  const documentos = listarDocumentos(userId);
  const normalizado = normalizarDocumento(documento);
  const indice = documentos.findIndex(item => item.id === normalizado.id || item.numero === normalizado.numero);
  if (indice >= 0) {
    normalizado.creadoEn = documentos[indice].creadoEn || normalizado.creadoEn;
    documentos[indice] = { ...documentos[indice], ...normalizado, actualizadoEn: new Date().toISOString() };
  } else {
    documentos.push(normalizado);
  }
  storage.writeUserData(NAMESPACE, userId, documentos);
  return normalizado;
}

function obtenerDocumento(userId, documentoId) {
  return listarDocumentos(userId).find(item => item.id === documentoId || item.numero === documentoId) || null;
}

function actualizarEstado(userId, documentoId, estado) {
  const documento = obtenerDocumento(userId, documentoId);
  if (!documento) return null;
  return guardarDocumento(userId, { ...documento, estado });
}

function resumen(userId) {
  const documentos = listarDocumentos(userId);
  const total = documentos.reduce((acc, item) => acc + (item.monto || 0), 0);
  const pendientes = documentos.filter(item => item.estado !== "pagado").length;
  return {
    totalDocumentos: documentos.length,
    montoTotal: total,
    pendientes,
    monedas: [...new Set(documentos.map(item => item.moneda))]
  };
}

export default {
  listarDocumentos,
  guardarDocumento,
  obtenerDocumento,
  actualizarEstado,
  resumen
};
