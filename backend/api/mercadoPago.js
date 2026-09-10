import premiumManager from "../modulos/premium/premiumManager.js";

function iniciarPrueba(usuarioID) {
  return {
    ok: true,
    usuarioID,
    mensaje: "Prueba gratuita iniciada. Luego podrás pasar a Premium manualmente.",
    duracionHoras: 24
  };
}

function verificarPrueba(usuarioID) {
  const estado = premiumManager.obtenerEstado(usuarioID);
  return {
    usuarioID,
    premiumActivo: estado.premiumActivo,
    premiumHasta: estado.premiumHasta
  };
}

function explicarPremium(feature = "M/A") {
  return premiumManager.explicarPlan(feature);
}

async function generarLinkPago(usuarioID, feature = "M/A") {
  return premiumManager.generarLinkPago(usuarioID, feature);
}

async function verificarPago(paymentId, usuarioID, status = "approved") {
  return premiumManager.verificarPago(usuarioID, paymentId, status);
}

export default {
  iniciarPrueba,
  verificarPrueba,
  explicarPremium,
  generarLinkPago,
  verificarPago
};
