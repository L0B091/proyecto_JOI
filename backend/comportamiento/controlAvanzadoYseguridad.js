import politicaJoi from "../seguridad/politicaJoi.js";
import antiPromptInjection from "../seguridad/antiPromptInjection.js";
import inmutabilidad from "../nucleo_psicologico/inmutabilidad.js";

function verificarContexto(usuarioId, contexto = {}) {
  const mensaje = String(
    contexto.mensajeUsuario ||
    contexto.mensaje ||
    contexto.entradaProcesada?.textoOriginal ||
    ""
  );

  const politica = politicaJoi(mensaje, contexto);
  const antiPrompt = antiPromptInjection(mensaje);
  const identidad = inmutabilidad.detectarViolacion(mensaje);

  return !politica.bloqueado && !antiPrompt.bloqueado && !identidad.violacion;
}

export default {
  verificarContexto
};
