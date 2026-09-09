// memoria/usuarioMemoria.js

const usuariosMemoria = {};

// =========================
// CREAR USUARIO
// =========================
export function registrarUsuario(usuarioId) {
  if (!usuariosMemoria[usuarioId]) {
    usuariosMemoria[usuarioId] = {
      memoriaCorta: {},
      memoriaPersistente: {},
      recuerdosImportantes: {},
      historialConversacion: []
    };
  }
}

// =========================
// OBTENER USUARIO
// =========================
export function obtenerUsuario(usuarioId) {
  return usuariosMemoria[usuarioId] ?? null;
}

// =========================
// AGREGAR MENSAJE AL HISTORIAL
// =========================
export function agregarMensaje(usuarioId, mensaje) {
  registrarUsuario(usuarioId);

  usuariosMemoria[usuarioId].historialConversacion.push({
    mensaje,
    timestamp: Date.now()
  });

  // limitar historial (evita crecimiento infinito)
  if (usuariosMemoria[usuarioId].historialConversacion.length > 50) {
    usuariosMemoria[usuarioId].historialConversacion.shift();
  }
}

// =========================
// LISTAR USUARIOS
// =========================
export function listarUsuarios() {
  return Object.keys(usuariosMemoria);
}

// =========================
// LIMPIAR USUARIO
// =========================
export function limpiarUsuario(usuarioId) {
  if (usuariosMemoria[usuarioId]) {
    usuariosMemoria[usuarioId].memoriaCorta = {};
    usuariosMemoria[usuarioId].memoriaPersistente = {};
    usuariosMemoria[usuarioId].recuerdosImportantes = {};
    usuariosMemoria[usuarioId].historialConversacion = [];
  }
} 
