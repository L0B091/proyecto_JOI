/*
* ORQUESTADOR.JS
* Punto único de entrada del sistema
* Conecta: Entrada → Memoria → Cognición → Personalidad → Estilo
*/

// =============================
//  ETIQUETAS DEL SISTEMA
// =============================
// [ENTRY]      → Entrada del usuario
// [MEMORY]     → Gestión de memoria
// [CONTEXT]    → Contexto unificado
// [COGNITION]  → Motor de decisión
// [PERSONA]    → Personalidad
// [STYLE]      → Estilo expresivo
// [OUTPUT]     → Respuesta final

import procesadorEntrada from "../motor/procesadorEntrada.js";
import cognicion from "../motor/cognicion.js";
import personalidad from "../motor/personalidad.js";
import estiloExpresivo from "../motor/estiloExpresivo.js";

import { obtenerUsuario } from "../memoria/usuarioMemoria.js";

//  NUEVO: MEMORIA ORQUESTADOR
import memoriaOrquestador from "../memoria/memoriaOrquestador.js";

async function orquestador(mensajeUsuario, contexto = {}) {
  let memoriaUsuario = null;

  if (contexto.userId) {
    try {
      memoriaUsuario = obtenerUsuario(contexto.userId);
    } catch (err) {
      memoriaUsuario = null;
    }
  }

  // =========================================================
  // [ENTRY] 1. ENTRADA
  // =========================================================

  const entradaProcesada =
    procesadorEntrada.procesarEntrada(
      contexto.userId || "anonimo",
      mensajeUsuario,
      memoriaUsuario?.historialConversacion || []
    );

  // =========================================================
  // [MEMORY] 2. MEMORIA (USUARIO BASE)
  // =========================================================

  // NUEVO: MEMORIA COGNITIVA COMPLETA
  let memoriaSistema = null;

  if (contexto.userId) {
    try {
      memoriaSistema = await memoriaOrquestador.ejecutar({
        userId: contexto.userId,
        mensaje: mensajeUsuario,
        entradaProcesada
      });
    } catch (err) {
      console.error("Error en memoriaOrquestador:", err);
      memoriaSistema = null;
    }
  }

  // =========================================================
  // [CONTEXT] 3. CONTEXTO UNIFICADO
  // =========================================================

  const contextoCompleto = {
    ...contexto,
    entradaProcesada,
    memoriaUsuario,

    //  NUEVO: CONTEXTO COGNITIVO COMPLETO
    memoriaSistema
  };

  // =========================================================
  // [COGNITION] 4. COGNICIÓN (DECISIÓN CENTRAL)
  // =========================================================

  const resultadoCognicion = await cognicion(mensajeUsuario, contextoCompleto);

  let respuesta = resultadoCognicion?.respuesta || "No pude generar una respuesta.";

  // =========================================================
  // [PERSONA] 5. PERSONALIDAD (QUIÉN LO DICE)
  // =========================================================

  if (
    personalidad &&
    typeof personalidad.decidirComportamiento === "function"
  ) {
    const decisionPersonalidad =
      personalidad.decidirComportamiento({
        mensajeUsuario,
        estado: contexto.estado || {}
      });

    if (decisionPersonalidad?.estado) {
      contextoCompleto.estado =
        decisionPersonalidad.estado;
    }
  }

  // =========================================================
  // [STYLE] 6. ESTILO EXPRESIVO (CÓMO LO DICE)
  // =========================================================

  if (typeof estiloExpresivo === "function") {
    respuesta = estiloExpresivo(respuesta, contextoCompleto);
  }

  // =========================================================
  // [OUTPUT] 7. SALIDA FINAL
  // =========================================================

  return {
    respuesta,
    debug: {
      entradaProcesada,
      cognicion: resultadoCognicion,
      memoriaUsuario,

      // NUEVO DEBUG COMPLETO
      memoriaSistema
    }
  };
}

export default orquestador; 
