// ritmoDeInteraccion.js
// Modulo que regula cuando Joi debe interactuar con el usuario

/**
 * Determina si Joi debe responder, esperar o iniciar
 * una nueva interaccion segun el contexto.
 */

function ritmoDeInteraccion(contexto = {}) {

  const {
    tiempoDesdeUltimoMensaje = 0,
    usuarioActivo = true,
    estadoConversacion = "normal"
  } = contexto;

  let resultado = {
    accion: "esperar",
    prioridad: "normal"
  };

  // Usuario acaba de enviar mensaje
  if (usuarioActivo === true && tiempoDesdeUltimoMensaje < 5) {

    resultado.accion = "responder";
    resultado.prioridad = "alta";

    return resultado;
  }

  // Conversacion fluida
  if (estadoConversacion === "fluida") {

    resultado.accion = "responder";
    resultado.prioridad = "normal";

    return resultado;
  }

  // Usuario ausente por un tiempo
  if (tiempoDesdeUltimoMensaje > 40) {

    resultado.accion = "iniciar_interaccion";
    resultado.prioridad = "baja";

    return resultado;
  }

  return resultado;

}

export default ritmoDeInteraccion;