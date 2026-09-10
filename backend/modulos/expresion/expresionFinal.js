function detectarRitmo(contexto = {}) {
  const energia = contexto.entradaProcesada?.calibracion?.energia || "media";
  if (energia === "alta") return "dinamico";
  if (energia === "baja") return "suave";
  return "natural";
}

function detectarTono(contexto = {}) {
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
      intensidad: contexto.memoriaSistema?.memoriaCorta?.intencionDetectada === "desarrollo" ? "media" : "suave"
    }
  };
}

export default {
  aplicarExpresionFinal
};
