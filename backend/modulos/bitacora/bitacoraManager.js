import datosUsuario from "../../memoria/datosUsuario.js";
import registrarActividad from "../../memoria/registrarActividad.js";
import premiumManager from "../premium/premiumManager.js";
import usuariosMemoria from "../../memoria/usuariosMemoria.js";

function calcularEnlacePsicologico(userId) {
  const actividad = registrarActividad.obtenerActividad(userId);
  const horas = Array.isArray(actividad?.horasActivas) ? actividad.horasActivas.length : 0;
  return Math.min(100, Math.round((horas / 12) * 100));
}

function obtenerEstado(userId) {
  const premium = premiumManager.obtenerEstado(userId);
  return premium.premiumActivo ? "estable (premium)" : "estable";
}

function obtenerBitacora(userId) {
  const usuarioCore = datosUsuario.obtener(userId);
  const usuarioAuth = usuariosMemoria.obtenerUsuarioPorId(userId);
  const premium = premiumManager.obtenerEstado(userId);

  return {
    id: userId,
    userName: usuarioAuth?.displayName || usuarioCore?.identidad?.nombre || usuarioCore?.identidad?.apodo || "Usuario",
    email: usuarioAuth?.email || usuarioCore?.cuentas?.email || null,
    fotoPerfil: usuarioAuth?.photoUrl || null,
    leyenda: usuarioAuth?.leyenda || usuarioCore?.resumen || "",
    enlacePsicologico: calcularEnlacePsicologico(userId),
    estado: obtenerEstado(userId),
    premium,
    widgetSeleccionado: usuarioCore?.configuracion?.widgetSeleccionado || null
  };
}

function actualizarBitacora(userId, payload = {}) {
  const usuarioAuth = usuariosMemoria.obtenerUsuarioPorId(userId);
  const updates = {};

  if (typeof payload.userName === "string" && payload.userName.trim()) {
    updates.displayName = payload.userName.trim();
  }

  if (typeof payload.fotoPerfil === "string") {
    updates.photoUrl = payload.fotoPerfil.trim() || null;
  }

  if (typeof payload.leyenda === "string") {
    updates.leyenda = payload.leyenda.trim();
  }

  if (usuarioAuth && Object.keys(updates).length > 0) {
    usuariosMemoria.guardarUsuario(usuarioAuth.email, {
      ...usuarioAuth,
      ...updates
    });
  }

  datosUsuario.actualizar(userId, {
    identidad: {
      nombre: updates.displayName,
      apodo: updates.displayName
    },
    resumen: updates.leyenda,
    configuracion: {
      widgetSeleccionado: typeof payload.widgetSeleccionado === "string" ? payload.widgetSeleccionado : undefined
    }
  });

  return obtenerBitacora(userId);
}

export default {
  obtenerBitacora,
  actualizarBitacora
};
