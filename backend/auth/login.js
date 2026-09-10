import crypto from "crypto";
import usuariosMemoria from "../memoria/usuariosMemoria.js";

const DURACION_TOKEN = 1000 * 60 * 60 * 24 * 7;
const sesiones = new Map();

function generarToken() {
  return crypto.randomBytes(48).toString("hex");
}

function crearHash(password, salt = crypto.randomBytes(16).toString("hex")) {
  const passwordHash = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return { passwordHash, passwordSalt: salt };
}

function emitirSesion(usuario) {
  const token = generarToken();
  const creado = Date.now();
  const expira = creado + DURACION_TOKEN;

  sesiones.set(token, {
    token,
    userId: usuario.id,
    email: usuario.email,
    creado,
    expira
  });

  return {
    token,
    expiraEn: expira,
    perfil: {
      userId: usuario.id,
      email: usuario.email,
      displayName: usuario.displayName,
      photoUrl: usuario.photoUrl
    }
  };
}

function registrarUsuario(email, password, perfil = {}, tipoLogin = "local") {
  const normalizedEmail = usuariosMemoria.normalizeEmail(email);
  if (!normalizedEmail) {
    return { ok: false, error: "Email requerido" };
  }

  if (!password) {
    return { ok: false, error: "Contraseña requerida" };
  }

  if (usuariosMemoria.obtenerUsuario(normalizedEmail)) {
    return { ok: false, error: "Usuario ya registrado" };
  }

  const { passwordHash, passwordSalt } = crearHash(password);
  const usuario = usuariosMemoria.guardarUsuario(normalizedEmail, {
    email: normalizedEmail,
    passwordHash,
    passwordSalt,
    tipoLogin,
    displayName: perfil.displayName || perfil.nombre || normalizedEmail
  });

  const sesion = emitirSesion(usuario);
  return { ok: true, ...sesion };
}

function loginUsuario(email, password) {
  const normalizedEmail = usuariosMemoria.normalizeEmail(email);
  const usuario = usuariosMemoria.obtenerUsuario(normalizedEmail);

  if (!usuario) {
    return { ok: false, error: "Usuario no encontrado" };
  }

  if (!usuario.passwordHash || !usuario.passwordSalt) {
    return { ok: false, error: "Este usuario debe autenticarse con Google" };
  }

  const { passwordHash } = crearHash(password, usuario.passwordSalt);
  if (passwordHash !== usuario.passwordHash) {
    return { ok: false, error: "Contraseña incorrecta" };
  }

  usuariosMemoria.actualizarUltimoLogin(normalizedEmail);
  return { ok: true, ...emitirSesion(usuario) };
}

function iniciarSesionParaUsuario(email) {
  const usuario = usuariosMemoria.obtenerUsuario(email);
  if (!usuario) {
    return { ok: false, error: "Usuario no encontrado" };
  }

  usuariosMemoria.actualizarUltimoLogin(usuario.email);
  return { ok: true, ...emitirSesion(usuario) };
}

function validarToken(token) {
  const sesion = sesiones.get(String(token || ""));
  if (!sesion) return null;

  if (Date.now() > sesion.expira) {
    sesiones.delete(String(token));
    return null;
  }

  const usuario = usuariosMemoria.obtenerUsuario(sesion.email);
  if (!usuario) return null;

  return {
    userId: usuario.id,
    email: usuario.email,
    perfil: {
      displayName: usuario.displayName,
      photoUrl: usuario.photoUrl,
      leyenda: usuario.leyenda,
      premiumUntil: usuario.premiumUntil
    },
    token: sesion.token,
    expira: sesion.expira
  };
}

function sesionesActivas() {
  const ahora = Date.now();
  return Array.from(sesiones.values())
    .filter(sesion => sesion.expira > ahora)
    .map(sesion => ({
      userId: sesion.userId,
      email: sesion.email,
      expira: new Date(sesion.expira).toISOString()
    }));
}

function cerrarSesion(token) {
  const existed = sesiones.delete(String(token || ""));
  return existed ? { ok: true, mensaje: "Sesión cerrada" } : { ok: false, error: "Token inválido" };
}

export default {
  registrarUsuario,
  loginUsuario,
  iniciarSesionParaUsuario,
  validarToken,
  sesionesActivas,
  cerrarSesion
};
