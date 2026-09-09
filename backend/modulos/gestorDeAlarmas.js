import fs from "fs";
import path from "path";

/**
* GESTOR DE ALARMAS JOI
* Backend liviano: administra datos y sincronización
* La ejecución real ocurre en la app Flutter
*/

const DB_PATH = path.resolve("./backend/data/alarmas.json");

/* =========================================================
   UTILIDADES
========================================================= */

function leerDB() {
  try {
    if (!fs.existsSync(DB_PATH)) return [];
    const data = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(data || "[]");
  } catch (err) {
    console.error("❌ Error leyendo alarmas:", err);
    return [];
  }
}

function escribirDB(alarmas) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(alarmas, null, 2));
  } catch (err) {
    console.error("❌ Error guardando alarmas:", err);
  }
}

/* =========================================================
   API PRINCIPAL
========================================================= */

/**
* Crear alarma
*/
function crearAlarma(userID, hora) {
  const alarmas = leerDB();

  const nuevaAlarma = {
    id: Date.now().toString(),
    userID,
    hora, // "HH:MM"
    estado: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  alarmas.push(nuevaAlarma);
  escribirDB(alarmas);

  return nuevaAlarma;
}

/**
* Obtener todas las alarmas
*/
function obtenerAlarmas() {
  return leerDB();
}

/**
* Obtener alarmas activas
*/
function obtenerAlarmasActivas() {
  const alarmas = leerDB();
  return alarmas.filter(a => a.estado === "ACTIVE");
}

/**
* Obtener alarmas por usuario
*/
function obtenerAlarmasPorUsuario(userID) {
  const alarmas = leerDB();
  return alarmas.filter(
    a => a.userID === userID && a.estado === "ACTIVE"
  );
}

/**
* Cerrar alarma (cuando usuario la apaga en Flutter)
*/
function cerrarAlarma(userID, alarmId = null) {
  const alarmas = leerDB();

  const actualizadas = alarmas.map(a => {
    if (
      a.userID === userID &&
      a.estado === "ACTIVE" &&
      (alarmId ? a.id === alarmId : true)
    ) {
      return {
        ...a,
        estado: "RESOLVED",
        updatedAt: new Date().toISOString()
      };
    }
    return a;
  });

  escribirDB(actualizadas);
}

/**
* Sincronizar cambios desde la app Flutter
*/
function actualizarDesdeApp(alarmId, data = {}) {
  const alarmas = leerDB();

  const actualizadas = alarmas.map(a => {
    if (a.id === alarmId) {
      return {
        ...a,
        ...data,
        updatedAt: new Date().toISOString()
      };
    }
    return a;
  });

  escribirDB(actualizadas);
}

/* ========================================================= */

export default {
  crearAlarma,
  obtenerAlarmas,
  obtenerAlarmasActivas,
  obtenerAlarmasPorUsuario,
  cerrarAlarma,
  actualizarDesdeApp
}; 
