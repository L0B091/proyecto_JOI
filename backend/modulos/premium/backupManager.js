import crypto from "crypto";
import storage from "../../utils/jsonStorage.js";

const NAMESPACE = "premium_backup";

function registroBase(userId) {
  return {
    userId,
    backup: null,
    historial: []
  };
}

function checksum(value = "") {
  return crypto
    .createHash("sha256")
    .update(String(value))
    .digest("hex");
}

function normalizarBackup(userId, rawBackup = {}) {
  return {
    version: Number(rawBackup.version || 1),
    userId,
    ownerHash: String(rawBackup.ownerHash || ""),
    iv: String(rawBackup.iv || ""),
    ciphertext: String(rawBackup.ciphertext || ""),
    updatedAt:
      rawBackup.updatedAt || new Date().toISOString(),
    checksum: checksum(rawBackup.ciphertext || "")
  };
}

function validarBackup(backup = {}) {
  if (!backup.ownerHash || !backup.iv || !backup.ciphertext) {
    const error = new Error("Respaldo premium inválido");
    error.status = 400;
    throw error;
  }
}

function guardarBackup(userId, rawBackup = {}) {
  validarBackup(rawBackup);
  const registro = storage.readUserData(
    NAMESPACE,
    userId,
    registroBase(userId)
  );

  const backup = normalizarBackup(userId, rawBackup);
  const evento = {
    tipo: "backup_actualizado",
    updatedAt: backup.updatedAt,
    checksum: backup.checksum
  };

  storage.writeUserData(NAMESPACE, userId, {
    userId,
    backup,
    historial: [...(registro.historial || []), evento].slice(-25)
  });

  return {
    userId,
    hasBackup: true,
    updatedAt: backup.updatedAt,
    checksum: backup.checksum,
    version: backup.version
  };
}

function obtenerBackup(userId) {
  const registro = storage.readUserData(
    NAMESPACE,
    userId,
    registroBase(userId)
  );

  return {
    userId,
    hasBackup: Boolean(registro.backup),
    backup: registro.backup,
    historial: Array.isArray(registro.historial)
      ? registro.historial
      : []
  };
}

export default {
  guardarBackup,
  obtenerBackup
};
