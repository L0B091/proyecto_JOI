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

  usuariosMemoria[usuarioId].ultimaInteraccion = Date.now();
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
    usuariosMemoria[usuarioId].ultimaInteraccion = null;
    usuariosMemoria[usuarioId].ultimoMicro = null;
    usuariosMemoria[usuarioId].ultimoMicroReaccion = null;
    usuariosMemoria[usuarioId].estadoEmocionalActual = "neutral";
    usuariosMemoria[usuarioId].historialEmocional = [];
  }
}

export function guardarUltimoMicro(usuarioId, valor) {
  registrarUsuario(usuarioId);
  usuariosMemoria[usuarioId].ultimoMicro = valor;
  return valor;
}

export function obtenerUltimoMicro(usuarioId) {
  registrarUsuario(usuarioId);
  return usuariosMemoria[usuarioId].ultimoMicro ?? null;
}

export function guardarUltimoMicroReaccion(usuarioId, valor) {
  registrarUsuario(usuarioId);
  usuariosMemoria[usuarioId].ultimoMicroReaccion = valor;
  return valor;
}

export function obtenerUltimoMicroReaccion(usuarioId) {
  registrarUsuario(usuarioId);
  return usuariosMemoria[usuarioId].ultimoMicroReaccion ?? null;
}

export function actualizarEstadoEmocional(usuarioId, estado) {
  registrarUsuario(usuarioId);
  usuariosMemoria[usuarioId].estadoEmocionalActual = estado || "neutral";
  usuariosMemoria[usuarioId].historialEmocional.push({
    estado: usuariosMemoria[usuarioId].estadoEmocionalActual,
    timestamp: Date.now()
  });
  usuariosMemoria[usuarioId].historialEmocional =
    usuariosMemoria[usuarioId].historialEmocional.slice(-20);
  return usuariosMemoria[usuarioId].estadoEmocionalActual;
}

export function actualizarPreferenciasComunicacion(
  usuarioId,
  preferencias = {}
) {
  registrarUsuario(usuarioId);
  usuariosMemoria[usuarioId].preferenciasComunicacion = {
    ...usuariosMemoria[usuarioId].preferenciasComunicacion,
    ...preferencias
  };
  return usuariosMemoria[usuarioId].preferenciasComunicacion;
}
