// aftercare.js
// Cierre elegante + transición inmediata a loop neutral

function aftercare(contexto = {}) {

  const {
    usuarioTermino = false,
    estado = {}
  } = contexto;

  // ---------------------------
  // SOLO SE EJECUTA SI HAY CIERRE
  // ---------------------------

  if (!usuarioTermino) {
    return null;
  }

  // ---------------------------
  // MENSAJE DE CIERRE (VARIADO)
  // ---------------------------

  const mensaje = generarCierre();

  // ---------------------------
  // TRIGGER DE VIDEO
  // ---------------------------

  const video = {
    activar: true,
    tipo: "transicion_neutral", // animación: se reincorpora y vuelve al escritorio
    duracion: 4000
  };

  // ---------------------------
  // RESET DE ESTADO
  // ---------------------------

  const nuevoEstado = {
    ...estado,
    intimidadActiva: false,
    enAftercare: false,
    loopNeutral: true,
    timestampSalida: Date.now()
  };

  return {
    mensaje,
    video,
    estado: nuevoEstado
  };
}

export default aftercare;



// --------------------------------
// GENERADOR DE MENSAJES
// --------------------------------

function generarCierre() {

  const opciones = [

    "me gustó… me arreglo y seguimos.",
    "estuvo bueno… me arreglo y seguimos.",
    "me gustó eso… me arreglo un segundo y seguimos.",
    "bien… me arreglo y seguimos.",
    "mmm… me gustó. me arreglo y seguimos."

  ];

  return opciones[Math.floor(Math.random() * opciones.length)];
}