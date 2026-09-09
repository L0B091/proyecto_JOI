// Backend/memoria/memoriaCorta.js

import historialConversacion from "./historialConversacion.js";

const memoriaActiva = {};

/**
 * Inicializa memoria corta.
 */
function init(userId) {
  if (!memoriaActiva[userId]) {
    memoriaActiva[userId] = {
      contextoActual: "",
      ultimosMensajes: [],
      foco: null,
      intencionDetectada: null,
      timestamp: Date.now()
    };
  }
}

/**
 * Actualiza memoria corta desde el historial.
 */
function actualizar(userId, entradaUsuario) {
  if (!userId) {
    return null;
  }

  init(userId);

  const ultimos =
    historialConversacion.ultimosMensajes(
      userId,
      10
    );

  const texto = ultimos
    .join(" ")
    .toLowerCase();

  let intencion = "conversacion";

  if (
    texto.includes("precio") ||
    texto.includes("cuanto")
  ) {
    intencion = "consulta_precio";
  }

  if (
    texto.includes("app") ||
    texto.includes("proyecto")
  ) {
    intencion = "desarrollo";
  }

  if (
    texto.includes("ayuda") ||
    texto.includes("como")
  ) {
    intencion = "asistencia";
  }

  memoriaActiva[userId] = {
    contextoActual:
      typeof entradaUsuario === "string"
        ? entradaUsuario
        : "",

    ultimosMensajes: ultimos,

    foco: detectarFoco(texto),

    intencionDetectada: intencion,

    timestamp: Date.now()
  };

  return memoriaActiva[userId];
}

/**
 * Detecta foco principal de conversación.
 */
function detectarFoco(texto) {
  if (texto.includes("ia")) {
    return "IA";
  }

  if (texto.includes("negocio")) {
    return "NEGOCIO";
  }

  if (texto.includes("whatsapp")) {
    return "AUTOMATIZACION";
  }

  if (texto.includes("app")) {
    return "DESARROLLO";
  }

  return "GENERAL";
}

/**
 * Obtiene memoria corta.
 */
function obtener(userId) {
  if (!userId) {
    return null;
  }

  init(userId);

  return memoriaActiva[userId];
}

/**
 * Limpia memoria corta.
 *
 * Esto solamente elimina la memoria temporal.
 * No afecta el historial ni la memoria persistente.
 */
function limpiar(userId) {
  if (!userId) {
    return false;
  }

  delete memoriaActiva[userId];

  return true;
}

/**
 * EXPORT
 */
export default {
  actualizar,
  obtener,
  limpiar
};