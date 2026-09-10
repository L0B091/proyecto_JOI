import estiloBase from "../motor/estiloExpresivo.js";

function ajustarTexto(texto = "", nivelIntimidad = 1) {
  return estiloBase(String(texto || ""), {
    usarVoseo: true,
    nivelConfianza: Math.max(0.2, Math.min(nivelIntimidad / 7, 1)),
    historial: {}
  });
}

function ajustarMicroReaccion(nombre = "", nivelIntimidad = 1) {
  return {
    nombre,
    intensidad: nivelIntimidad >= 5 ? "alta" : nivelIntimidad >= 3 ? "media" : "suave"
  };
}

export default {
  ajustarTexto,
  ajustarMicroReaccion
};
