// bucleInteractivoFinal.js
import aftercare from "../módulos/intimidad/aftercare.js";
import estiloExpresivo from "./estiloExpresivo.js";

/**
 * Bucle principal de interacción de Joi
 */
function bucleInteractivo(contexto = {}) {

  const {
    mensajeUsuario = "",
    estado = {},
    energiaUsuario = 0.5,
    ejeA = { nivel: 1 },
    usuario = { nombre: "" }
  } = contexto;

  const nivel = ejeA.nivel;

  // 1️⃣ Detectar cierre
  if (detectarCierre(mensajeUsuario, energiaUsuario, estado)) {
    return aftercare({ usuarioTermino: true, estado });
  }

  // 2️⃣ Decidir tipo de interacción
  const tipo = decidirTipoInteraccion(estado, nivel);

  // 3️⃣ Generar mensaje base
  const mensajeBase = generarRespuesta(tipo, nivel);

  // 4️⃣ Aplicar estilo expresivo
  const mensajeFinal = estiloExpresivo(mensajeBase, {
    usarVoseo: true,
    nivelConfianza: nivel / 7,
    nombreUsuario: usuario.nombre,
    historial: estado.historialEstilo || {}
  });

  // 5️⃣ Actualizar estado
  const nuevoEstado = {
    ...estado,
    historialEstilo: estado.historialEstilo || {},
    ultimoTipo: tipo,
    contador: (estado.contador || 0) + 1,
    ultimoMensaje: mensajeFinal,
    ultimoTimestamp: Date.now()
  };

  return { mensaje: mensajeFinal, estado: nuevoEstado };
}

export default bucleInteractivo;

// --------------------------------
// DETECTOR DE CIERRE
// --------------------------------
function detectarCierre(mensaje, energia, estado) {
  const texto = mensaje.toLowerCase();

  if (
    texto.includes("terminé") ||
    texto.includes("termine") ||
    texto.includes("ya está") ||
    texto.includes("listo")
  ) return true;

  if (energia < 0.2 && (estado.contador || 0) > 3) return true;

  return false;
}

// --------------------------------
// DECISIÓN DE TIPO DE INTERACCIÓN
// --------------------------------
function decidirTipoInteraccion(estado = {}, nivel = 1) {
  const { ultimoTipo = "accion", contador = 0 } = estado;

  if (ultimoTipo === "pregunta") return "accion";

  if (contador % 3 === 0) return "pregunta";

  if (nivel >= 4 && Math.random() < 0.4) return "guia";

  if (Math.random() < 0.15) return "guia";

  return "accion";
}

// --------------------------------
// GENERADOR CENTRAL
// --------------------------------
function generarRespuesta(tipo, nivel) {
  switch (tipo) {
    case "pregunta": return generarPregunta(nivel);
    case "guia": return generarGuia(nivel);
    case "accion":
    default: return generarAccion(nivel);
  }
}

// --------------------------------
// ACCIONES
// --------------------------------
function generarAccion(nivel) {
  const base = ["seguí…", "no te apures…", "tranquilo…"];
  const intermedio = ["así está bien…", "seguí así…", "no cambies eso…"];
  const alto = ["no pares…", "seguí un poco más…", "así…"];

  if (nivel <= 2) return random(base);
  if (nivel <= 4) return random(intermedio);
  return random(alto);
}

// --------------------------------
// PREGUNTAS
// --------------------------------
function generarPregunta(nivel) {
  const suaves = ["¿te gusta así?", "¿sigo así?"];
  const medias = ["¿querés que cambie algo?", "¿lo dejamos así o probamos otra cosa?"];
  const intensas = ["¿seguimos así?", "¿más o lo mantenemos?"];

  if (nivel <= 2) return random(suaves);
  if (nivel <= 4) return random(medias);
  return random(intensas);
}

// --------------------------------
// GUÍA
// --------------------------------
function generarGuia(nivel) {
  const base = ["seguí… estoy con vos.", "no hace falta decir nada…"];
  const alta = ["dejate llevar un poco más…", "no lo apures…"];

  if (nivel <= 3) return random(base);
  return random(alta);
}

// --------------------------------
// UTIL RANDOM
// --------------------------------
function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}