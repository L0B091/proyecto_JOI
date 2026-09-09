// preferenciasDeComunicacion.js
// Modulo encargado de detectar y almacenar preferencias comunicativas del usuario

/**
 * Analiza el estilo de los mensajes del usuario y
 * registra patrones de comunicacion preferidos.
 */

function preferenciasDeComunicacion(mensajeUsuario = "", memoriaUsuario = {}) {

  if (typeof mensajeUsuario !== "string") {
    return memoriaUsuario;
  }

  if (!memoriaUsuario.preferenciasComunicacion) {
    memoriaUsuario.preferenciasComunicacion = {
      longitudMensajes: "media",
      estilo: "neutral",
      usaPreguntas: false
    };
  }

  const mensaje = mensajeUsuario.trim();
  const mensajeLower = mensaje.toLowerCase();

  // --- analizar longitud de mensaje ---
  if (mensaje.length < 25) {
    memoriaUsuario.preferenciasComunicacion.longitudMensajes = "corta";
  } 
  else if (mensaje.length > 120) {
    memoriaUsuario.preferenciasComunicacion.longitudMensajes = "larga";
  }

  // --- detectar preguntas frecuentes ---
  if (mensaje.includes("?")) {
    memoriaUsuario.preferenciasComunicacion.usaPreguntas = true;
  }

  // --- detectar tono informal ---
  const patronesInformales = [
    "jaja",
    "jeje",
    "xd",
    "che",
    "hola"
  ];

  for (const patron of patronesInformales) {
    if (mensajeLower.includes(patron)) {
      memoriaUsuario.preferenciasComunicacion.estilo = "informal";
      break;
    }
  }

  return memoriaUsuario;

}

export default preferenciasDeComunicacion;