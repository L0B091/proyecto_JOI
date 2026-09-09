// modulos/preguntasDeRutina.js
// Genera preguntas de rutina e inicia conversación solo si corresponde

function preguntasDeRutina(contexto = {}) {

  const {
    historialPreguntas = [],
    estadoEmocional = "neutral",
    tipoContexto = "general", // hora | clima | calendario | noticias | general
    nivelInteraccion = "medio", // bajo | medio | alto
    horaActual = null,
    permitirInicio = false,
    memoriaUsuario = {}
  } = contexto;

  // --------------------------------
  // 1. Validar si Joi puede iniciar
  // --------------------------------
  if (permitirInicio && !puedeIniciarConversacion(horaActual, memoriaUsuario)) {
    return null; // Joi decide no intervenir
  }

  // --------------------------------
  // 2. Generar preguntas base
  // --------------------------------
  let posibles = [];

  switch (tipoContexto) {

    case "hora":
      posibles = [
        "¿Cómo viene tu día?",
        "¿Cómo estás?",
        "¿Cómo cerraste el día?"
      ];
      break;

    case "clima":
      posibles = [
        "Con este clima… ¿cómo lo llevas?",
        "¿El clima de hoy afectó tu dia?",
        "¿Sos de los que disfrutan este clima?"
      ];
      break;

    case "calendario":
      posibles = [
        "Tenías cosas hoy… ¿cómo te fue?",
        "¿El día estuvo cargado o tranquilo?",
        "¿Pudiste hacer lo que tenías pensado?"
      ];
      break;

    case "noticias":
      posibles = [
        "Hoy hubo bastante movimiento… ¿viste algo?",
        "¿Te llegó algo de lo que está pasando?",
        "¿Hay algo que te haya llamado la atención hoy?"
      ];
      break;

    default:
      posibles = [
        "¿Cómo van tus cosas?",
        "¿En qué estuviste hoy?",
        "¿Hay algo que te haya quedado dando vueltas?"
      ];
  }

  // --------------------------------
  // 3. Ajuste emocional (prioridad)
  // --------------------------------
  if (estadoEmocional === "triste") {
    posibles = [
      "¿Cómo estás… de verdad?",
      "¿Te está costando el día?",
      "¿Querés contarme qué te anda pasando?"
    ];
  }

  if (estadoEmocional === "cansancio") {
    posibles = [
      "¿Estás muy cargado hoy?",
      "¿Pudiste frenar un poco?",
      "¿Te estás dando un momento para vos?"
    ];
  }

  if (estadoEmocional === "feliz") {
    posibles.push(
      "Se te siente bien… ¿pasó algo bueno?",
      "Tenés buena energía hoy… ¿qué pasó?"
    );
  }

  // --------------------------------
  // 4. Nivel de interacción
  // --------------------------------
  if (nivelInteraccion === "bajo") {
    posibles = posibles.slice(0, 2);
  }

  if (nivelInteraccion === "alto") {
    posibles.push(
      "¿Qué fue lo más importante de tu día?",
      "¿Querés contarme un poco más?"
    );
  }

  // --------------------------------
  // 5. Evitar repetición
  // --------------------------------
  const disponibles = posibles.filter(p => !historialPreguntas.includes(p));
  const final = disponibles.length > 0 ? disponibles : posibles;

  const pregunta = final[Math.floor(Math.random() * final.length)];

  return {
    pregunta,
    tipo: "rutina"
  };
}

export default preguntasDeRutina; 