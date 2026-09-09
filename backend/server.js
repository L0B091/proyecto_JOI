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

    // 🧠 [MEMORIA_ORQUESTADOR]
    // aquí no se ejecuta memoria, pero sirve para diagnóstico del sistema
  });
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
