// memoria/usuarioMemoria.js

const usuariosMemoria = new Map();

function normalizarUsuarioId(usuarioId) {
  return String(usuarioId || "anonimo");
}

// =========================
// CREAR USUARIO
// =========================
export function registrarUsuario(usuarioId) {
  const id = normalizarUsuarioId(usuarioId);
  if (!usuariosMemoria.has(id)) {
    usuariosMemoria.set(id, {
      memoriaCorta: {},
      memoriaPersistente: {},
      recuerdosImportantes: {},
      historialConversacion: [],
      ultimaInteraccion: null,
      ultimoMicro: null,
      ultimoMicroReaccion: null,
      estadoEmocionalActual: "neutral",
      historialEmocional: [],
      preferenciasComunicacion: {
        longitudMensajes: "media",
        estilo: "neutral",
        usaPreguntas: false
      }
    });
  }
}

// =========================
// OBTENER USUARIO
// =========================
export function obtenerUsuario(usuarioId) {
  return usuariosMemoria.get(normalizarUsuarioId(usuarioId)) ?? null;
}

// =========================
// AGREGAR MENSAJE AL HISTORIAL
// =========================
export function agregarMensaje(usuarioId, mensaje) {
  const id = normalizarUsuarioId(usuarioId);
  registrarUsuario(id);

  usuariosMemoria.get(id).historialConversacion.push({
    mensaje,
    timestamp: Date.now()
  });

  // limitar historial (evita crecimiento infinito)
  if (usuariosMemoria.get(id).historialConversacion.length > 50) {
    usuariosMemoria.get(id).historialConversacion.shift();
  }

  usuariosMemoria.get(id).ultimaInteraccion = Date.now();
}

// =========================
// LISTAR USUARIOS
// =========================
export function listarUsuarios() {
  return Array.from(usuariosMemoria.keys());
}

// =========================
// LIMPIAR USUARIO
// =========================
export function limpiarUsuario(usuarioId) {
  const id = normalizarUsuarioId(usuarioId);
  const usuario = usuariosMemoria.get(id);
  if (usuario) {
    usuario.memoriaCorta = {};
    usuario.memoriaPersistente = {};
    usuario.recuerdosImportantes = {};
    usuario.historialConversacion = [];
    usuario.ultimaInteraccion = null;
    usuario.ultimoMicro = null;
    usuario.ultimoMicroReaccion = null;
    usuario.estadoEmocionalActual = "neutral";
    usuario.historialEmocional = [];
  }
}

export function guardarUltimoMicro(usuarioId, valor) {
  const id = normalizarUsuarioId(usuarioId);
  registrarUsuario(id);
  usuariosMemoria.get(id).ultimoMicro = valor;
  return valor;
}

export function obtenerUltimoMicro(usuarioId) {
  const id = normalizarUsuarioId(usuarioId);
  registrarUsuario(id);
  return usuariosMemoria.get(id).ultimoMicro ?? null;
}

export function guardarUltimoMicroReaccion(usuarioId, valor) {
  const id = normalizarUsuarioId(usuarioId);
  registrarUsuario(id);
  usuariosMemoria.get(id).ultimoMicroReaccion = valor;
  return valor;
}

export function obtenerUltimoMicroReaccion(usuarioId) {
  const id = normalizarUsuarioId(usuarioId);
  registrarUsuario(id);
  return usuariosMemoria.get(id).ultimoMicroReaccion ?? null;
}

export function actualizarEstadoEmocional(usuarioId, estado) {
  const id = normalizarUsuarioId(usuarioId);
  registrarUsuario(id);
  const usuario = usuariosMemoria.get(id);
  usuario.estadoEmocionalActual = estado || "neutral";
  usuario.historialEmocional.push({
    estado: usuario.estadoEmocionalActual,
    timestamp: Date.now()
  });
  usuario.historialEmocional =
    usuario.historialEmocional.slice(-20);
  return usuario.estadoEmocionalActual;
}

export function actualizarPreferenciasComunicacion(
  usuarioId,
  preferencias = {}
) {
  const id = normalizarUsuarioId(usuarioId);
  registrarUsuario(id);
  const usuario = usuariosMemoria.get(id);
  usuario.preferenciasComunicacion = {
    ...usuario.preferenciasComunicacion,
    ...preferencias
  };
  return usuario.preferenciasComunicacion;
}
