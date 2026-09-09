// login.js
// Sistema central de autenticación y manejo de sesiones para Joi

import crypto from "crypto";
import usuariosMemoria from "../memoria/usuariosMemoria.js";

// =============================
// CONFIGURACIÓN
// =============================

const DURACION_TOKEN = 1000 * 60 * 60 * 24; // 24 horas

// =============================
// SESIONES ACTIVAS
// =============================

const sesiones = {};

// =============================
// GENERAR TOKEN SEGURO
// =============================

function generarToken() {
    return crypto.randomBytes(32).toString("hex");
}

// =============================
// HASH DE CONTRASEÑA
// =============================

function hashPassword(password) {
    return crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");
}

// =============================
// REGISTRAR USUARIO
// =============================

function registrarUsuario(email, password, perfil = {}, tipoLogin = "local") {

    if (!email) {
        return {
            ok: false,
            error: "Email requerido"
        };
    }

    const passwordHash = hashPassword(password);

    const usuario = {
        email,
        passwordHash,
        perfil,
        tipoLogin,
        creado: new Date().toISOString()
    };

    usuariosMemoria.guardarUsuario(email, usuario);

    const token = generarToken();

    sesiones[token] = {
        email,
        creado: Date.now(),
        expira: Date.now() + DURACION_TOKEN
    };

    return {
        ok: true,
        token,
        perfil
    };
}

// =============================
// LOGIN DE USUARIO
// =============================

function loginUsuario(email, password) {

    const usuario = usuariosMemoria.obtenerUsuario(email);

    if (!usuario) {
        return {
            ok: false,
            error: "Usuario no encontrado"
        };
    }

    const passwordHash = hashPassword(password);

    if (passwordHash !== usuario.passwordHash) {
        return {
            ok: false,
            error: "Contraseña incorrecta"
        };
    }

    const token = generarToken();

    sesiones[token] = {
        email,
        creado: Date.now(),
        expira: Date.now() + DURACION_TOKEN
    };

    return {
        ok: true,
        token,
        perfil: usuario.perfil
    };
}

// =============================
// VALIDAR TOKEN
// =============================

function validarToken(token) {

    const sesion = sesiones[token];

    if (!sesion) {
        return null;
    }

    if (Date.now() > sesion.expira) {
        delete sesiones[token];
        return null;
    }

    const usuario = usuariosMemoria.obtenerUsuario(sesion.email);

    if (!usuario) {
        return null;
    }

    return {
        email: sesion.email,
        perfil: usuario.perfil
    };
}

// =============================
// SESIONES ACTIVAS
// =============================

function sesionesActivas() {

    const lista = [];

    for (const token in sesiones) {

        const sesion = sesiones[token];

        if (Date.now() < sesion.expira) {
            lista.push({
                email: sesion.email,
                expira: new Date(sesion.expira).toISOString()
            });
        }

    }

    return lista;
}

// =============================
// CERRAR SESIÓN
// =============================

function cerrarSesion(token) {

    if (sesiones[token]) {

        delete sesiones[token];

        return {
            ok: true,
            mensaje: "Sesión cerrada"
        };

    }

    return {
        ok: false,
        error: "Token inválido"
    };

}

// =============================
// EXPORT DEFAULT
// =============================

export default {
    registrarUsuario,
    loginUsuario,
    validarToken,
    sesionesActivas,
    cerrarSesion
};