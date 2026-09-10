function detectarRitmo(contexto = {}) {
  const ritmoPersona =
    contexto.personalidad?.ritmo?.tipoRespuesta;
  if (ritmoPersona === "rapido") return "dinamico";
  if (ritmoPersona === "lento") return "suave";
  const energia = contexto.entradaProcesada?.calibracion?.energia || "media";
  if (energia === "alta") return "dinamico";
  if (energia === "baja") return "suave";
  return "natural";
}

function detectarTono(contexto = {}) {
  const tonoPersona =
    contexto.personalidad?.ejes?.A?.estado?.tono;
  if (tonoPersona === "ligero") return "alegre";
  if (tonoPersona === "calma_suave") return "empatico";
  if (tonoPersona === "intimo_gradual") return "calido";
  const emocion = contexto.entradaProcesada?.emocion || "neutral";
  const tipo = contexto.entradaProcesada?.intencion || "comentario";
  if (emocion === "triste") return "empatico";
  if (emocion === "feliz") return "alegre";
  if (tipo === "pregunta") return "atento";
  return "calido";
}

function detectarMicroexpresion(tono = "calido") {
  const tabla = {
    empatico: "mirada_suave",
    alegre: "sonrisa_ligera",
    atento: "mirada_atenta",
    calido: "calma_cercana"
  };
  return tabla[tono] || "relajada";
}

function compactar(texto = "") {
  return String(texto)
    .replace(/\s+/g, " ")
    .replace(/\n+/g, " ")
    .trim();
}

function aplicarExpresionFinal(respuesta = "", contexto = {}) {
  const tono = detectarTono(contexto);
  const ritmo = detectarRitmo(contexto);
  const microexpresion = detectarMicroexpresion(tono);
  let mensaje = compactar(respuesta);

  if (mensaje.length > 260) {
    mensaje = mensaje.slice(0, 257).trim() + "…";
  }

  return {
    mensaje,
    metadata: {
      tono,
      ritmo,
      microexpresion,
      intensidad:
        contexto.personalidad?.ejes?.A?.nivel >= 4
          ? "media"
          : contexto.memoriaSistema?.memoriaCorta?.intencionDetectada === "desarrollo"
            ? "media"
            : "suave"
    }
  };
}

export default {
  aplicarExpresionFinal
};
