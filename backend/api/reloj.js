// backend/apis/reloj.js
// Módulo de reloj y seguimiento de inactividad de usuarios para Joi
// Incluye hora actual, registro de última interacción y cálculo de tiempo inactivo

import horaAPI from './hora.js'; // opcional, para usar la función de hora y fecha

// Memoria interna para almacenar la última interacción de cada usuario
const memoriaUsuarios = {};

/**
* Obtiene la hora y fecha actual usando horaAPI o directamente
* @param {string} zonaHoraria - opcional, ej: "America/Argentina/Buenos_Aires"
* @returns {object} { fecha, hora, fechaCompleta }
*/
function obtenerHoraActual(zonaHoraria = Intl.DateTimeFormat().resolvedOptions().timeZone) {
  // Se puede usar horaAPI para consistencia
  return horaAPI.obtenerHoraActual(zonaHoraria);
}

/**
* Guarda la última interacción del usuario
* @param {string} usuarioID
*/
function guardarUltimaInteraccion(usuarioID) {
  const ahora = new Date();
  if (!memoriaUsuarios[usuarioID]) memoriaUsuarios[usuarioID] = {};
  memoriaUsuarios[usuarioID].ultimaInteraccion = ahora;
}

/**
* Devuelve el tiempo transcurrido en minutos desde la última interacción
* @param {string} usuarioID
* @returns {number|null} minutos desde última interacción, o null si no hay registro
*/
function tiempoDesdeUltimaInteraccion(usuarioID) {
  const usuario = memoriaUsuarios[usuarioID];
  if (!usuario || !usuario.ultimaInteraccion) return null;
  const ahora = new Date();
  const diferenciaMs = ahora - new Date(usuario.ultimaInteraccion);
  return Math.floor(diferenciaMs / 60000); // minutos
}

/**
* Formatea un objeto Date a "DD/MM/YYYY HH:MM"
* @param {Date} fechaObj
* @returns {string}
*/
function formatearFecha(fechaObj) {
  return horaAPI.formatearFecha(fechaObj);
}

// Exportación ESM
export default {
  obtenerHoraActual,
  formatearFecha,
  guardarUltimaInteraccion,
  tiempoDesdeUltimaInteraccion
}; 
