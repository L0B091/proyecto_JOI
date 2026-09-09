// backend/modulos/protocoloDespertador.js

import obtenerClima from "../apis/clima.js";
import gestorDeAlarmas from "./gestorDeAlarmas.js";

/**
* Utilidad de espera
*/
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
* Vibración suave en 2 pulsos
*/
async function vibracionDoble() {
  console.log("📳 vibración");
  await delay(600);
  console.log("📳 vibración");
}

/**
* Push tipo WhatsApp simulado
*/
async function push(userID, mensaje) {
  console.log(`📩 [${userID}] ${mensaje}`);
}

/**
* Mensajes por nivel de insistencia
*/
const mensajesPorStage = {
  1: [
    "Buenos días ☀️ es hora de despertar",
    "Ey… ya es momento de levantarse 😴",
    "El día ya empezó, vamos!"
  ],
  2: [
    "Segunda llamada ⏰ despertá",
    "No te duermas otra vez 😏",
    "Último aviso antes de la alarma fuerte"
  ],
  3: [
    "⚠️ ÚLTIMO INTENTO",
    "Esto ya es serio… despertate",
    "Activando alarma sonora"
  ]
};

/**
* Ejecuta una ronda de mensajes del stage actual
*/
async function ejecutarStage(userID, stage, respuestaUsuario = false) {
  const mensajes = mensajesPorStage[stage];

  for (const msg of mensajes) {
    await vibracionDoble();
    await push(userID, msg);
    await delay(1500);

    // Si el usuario responde en cualquier momento
    if (respuestaUsuario) {
      const clima = await obtenerClima(0, 0);

      await push(
        userID,
        `🌤 Buen día! ${clima.mensajeCorto}`
      );

      gestorDeAlarmas.cerrarAlarma(userID);

      return {
        estado: "respondio",
        mensaje: clima.mensajeCorto
      };
    }
  }

  return null;
}

/**
* Protocolo principal de despertador
*/
async function ejecutarAlarma(userID, respuestaUsuario = false) {
  const alarma = gestorDeAlarmas.obtenerAlarma(userID);

  if (!alarma || alarma.estado !== "ACTIVE") {
    return null;
  }

  let stage = alarma.stage || 1;

  // Ejecuta stage actual
  const resultado = await ejecutarStage(userID, stage, respuestaUsuario);

  // Si respondió → termina todo
  if (resultado) return resultado;

  // -------------------------
  // ESCALADO
  // -------------------------
  if (stage < 3) {
    gestorDeAlarmas.actualizarAlarma(userID, {
      stage: stage + 1,
      intentos: (alarma.intentos || 0) + 1
    });

    console.log(`⬆️ Escalando a stage ${stage + 1}`);

    return ejecutarAlarma(userID, respuestaUsuario);
  }

  // -------------------------
  // STAGE 3 FINAL → ALARMA SONORA
  // -------------------------
  console.log("🚨 ALARMA SONORA ACTIVADA");

  gestorDeAlarmas.cerrarAlarma(userID);

  return {
    estado: "alarmaSonora",
    mensaje: "Alarma sonora activada tras 3 intentos"
  };
}

export default {
  ejecutarAlarma
}; 
