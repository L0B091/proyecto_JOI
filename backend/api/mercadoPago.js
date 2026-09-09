// backend/apis/mercadoPago.js
// Gestión de suscripción mensual de Joi con Mercado Pago
// Incluye prueba gratuita, recordatorio y retorno tras pago

import mercadopago from 'mercadopago';

// Configuración del SDK de Mercado Pago
// Reemplazar por tu Access Token real
mercadopago.configurations.setAccessToken('TU_ACCESS_TOKEN');

const PRECIO_MENSUAL = 3000; // ARS
const DURACION_PRUEBA_HORAS = 24;

// Memoria simple para prueba de 24h por usuario
let usuarioPrueba = {};

/**
* Inicia prueba gratuita para un usuario
* @param {string} usuarioID
*/
function iniciarPrueba(usuarioID) {
  const ahora = new Date();
  usuarioPrueba[usuarioID] = {
    inicio: ahora,
    activada: true,
    recordatorioEnviado: false
  };
  console.log(`Joi inicia prueba gratuita para ${usuarioID}. Acceso completo durante 24h.`);
  console.log(`Información de suscripción: $${PRECIO_MENSUAL} ARS / mes.`);
}

/**
* Verifica estado de prueba y envía recordatorio antes de finalizar
* @param {string} usuarioID
*/
function verificarPrueba(usuarioID) {
  const prueba = usuarioPrueba[usuarioID];
  if (!prueba || !prueba.activada) return;

  const ahora = new Date();
  const horasTranscurridas = (ahora - prueba.inicio) / (1000 * 60 * 60);

  // Recordatorio 2h antes de finalizar la prueba
  if (horasTranscurridas >= DURACION_PRUEBA_HORAS - 2 && !prueba.recordatorioEnviado) {
    console.log(`Joi: Tu prueba gratuita de 24h termina pronto. Para seguir conmigo, la suscripción mensual es de $${PRECIO_MENSUAL} ARS.`);
    prueba.recordatorioEnviado = true;
  }

  // Fin de la prueba
  if (horasTranscurridas >= DURACION_PRUEBA_HORAS) {
    console.log(`Joi se retira de su contenedor. Habilitando link único de pago para continuar la suscripción.`);
    prueba.activada = false;
  }
}

/**
* Genera link único de pago para el usuario
* @param {string} usuarioID
* @returns {Promise<string>} link de pago
*/
async function generarLinkPago(usuarioID) {
  const preference = {
    items: [
      {
        title: "Suscripción Joi - 1 mes",
        quantity: 1,
        unit_price: PRECIO_MENSUAL
      }
    ],
    external_reference: usuarioID,
    back_urls: {
      success: "https://tusitio.com/success",
      failure: "https://tusitio.com/failure",
      pending: "https://tusitio.com/pending"
    },
    auto_return: "approved"
  };

  try {
    const respuesta = await mercadopago.preferences.create(preference);
    console.log(`Link de pago generado para ${usuarioID}: ${respuesta.body.init_point}`);
    return respuesta.body.init_point;
  } catch (error) {
    console.error("Error generando link de pago Mercado Pago:", error.message);
    return null;
  }
}

/**
* Verifica si el usuario pagó la suscripción y devuelve a Joi a la app
* @param {string} paymentId
* @returns {Promise<boolean>}
*/
async function verificarPago(paymentId) {
  try {
    const pago = await mercadopago.payment.findById(paymentId);
    const usuarioID = pago.body.external_reference;

    if (pago.body.status === "approved") {
      console.log(`Pago confirmado para ${usuarioID}. Joi vuelve a la habitación.`);
      // Reactivar prueba o acceso completo
      usuarioPrueba[usuarioID] = { inicio: new Date(), activada: true, recordatorioEnviado: false };
      return true;
    } else {
      console.log(`Pago pendiente o rechazado para ${usuarioID}.`);
      return false;
    }

  } catch (error) {
    console.error("Error verificando pago Mercado Pago:", error.message);
    return false;
  }
}

export default {
  iniciarPrueba,
  verificarPrueba,
  generarLinkPago,
  verificarPago
}; 
