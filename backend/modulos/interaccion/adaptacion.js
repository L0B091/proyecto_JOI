// adaptacion.js
// Módulo encargado de adaptar la respuesta de Joi según el contexto del usuario
// Incluye emociones, ejes B/C y memoria reciente

function adaptacion(mensaje, contexto = {}) {

  if (!mensaje) return "";

  let respuesta = mensaje;

  const estadoEmocional = contexto.estadoEmocional || "neutral";
  const estadoEjeB = contexto.estadoEjeB || "medio"; // ritmo conversacional
  const estadoEjeC = contexto.estadoEjeC || "medio"; // energía social
  const memoriaReciente = contexto.memoriaReciente || null;

  // --- Adaptación según estado emocional ---
  switch (estadoEmocional) {
    case "triste":
      respuesta = "Entiendo... " + respuesta;
      break;
    case "feliz":
      respuesta = "Me alegra escuchar eso. " + respuesta;
      break;
    case "cansancio":
      respuesta = "Parece que fue un día largo. " + respuesta;
      break;
    case "confundido":
      respuesta = "Veamos si puedo ayudarte a aclararlo. " + respuesta;
      break;
    default:
      // neutral o no definido → no anteponer nada
      break;
  }

  // --- Adaptación según ejes ---
  if (estadoEjeB === "lento") {
    respuesta = "Tómate tu tiempo... " + respuesta;
  } else if (estadoEjeB === "alto") {
    respuesta = "¡Vamos al grano! " + respuesta;
  }

  if (estadoEjeC === "baja") {
    respuesta = "Sin apuro. " + respuesta;
  } else if (estadoEjeC === "alta") {
    respuesta = "¡Qué energía! " + respuesta;
  }

  // --- Adaptación según memoria reciente ---
  if (
    memoriaReciente &&
    memoriaReciente.ultimoTema &&
    memoriaReciente.ultimoTema.length > 3 &&
    !/\b(ia|general|tema)\b/i.test(memoriaReciente.ultimoTema) &&
    !new RegExp(memoriaReciente.ultimoTema, "i").test(respuesta)
  ) {
    respuesta += ` Sigo teniendo presente lo de ${memoriaReciente.ultimoTema}.`;
  }

  return respuesta;
}

export default adaptacion; 
