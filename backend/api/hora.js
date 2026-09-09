// backend/apis/hora.js
// Módulo para obtener la hora y fecha actual, con formato local para Joi

/**
* Devuelve la fecha y hora actuales en formato local
* @param {string} zonaHoraria - opcional, ejemplo: "America/Argentina/Buenos_Aires"
* @returns {object} { fecha: "YYYY-MM-DD", hora: "HH:MM", fechaCompleta: Date }
*/
function obtenerHoraActual(zonaHoraria = Intl.DateTimeFormat().resolvedOptions().timeZone) {
  const ahora = new Date();

  // Opciones para conversión a zona horaria
  const opciones = { timeZone: zonaHoraria, hour12: false };
  const fecha = ahora.toLocaleDateString('es-AR', opciones); // formato YYYY/MM/DD
  const hora = ahora.toLocaleTimeString('es-AR', { ...opciones, hour: '2-digit', minute: '2-digit' });

  return { fecha, hora, fechaCompleta: ahora };
}

/**
* Formatea un objeto Date a "DD/MM/YYYY HH:MM"
* @param {Date} fechaObj
* @returns {string}
*/
function formatearFecha(fechaObj) {
  const dia = String(fechaObj.getDate()).padStart(2, '0');
  const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
  const año = fechaObj.getFullYear();
  const hora = String(fechaObj.getHours()).padStart(2, '0');
  const min = String(fechaObj.getMinutes()).padStart(2, '0');

  return `${dia}/${mes}/${año} ${hora}:${min}`;
}

// Exportación ESM
export default { obtenerHoraActual, formatearFecha }; 
