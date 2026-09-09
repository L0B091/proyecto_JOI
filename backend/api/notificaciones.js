// backend/apis/notificaciones.js
// Módulo para enviar notificaciones push de Joi

/**
* Envía una notificación push al usuario
* @param {string} usuarioID
* @param {string} titulo
* @param {string} mensaje
* @param {string} tipo - "alta", "media", "baja"
*/
function enviarNotificacion(usuarioID, titulo, mensaje, tipo = "media") {
  // Aquí iría la integración con la librería de push de tu plataforma (Firebase, OneSignal, etc.)
  console.log(`[Notificación ${tipo.toUpperCase()}] Para ${usuarioID}: ${titulo} - ${mensaje}`);
}

/**
* Notificación de buenos días
* @param {string} usuarioID
* @param {string} mensajeCorto - mensaje resumido (ej: clima)
*/
function notificarBuenosDias(usuarioID, mensajeCorto) {
  const titulo = "¡Buenos días!";
  const mensaje = mensajeCorto || "Que tengas un gran día.";
  enviarNotificacion(usuarioID, titulo, mensaje, "alta");
}

/**
* Notificación de recordatorio de calendario
* @param {string} usuarioID
* @param {string} evento - nombre del evento o nota
* @param {Date} fecha - fecha del evento
*/
function notificarRecordatorio(usuarioID, evento, fecha) {
  const titulo = "Recordatorio de Joi";
  const mensaje = `No olvides: ${evento} el ${fecha.toLocaleString()}`;
  enviarNotificacion(usuarioID, titulo, mensaje, "alta");
}

/**
* Notificación de noticias o alertas durante el día
* @param {string} usuarioID
* @param {string} noticia
*/
function notificarNoticias(usuarioID, noticia) {
  const titulo = "Joi te informa";
  const mensaje = noticia;
  enviarNotificacion(usuarioID, titulo, mensaje, "baja");
}

/**
* Notificación de alarma / despertador
* @param {string} usuarioID
* @param {string} mensaje
*/
function notificarAlarma(usuarioID, mensaje) {
  const titulo = "Hora de despertar";
  enviarNotificacion(usuarioID, titulo, mensaje, "alta");
}

export default {
  enviarNotificacion,
  notificarBuenosDias,
  notificarRecordatorio,
  notificarNoticias,
  notificarAlarma
}; 
