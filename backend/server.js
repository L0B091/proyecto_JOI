/*
* SERVER JOI - FINAL
* ------------------
* - Punto de entrada del backend
* - Conecta cliente con orquestador
* - Manejo básico de errores
* - Listo para escalar
*/

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import orquestadorChat from "./orquestador/orquestadorChat.js";
import veniceClient from "./llm/veniceClient.js";
import horaApi from "./api/hora.js";
import relojApi from "./api/reloj.js";
import climaApi from "./api/clima.js";
import noticiasApi from "./api/noticias.js";
import calendarioApi from "./api/calendario.js";
import notificacionesApi from "./api/notificaciones.js";
import mercadoPagoApi from "./api/mercadoPago.js";
import premiumManager from "./modulos/premium/premiumManager.js";
import codigoMemoria from "./memoria/codigoMemoria.js";
import documentosFiscales from "./memoria/documentosFiscales.js";

// 🧠 [MEMORIA_ORQUESTADOR] (NO IMPORTADO AQUÍ DIRECTAMENTE)
// Flujo de memoria se ejecuta dentro de orquestadorChat

// =============================
// CONFIGURACIÓN
// =============================

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// =============================
// MIDDLEWARES
// =============================

app.use(cors());
app.use(express.json());

// =============================
// RUTA BASE (HOME)
// =============================

app.get("/", (req, res) => {
  res.json({
    ok: true,
    servicio: "JOI BACKEND",
    ruta: "HOME",
    estado: "activo 🚀",
    endpoints: ["/", "/health", "/chat"]
  });
});

// =============================
// HEALTH CHECK
// =============================

app.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    servicio: "Joi Backend",
    estado: "activo",
    timestamp: new Date().toISOString(),
    llm: veniceClient.obtenerDiagnostico(),

    // 🧠 [MEMORIA_ORQUESTADOR]
    // aquí no se ejecuta memoria, pero sirve para diagnóstico del sistema
  });
});

app.get("/api/hora", (req, res) => {
  const zonaHoraria = req.query.zonaHoraria;
  res.json({
    ok: true,
    data: horaApi.obtenerHoraActual(zonaHoraria)
  });
});

app.get("/api/reloj/:userId", (req, res) => {
  const { userId } = req.params;
  res.json({
    ok: true,
    data: {
      ahora: relojApi.obtenerHoraActual(),
      minutosDesdeUltimaInteraccion:
        relojApi.tiempoDesdeUltimaInteraccion(userId)
    }
  });
});

app.post("/api/reloj/:userId/interaccion", (req, res) => {
  const { userId } = req.params;
  relojApi.guardarUltimaInteraccion(userId);
  res.json({
    ok: true,
    data: {
      userId,
      ultimaInteraccionRegistrada: true
    }
  });
});

app.get("/api/clima", async (req, res) => {
  const lat = Number(req.query.lat ?? -34.6037);
  const lon = Number(req.query.lon ?? -58.3816);
  const data = await climaApi(lat, lon);
  res.json({ ok: true, data });
});

app.get("/api/noticias", async (req, res) => {
  const ciudad = String(req.query.ciudad || "");
  const categorias = String(
    req.query.categorias || ""
  )
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);

  const noticias =
    await noticiasApi.obtenerNoticias(
      ciudad,
      categorias
    );

  res.json({
    ok: true,
    data: noticias
  });
});

app.get("/api/calendario/:userId", (req, res) => {
  res.json({
    ok: true,
    data: calendarioApi.listarEventos(
      req.params.userId
    )
  });
});

app.post("/api/calendario/:userId", (req, res) => {
  const data = calendarioApi.agregarEvento(
    req.params.userId,
    req.body
  );
  res.json({
    ok: data.exito !== false,
    data
  });
});

app.delete("/api/calendario/:userId/:eventoId", (req, res) => {
  const data =
    calendarioApi.eliminarEvento(
      req.params.userId,
      req.params.eventoId
    );
  res.json({
    ok: data.exito,
    data
  });
});

app.get("/api/notificaciones/:userId", (req, res) => {
  res.json({
    ok: true,
    data:
      notificacionesApi.listarNotificaciones(
        req.params.userId
      )
  });
});

app.post("/api/notificaciones/:userId", (req, res) => {
  const { titulo, mensaje, tipo } = req.body;
  const data =
    notificacionesApi.enviarNotificacion(
      req.params.userId,
      titulo,
      mensaje,
      tipo
    );
  res.json({ ok: true, data });
});

app.post("/api/notificaciones/:userId/:id/leida", (req, res) => {
  const data =
    notificacionesApi.marcarLeida(
      req.params.userId,
      req.params.id
    );
  res.json({ ok: Boolean(data), data });
});

app.get("/api/mercadopago/plan", (req, res) => {
  res.json({
    ok: true,
    data:
      mercadoPagoApi.explicarPremium(
        String(req.query.feature || "M/A")
      )
  });
});

app.post("/api/mercadopago/checkout", async (req, res) => {
  const { userId, feature } = req.body;
  const data =
    await mercadoPagoApi.generarLinkPago(
      userId || "anonimo",
      feature || "M/A"
    );
  res.json({ ok: true, data });
});

app.post("/api/mercadopago/verify", async (req, res) => {
  const { userId, paymentId, status } = req.body;
  const data =
    await mercadoPagoApi.verificarPago(
      paymentId,
      userId || "anonimo",
      status || "approved"
    );
  res.json({ ok: Boolean(data?.ok), data });
});

app.get("/api/premium/:userId", (req, res) => {
  res.json({
    ok: true,
    data: premiumManager.obtenerEstado(
      req.params.userId
    )
  });
});

app.get("/api/memoria/codigo/:userId", (req, res) => {
  const { userId } = req.params;
  const q = String(req.query.q || "");
  const data = q
    ? codigoMemoria.buscarArchivos(userId, q)
    : codigoMemoria.listarArchivos(userId);
  res.json({ ok: true, data });
});

app.post("/api/memoria/codigo/:userId", (req, res) => {
  const data = codigoMemoria.guardarArchivo(
    req.params.userId,
    req.body
  );
  res.json({ ok: true, data });
});

app.get("/api/memoria/codigo/:userId/:archivoId", (req, res) => {
  const data = codigoMemoria.obtenerArchivo(
    req.params.userId,
    req.params.archivoId
  );
  res.json({ ok: Boolean(data), data });
});

app.delete("/api/memoria/codigo/:userId/:archivoId", (req, res) => {
  const ok = codigoMemoria.eliminarArchivo(
    req.params.userId,
    req.params.archivoId
  );
  res.json({ ok });
});

app.get("/api/memoria/fiscal/:userId", (req, res) => {
  res.json({
    ok: true,
    data: {
      documentos:
        documentosFiscales.listarDocumentos(
          req.params.userId
        ),
      resumen:
        documentosFiscales.resumen(
          req.params.userId
        )
    }
  });
});

app.post("/api/memoria/fiscal/:userId", (req, res) => {
  const data =
    documentosFiscales.guardarDocumento(
      req.params.userId,
      req.body
    );
  res.json({ ok: true, data });
});

app.post("/api/memoria/fiscal/:userId/:documentoId/estado", (req, res) => {
  const data =
    documentosFiscales.actualizarEstado(
      req.params.userId,
      req.params.documentoId,
      req.body.estado
    );
  res.json({ ok: Boolean(data), data });
});

// =============================
// ENDPOINT PRINCIPAL: CHAT
// =============================

app.post("/chat", async (req, res) => {

  // 🧠 [MEMORIA_ORQUESTADOR - INPUT ENTRY POINT]
  // Este es el punto donde el mensaje entra al sistema de memoria

  try {
    const { mensaje, userId, contexto } = req.body;

    // -------------------------
    // VALIDACIONES
    // -------------------------

    if (!mensaje || typeof mensaje !== "string") {
      return res.status(400).json({
        ok: false,
        error: "Mensaje inválido"
      });
    }

    // -------------------------
    // CONTEXTO BASE
    // -------------------------

    const contextoBase = {
      userId: userId || "anonimo",
      timestamp: Date.now(),
      ...contexto
    };

    // 🧠 [MEMORIA_ORQUESTADOR - CONTEXTO INICIAL]
    // contextoBase será consumido por memoriaOrquestador dentro del flujo de orquestación

    // -------------------------
    // EJECUCIÓN DEL SISTEMA
    // -------------------------

    const resultado = await orquestadorChat(mensaje, contextoBase);

    // 🧠 [MEMORIA_ORQUESTADOR - OUTPUT RETURN]
    // resultado ya contiene respuesta + debug de memoria (si está activado)

    // -------------------------
    // RESPUESTA
    // -------------------------

    return res.status(200).json({
      ok: true,
      respuesta: resultado?.respuesta || "No hubo respuesta",
      video: resultado?.video || null,
      expresion: resultado?.expresion || null,
      premium: resultado?.premium || null,

      // 🧠 [MEMORIA_ORQUESTADOR - DEBUG LAYER]
      debug: process.env.NODE_ENV === "development"
        ? resultado?.debug || null
        : undefined
    });

  } catch (error) {

    console.error("❌ Error en /chat:", error);

    return res.status(500).json({
      ok: false,
      error: "Error interno del servidor"
    });
  }
});

// =============================
// 404 - RUTAS NO ENCONTRADAS
// =============================

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: "Ruta no encontrada"

    // 🧠 [MEMORIA_ORQUESTADOR]
    // request fuera del sistema de conversación
  });
});

// =============================
// MANEJO GLOBAL DE ERRORES
// =============================

app.use((err, req, res, next) => {
  console.error("💥 Error global:", err);

  res.status(500).json({
    ok: false,
    error: "Fallo inesperado del servidor"

    // 🧠 [MEMORIA_ORQUESTADOR]
    // error fuera del flujo cognitivo/memoria
  });
});

// =============================
// INICIO DEL SERVIDOR
// =============================

app.listen(PORT, () => {
  console.log(`🚀 JOI corriendo en http://localhost:${PORT}`);

  // 🧠 [MEMORIA_ORQUESTADOR]
  // sistema listo - memoria se activa dentro del orquestadorChat
}); 
