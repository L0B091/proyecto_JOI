import gestorDeAlarmas from "../modulos/gestorDeAlarmas.js";
import protocoloDespertador from "../modulos/protocoloDespertador.js";

/**
* ORQUESTADOR DE NOTIFICACIONES JOI
* Ejecuta alarmas automáticamente cuando corresponde
* Sistema multiusuario centralizado
*/

function obtenerHoraActual() {
  const now = new Date();

  const horas = String(now.getHours()).padStart(2, "0");
  const minutos = String(now.getMinutes()).padStart(2, "0");

  return `${horas}:${minutos}`;
}

/**
* Revisión principal de alarmas
*/
async function tick() {
  const alarmas = gestorDeAlarmas.obtenerAlarmasActivas();

  if (!alarmas || alarmas.length === 0) return;

  const horaActual = obtenerHoraActual();

  const alarmasParaEjecutar = alarmas.filter(
    (alarma) =>
      alarma.estado === "ACTIVE" &&
      alarma.hora === horaActual
  );

  if (alarmasParaEjecutar.length === 0) return;

  for (const alarma of alarmasParaEjecutar) {
    try {
      console.log(` Alarma activada para usuario: ${alarma.userID}`);

      const resultado = await protocoloDespertador.ejecutarAlarma(
        alarma.userID,
        false // respuestaUsuario se maneja desde cliente en versión real
      );

      // ✔ Usuario respondió
      if (resultado?.estado === "respondio") {
        gestorDeAlarmas.cerrarAlarma(alarma.userID);
        continue;
      }

      //  Llegó a alarma sonora final
      if (resultado?.estado === "alarmaSonora") {
        console.log(` Alarma sonora activa: ${alarma.userID}`);
      }

    } catch (error) {
      console.error(` Error en alarma de ${alarma.userID}`, error);
    }
  }
}

/**
* LOOP DEL ORQUESTADOR
* Ejecuta revisión cada 60 segundos
*/
setInterval(tick, 60000);

export default {
  tick
}; 
