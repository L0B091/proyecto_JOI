// googleAuth.js
// Módulo de autenticación con Google (simulado) y verificación de edad mínima
// Mejorado: modular, manejo de errores, preparado para integración real OAuth

import login from "./login.js";           // Sistema base de login y tokens
import usuariosMemoria from "../memoria/usuariosMemoria.js"; // Persistencia de usuarios

// Edad mínima permitida
const EDAD_MINIMA = 15;

// =============================
// FUNCIONES AUXILIARES
// =============================

// Calcular edad a partir de fecha de nacimiento (YYYY-MM-DD)
function calcularEdad(fechaNacimiento) {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    const dia = hoy.getDate() - nacimiento.getDate();
    if (mes < 0 || (mes === 0 && dia < 0)) edad--;
    return edad;
}

// Crear perfil de usuario según edad y restricciones
function crearPerfilGoogle(googleUser, edad) {
    const perfil = {
        nombre: googleUser.nombre,
        email: googleUser.email,
        edad,
        modoAdulto: edad >= EDAD_MINIMA,
        accesoLimitado: edad >= 15 && edad < EDAD_MINIMA ? true : false
    };
    return perfil;
}

// =============================
// AUTENTICACIÓN SIMULADA
// =============================

async function autenticarConGoogle(googleUser) {
    try {
        if (!googleUser || !googleUser.email || !googleUser.fechaNacimiento || !googleUser.nombre) {
            return { error: "Datos de Google incompletos", codigo: 400 };
        }

        const edad = calcularEdad(googleUser.fechaNacimiento);
        const perfil = crearPerfilGoogle(googleUser, edad);

        // Registrar o logear usuario en sistema base
        let token;
        try {
            token = login.loginUsuario(googleUser.email, "google-simulado").token;
            // Actualizar perfil en memoria persistente
            usuariosMemoria.guardarUsuario(googleUser.email, perfil);
        } catch {
            token = login.registrarUsuario(googleUser.email, "google-simulado", perfil).token;
            usuariosMemoria.guardarUsuario(googleUser.email, perfil);
        }

        return { token, perfil };

    } catch (err) {
        console.error("Error en googleAuth:", err);
        return { error: "Error interno de autenticación Google", codigo: 500 };
    }
}

// =============================
// VALIDACIÓN DE TOKEN
// =============================

function validarToken(token) {
    return login.validarToken(token);
}

// =============================
// SESIONES ACTIVAS
// =============================

function sesionesActivas() {
    return login.sesionesActivas();
}

// =============================
// EXPORT DEFAULT
// =============================

export default {
    autenticarConGoogle,
    validarToken,
    sesionesActivas
};