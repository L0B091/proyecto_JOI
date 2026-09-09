
// Modulo encargado de gestionar la primera experiencia del usuario con Joi

function bienvenidaCinematografica(contexto = {}) {

  const primeraSesion = contexto.primeraSesion === true;

  // Si no es la primera sesión, el módulo no se activa
  if (!primeraSesion) {
    return {
      activar: false
    };
  }

  // Frases del loop neutral
  const frasesLoop = [
    "¿Estas ahi?",
    "¿Queres charlar conmigo?",
    "Hola... ¿estas ahi?"
  ];

  const fraseAleatoria =
    frasesLoop[Math.floor(Math.random() * frasesLoop.length)];

  return {

    activar: true,

    inicio: {
      pantalla: 1,
      avatar3D: true,
      videoPresentacion: true,
      gestosNaturales: true,
      microexpresiones: true
    },

    transicionLoopNeutral: {
      pausaSegundos: 2,
      fraseInicial: fraseAleatoria
    },

    reglas: {
      simularMemoria: false,
      tono: "calido",
      improvisarVideo: false
    }

  };

}

export default bienvenidaCinematografica;