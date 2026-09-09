// Backend/memoria/memoriaSelectiva.js

import historialConversacion from "./historialConversacion.js";
import memoriaPersistente from "./memoriaPersistente.js";

/**
 * Analiza contexto y extrae memoria útil.
 */
function construir(userId, contexto = {}) {
  const ultimosMensajes =
    historialConversacion.obtenerHistorial(
      userId,
      20
    );

  const memoriaLarga =
    memoriaPersistente.obtener(userId);

  const textoReciente = ultimosMensajes
    .map(function (m) {
      return m.mensaje;
    })
    .join(" ")
    .toLowerCase();

  const contextoActual =
    detectarContexto(textoReciente);

  const relevantesPersistentes =
    filtrarPersistente(
      memoriaLarga,
      contextoActual
    );

  return {
    contextoActual,
    memoriaReciente: ultimosMensajes,
    memoriaRelevante: relevantesPersistentes
  };
}

/**
 * Detecta contexto dominante del usuario.
 */
function detectarContexto(texto) {
  if (
    texto.includes("app") ||
    texto.includes("desarrollo")
  ) {
    return "desarrollo";
  }

  if (
    texto.includes("ia") ||
    texto.includes("modelo")
  ) {
    return "ia";
  }

  if (
    texto.includes("negocio") ||
    texto.includes("dinero")
  ) {
    return "negocio";
  }

  if (texto.includes("whatsapp")) {
    return "automatizacion";
  }

  return "general";
}

/**
 * Filtra memoria persistente según contexto.
 */
function filtrarPersistente(
  memoria,
  contexto
) {
  if (!Array.isArray(memoria)) {
    return [];
  }

  return memoria.filter(function (item) {
    if (!item || typeof item !== "object") {
      return false;
    }

    // Los registros especiales no son recuerdos.
    if (
      item.clave === "_actividad_usuario_" ||
      item.clave === "_datos_usuario_"
    ) {
      return false;
    }

    if (
      contexto === "ia" &&
      (
        item.categoria === "ia" ||
        item.categoria === "proyecto"
      )
    ) {
      return true;
    }

    if (
      contexto === "desarrollo" &&
      item.categoria === "proyecto"
    ) {
      return true;
    }

    if (
      contexto === "negocio" &&
      item.categoria === "negocio"
    ) {
      return true;
    }

    if (
      contexto === "automatizacion" &&
      item.categoria === "automatizacion"
    ) {
      return true;
    }

    return item.importancia >= 2;
  });
}

/**
 * EXPORT
 */
export default {
  construir
};