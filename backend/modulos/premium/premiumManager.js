import storage from "../../utils/jsonStorage.js";
import datosUsuario from "../../memoria/datosUsuario.js";
import usuariosMemoria from "../../memoria/usuariosMemoria.js";

const NAMESPACE = "premium";
const PREMIUM_DIAS = 30;

function obtenerPrecioPremium() {
  return Number(process.env.PREMIUM_PRICE_ARS || 3000);
}

export const PLAN = {
  free: [
    "Conversación con IA",
    "APIs",
    "Memoria básica",
    "Personalidad y expresión",
    "Respuestas visuales / video"
  ],
  premium: [
    "Todo lo incluido en Free",
    "Modo Desarrollador",
    "Memoria y almacenamiento de código",
    "Gestión de proyectos y archivos",
    "Gestor Fiscal",
    "Almacenamiento de comprobantes",
    "Copia de respaldo de la memoria completa del orquestador",
    "Recuperación del agente en otro teléfono",
    "Modo Adulto"
  ]
};

function obtenerRegistro(userId) {
  return storage.readUserData(NAMESPACE, userId, {
    userId,
    premiumHasta: null,
    historial: []
  });
}

function guardarRegistro(userId, data) {
  storage.writeUserData(NAMESPACE, userId, {
    userId,
    premiumHasta: data.premiumHasta || null,
    historial: Array.isArray(data.historial) ? data.historial.slice(-50) : []
  });
}

function sincronizarPlanUsuario(userId, premiumHasta = null) {
  const plan = premiumHasta && new Date(premiumHasta).getTime() > Date.now() ? "premium" : "free";
  datosUsuario.actualizar(userId, {
    configuracion: {
      plan
    }
  });

  const authUser = usuariosMemoria.obtenerUsuarioPorId(userId);
  if (authUser) {
    usuariosMemoria.guardarUsuario(authUser.email, {
      ...authUser,
      premiumUntil: premiumHasta
    });
  }
}

function obtenerEstado(userId) {
  const registro = obtenerRegistro(userId);
  const premiumHastaMs = registro.premiumHasta ? new Date(registro.premiumHasta).getTime() : 0;
  const premiumActivo = premiumHastaMs > Date.now();

  if (!premiumActivo && registro.premiumHasta) {
    sincronizarPlanUsuario(userId, null);
  }

  return {
    userId,
    premiumActivo,
    premiumHasta: premiumActivo ? registro.premiumHasta : null,
    plan: premiumActivo ? "premium" : "free",
    funciones: premiumActivo ? PLAN.premium : PLAN.free,
    historial: Array.isArray(registro.historial) ? registro.historial : []
  };
}

function explicarPlan(feature = "M/A") {
  return {
    feature,
    precioARS: obtenerPrecioPremium(),
    duracionDias: PREMIUM_DIAS,
    renovacionAutomatica: false,
    mensaje: `Para usar ${feature}, JOI habilita Premium por ${PREMIUM_DIAS} días mediante Mercado Pago. No se renueva automáticamente.`,
    free: PLAN.free,
    premium: PLAN.premium
  };
}

function registrarCheckout(userId, checkout = {}) {
  const registro = obtenerRegistro(userId);
  registro.historial = [
    ...(registro.historial || []),
    {
      tipo: "checkout_generado",
      preferenceId: checkout.preferenceId || null,
      feature: checkout.feature || "M/A",
      amountARS: checkout.amountARS || obtenerPrecioPremium(),
      initPoint: checkout.initPoint || null,
      createdAt: new Date().toISOString()
    }
  ].slice(-50);
  guardarRegistro(userId, registro);
  return registro;
}

function activarPremium(userId, paymentId, detail = {}) {
  const premiumHasta = new Date(Date.now() + PREMIUM_DIAS * 24 * 60 * 60 * 1000).toISOString();
  const registro = obtenerRegistro(userId);
  registro.premiumHasta = premiumHasta;
  registro.historial = [
    ...(registro.historial || []),
    {
      tipo: "pago_aprobado",
      paymentId,
      preferenceId: detail.preferenceId || null,
      feature: detail.feature || "M/A",
      status: detail.status || "approved",
      premiumHasta,
      createdAt: new Date().toISOString()
    }
  ].slice(-50);
  guardarRegistro(userId, registro);
  sincronizarPlanUsuario(userId, premiumHasta);
  return {
    ok: true,
    premiumActivo: true,
    premiumHasta,
    paymentId,
    status: detail.status || "approved",
    feature: detail.feature || "M/A"
  };
}

export default {
  PLAN,
  explicarPlan,
  obtenerEstado,
  registrarCheckout,
  activarPremium,
  sincronizarPlanUsuario,
  obtenerPrecioPremium
};
