import storage from "../../utils/jsonStorage.js";

const NAMESPACE = "premium";
const PREMIUM_DIAS = 30;
const PRECIO_MENSUAL_ARS = Number(process.env.PREMIUM_PRICE_ARS || 3000);

const PLAN = {
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
  storage.writeUserData(NAMESPACE, userId, data);
  return data;
}

function obtenerEstado(userId) {
  const registro = obtenerRegistro(userId);
  const premiumHasta = registro.premiumHasta ? new Date(registro.premiumHasta).getTime() : 0;
  const premiumActivo = premiumHasta > Date.now();
  return {
    userId,
    premiumActivo,
    premiumHasta: registro.premiumHasta,
    plan: premiumActivo ? "premium" : "free",
    funciones: premiumActivo ? PLAN.premium : PLAN.free,
    historial: registro.historial || []
  };
}

function explicarPlan(feature = "M/A") {
  return {
    feature,
    precioARS: PRECIO_MENSUAL_ARS,
    duracionDias: PREMIUM_DIAS,
    renovacionAutomatica: false,
    mensaje: `Para usar ${feature}, JOI habilita Premium por ${PREMIUM_DIAS} días y genera un link de cobro por Mercado Pago. No se renueva automáticamente.`,
    free: PLAN.free,
    premium: PLAN.premium
  };
}

function generarLinkPago(userId, feature = "M/A") {
  const paymentId = `mp_${storage.sanitizeId(userId)}_${Date.now()}`;
  const baseUrl = process.env.MERCADO_PAGO_CHECKOUT_URL || "https://www.mercadopago.com.ar/";
  const url = new URL(baseUrl);
  url.searchParams.set("reference", paymentId);
  url.searchParams.set("userId", userId);
  url.searchParams.set("feature", feature);
  url.searchParams.set("amount", String(PRECIO_MENSUAL_ARS));

  const registro = obtenerRegistro(userId);
  registro.historial = [
    ...(registro.historial || []),
    {
      tipo: "checkout_generado",
      paymentId,
      feature,
      createdAt: new Date().toISOString(),
      amountARS: PRECIO_MENSUAL_ARS
    }
  ].slice(-20);
  guardarRegistro(userId, registro);

  return {
    paymentId,
    url: url.toString(),
    amountARS: PRECIO_MENSUAL_ARS,
    feature,
    modo: process.env.MERCADO_PAGO_ACCESS_TOKEN ? "configured" : "simulado"
  };
}

function verificarPago(userId, paymentId, status = "approved") {
  const aprobado = String(status).toLowerCase() === "approved";
  if (!aprobado) {
    return {
      ok: false,
      premiumActivo: false,
      paymentId,
      status
    };
  }

  const registro = obtenerRegistro(userId);
  const premiumHasta = new Date(Date.now() + PREMIUM_DIAS * 24 * 60 * 60 * 1000).toISOString();
  registro.premiumHasta = premiumHasta;
  registro.historial = [
    ...(registro.historial || []),
    {
      tipo: "pago_aprobado",
      paymentId,
      status,
      premiumHasta,
      createdAt: new Date().toISOString()
    }
  ].slice(-20);
  guardarRegistro(userId, registro);

  return {
    ok: true,
    premiumActivo: true,
    premiumHasta,
    paymentId,
    status
  };
}

export default {
  PLAN,
  explicarPlan,
  obtenerEstado,
  generarLinkPago,
  verificarPago
};
