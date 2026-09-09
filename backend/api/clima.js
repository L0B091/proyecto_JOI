// backend/apis/clima.js
// Módulo para obtener información del clima y preparar mensaje breve para Joi

import fetch from 'node-fetch';

/**
* Obtiene el clima para unas coordenadas dadas
* @param {number} lat - Latitud
* @param {number} lon - Longitud
* @returns {Promise<{temperatura: number|null, descripcion: string|null, mensajeCorto: string}>}
*/
async function obtenerClima(lat, lon) {
  try {
    const API_KEY = 'TU_API_KEY_AQUI'; // reemplazar con tu clave de OpenWeather
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`;

    const respuesta = await fetch(url);
    if (!respuesta.ok) {
      throw new Error(`Error al obtener clima: ${respuesta.statusText}`);
    }

    const data = await respuesta.json();

    const temperatura = data?.main?.temp ?? null;
    const descripcion = data?.weather?.[0]?.description ?? null;

    const mensajeCorto = generarMensajeCorto(temperatura, descripcion);

    return { temperatura, descripcion, mensajeCorto };

  } catch (error) {
    console.error(`Error en clima.js: ${error.message}`);
    return {
      temperatura: null,
      descripcion: null,
      mensajeCorto: 'No se pudo obtener el clima hoy.'
    };
  }
}

/**
* Genera un mensaje breve estilo Joi para notificación de buenos días
* @param {number|null} temp - temperatura
* @param {string|null} desc - descripción del clima
* @returns {string}
*/
function generarMensajeCorto(temp, desc) {
  let mensaje = 'Que tengas un buen día.';
  if (temp !== null) {
    if (temp <= 10) mensaje += ' Lleva abrigo, hoy hace frío.';
    else if (temp >= 25) mensaje += ' Hace calor, hidrátate.';
    else mensaje += ' El clima está agradable hoy.';
  }
  if (desc) mensaje += ` (${desc})`;
  return mensaje;
}

export default obtenerClima; 
