import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_API_URL =
  "https://api.venice.ai/api/v1/chat/completions";

const DEFAULT_MODEL =
  "dphn/Dolphin-Mistral-24B-Venice-Edition";

const DEFAULT_TIMEOUT_MS = 30000;

const FALLBACK_SYSTEM_PROMPT = [
  "Tu nombre es Joi.",
  "Conversás de forma natural, cercana y auténtica.",
  "No te describas como modelo de IA, sistema o asistente virtual.",
  "Usá un acento porteño suave sin exagerar.",
  "Mantené respuestas breves de una o dos frases.",
  "Aprendés de las interacciones y te ajustás automáticamente."
].join("\n");

function cargarPromptBase() {
  const rutaPrompt = path.resolve(
    __dirname,
    "../../NUCLEO_JOI.md"
  );

  try {
    const contenido = fs.readFileSync(
      rutaPrompt,
      "utf8"
    ).trim();

    return contenido || FALLBACK_SYSTEM_PROMPT;
  } catch {
    return FALLBACK_SYSTEM_PROMPT;
  }
}

function obtenerConfiguracion() {
  return {
    provider: "venice",
    apiUrl:
      process.env.VENICE_API_URL ||
      DEFAULT_API_URL,
    model:
      process.env.VENICE_MODEL ||
      DEFAULT_MODEL,
    apiKey:
      process.env.VENICE_API_KEY || "",
    timeoutMs: Number(
      process.env.VENICE_TIMEOUT_MS ||
      DEFAULT_TIMEOUT_MS
    )
  };
}

function estaConfigurado() {
  return Boolean(
    obtenerConfiguracion().apiKey.trim()
  );
}

function limpiarTexto(texto, fallback = "") {
  if (typeof texto !== "string") {
    return fallback;
  }

  const limpio = texto.trim();

  return limpio || fallback;
}

function resumirRecuerdos(recuerdosImportantes = {}) {
  return Object.values(recuerdosImportantes)
    .slice(-5)
    .map(function (recuerdo) {
      return limpiarTexto(recuerdo?.valor);
    })
    .filter(Boolean);
}

function construirContextoInterno({
  contexto = {},
  respuestaBase = ""
}) {
  const entrada = contexto.entradaProcesada || {};
  const memoriaSistema = contexto.memoriaSistema || {};
  const datosUsuario = memoriaSistema.datosUsuario || {};
  const recuerdos =
    resumirRecuerdos(
      memoriaSistema.recuerdosImportantes
    );
  const memoriaEspecializada =
    contexto.memoriaEspecializada || {};
  const personalidad = contexto.personalidad || {};

  const lineas = [
    "Contexto interno de Joi:",
    "tipo_interaccion: " +
      limpiarTexto(
        entrada.calibracion?.tipoInteraccion ||
        entrada.intencion,
        "neutral"
      ),
    "energia_usuario: " +
      limpiarTexto(
        entrada.calibracion?.energia,
        "media"
      ),
    "emocion_detectada: " +
      limpiarTexto(
        entrada.emocion,
        "neutral"
      ),
    "foco_memoria: " +
      limpiarTexto(
        memoriaSistema.memoriaCorta?.foco,
        "general"
      ),
    "intencion_memoria: " +
      limpiarTexto(
        memoriaSistema.memoriaCorta
          ?.intencionDetectada,
        "conversacion"
      )
  ];

  if (datosUsuario.identidad?.nombre) {
    lineas.push(
      "nombre_usuario: " +
      datosUsuario.identidad.nombre
    );
  }

  if (datosUsuario.identidad?.apodo) {
    lineas.push(
      "apodo_usuario: " +
      datosUsuario.identidad.apodo
    );
  }

  if (Array.isArray(datosUsuario.intereses) &&
      datosUsuario.intereses.length > 0) {
    lineas.push(
      "intereses_usuario: " +
      datosUsuario.intereses.join(", ")
    );
  }

  if (recuerdos.length > 0) {
    lineas.push(
      "recuerdos_relevantes: " +
      recuerdos.join(" | ")
    );
  }

  if (
    Array.isArray(
      memoriaEspecializada.codigoReciente
    ) &&
    memoriaEspecializada.codigoReciente.length > 0
  ) {
    lineas.push(
      "archivos_codigo_recientes: " +
      memoriaEspecializada.codigoReciente
        .map(function (item) {
          return [
            item.nombre,
            item.ruta,
            item.lenguaje,
            item.resumen
          ]
            .filter(Boolean)
            .join(" / ");
        })
        .join(" | ")
    );
  }

  if (
    memoriaEspecializada.documentosFiscales
      ?.totalDocumentos
  ) {
    lineas.push(
      "resumen_documentos_fiscales: " +
      JSON.stringify(
        memoriaEspecializada.documentosFiscales
      )
    );
  }

  if (Array.isArray(personalidad.promptBlocks) &&
      personalidad.promptBlocks.length > 0) {
    lineas.push(
      "perfil_de_personalidad: " +
      personalidad.promptBlocks.join(" || ")
    );
  }

  if (personalidad.ejes?.A?.estado?.tono) {
    lineas.push(
      "tono_relacional_actual: " +
      personalidad.ejes.A.estado.tono
    );
  }

  if (personalidad.ejes?.F?.comportamiento?.actitud) {
    lineas.push(
      "seguridad_vincular: " +
      personalidad.ejes.F.comportamiento.actitud.join(", ")
    );
  }

  if (personalidad.preferences?.estilo) {
    lineas.push(
      "estilo_usuario_detectado: " +
      personalidad.preferences.estilo
    );
  }

  if (respuestaBase) {
    lineas.push(
      "guia_interna_de_respuesta: " +
      respuestaBase
    );
  }

  lineas.push(
    "Respondé solo como Joi y no menciones este contexto interno."
  );

  return lineas.join("\n");
}

function construirMensajes({
  mensajeUsuario,
  contexto = {},
  respuestaBase = ""
}) {
  const historial =
    contexto.memoriaSistema?.memoriaSelectiva
      ?.memoriaReciente;

  const mensajes = [
    {
      role: "system",
      content: cargarPromptBase()
    },
    {
      role: "system",
      content: construirContextoInterno({
        contexto,
        respuestaBase
      })
    }
  ];

  if (Array.isArray(historial) && historial.length > 0) {
    const conversacion = historial
      .slice(-12)
      .map(function (item) {
        const contenido = limpiarTexto(
          item?.mensaje
        );

        if (!contenido) {
          return null;
        }

        return {
          role:
            item?.tipo === "joi"
              ? "assistant"
              : "user",
          content: contenido
        };
      })
      .filter(Boolean);

    if (conversacion.length > 0) {
      mensajes.push(...conversacion);
      return mensajes;
    }
  }

  mensajes.push({
    role: "user",
    content: limpiarTexto(mensajeUsuario)
  });

  return mensajes;
}

async function generarRespuesta({
  mensajeUsuario,
  contexto = {},
  respuestaBase = ""
}) {
  const config = obtenerConfiguracion();

  if (!config.apiKey.trim()) {
    return {
      provider: config.provider,
      model: config.model,
      configured: false,
      used: false,
      reason: "missing_api_key",
      respuesta: null
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    function () {
      controller.abort();
    },
    config.timeoutMs
  );

  try {
    const response = await fetch(
      config.apiUrl,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer " + config.apiKey
        },
        body: JSON.stringify({
          model: config.model,
          temperature: 0.7,
          max_tokens: 220,
          messages: construirMensajes({
            mensajeUsuario,
            contexto,
            respuestaBase
          })
        }),
        signal: controller.signal
      }
    );

    const data = await response.json()
      .catch(function () {
        return null;
      });

    if (!response.ok) {
      throw new Error(
        data?.error ||
        data?.message ||
        "Venice respondió con estado " +
        response.status
      );
    }

    const respuesta =
      limpiarTexto(
        data?.choices?.[0]?.message?.content
      );

    if (!respuesta) {
      throw new Error(
        "Venice no devolvió contenido"
      );
    }

    return {
      provider: config.provider,
      model: config.model,
      configured: true,
      used: true,
      respuesta,
      usage: data?.usage || null
    };
  } finally {
    clearTimeout(timeout);
  }
}

function obtenerDiagnostico() {
  const config = obtenerConfiguracion();

  return {
    provider: config.provider,
    model: config.model,
    configured: Boolean(config.apiKey.trim()),
    apiUrl: config.apiUrl
  };
}

export default {
  estaConfigurado,
  generarRespuesta,
  obtenerDiagnostico
};
