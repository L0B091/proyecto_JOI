// backend/apis/calendario.js
// Módulo de calendario de Joi: eventos, recordatorios y notificaciones push
// Todo se guarda localmente en memoria del usuario

import memoria from '../memoria/usuariosMemoria.js'; // manejo de datos internos de cada usuario

/**
* Agrega un evento al calendario de Joi
* @param {string} usuarioID
* @param {object} evento - { tipo, fecha, hora, descripcion }
* @returns {object} - confirmación
*/
function agregarEvento(usuarioID, evento) {
  if (!usuarioID || !evento || !evento.fecha) {
    return { exito: false, mensaje: 'Faltan datos del evento' };
  }

  const calendario = memoria.obtenerCalendario(usuarioID) || [];
  calendario.push(evento);
  memoria.guardarCalendario(usuarioID, calendario);

  // Preparar notificación push anticipada
  if (evento.tipo && evento.fecha) {
    programarNotificacion(usuarioID, evento);
  }

  return { exito: true, mensaje: 'Evento agregado correctamente', evento };
}

/**
* Elimina un evento
* @param {string} usuarioID
* @param {string} descripcion
* @returns {object}
*/
function eliminarEvento(usuarioID, descripcion) {
  let calendario = memoria.obtenerCalendario(usuarioID) || [];
  const inicial = calendario.length;
  calendario = calendario.filter(ev => ev.descripcion !== descripcion);
  memoria.guardarCalendario(usuarioID, calendario);

  return {
    exito: calendario.length < inicial,
    mensaje: calendario.length < inicial ? 'Evento eliminado' : 'No se encontró el evento'
  };
}

/**
* Obtiene eventos próximos de un usuario
* @param {string} usuarioID
* @returns {array} - lista de eventos
*/
function obtenerEventosProximos(usuarioID) {
  const calendario = memoria.obtenerCalendario(usuarioID) || [];
  const ahora = new Date();
  return calendario.filter(ev => new Date(ev.fecha) >= ahora);
}

/**
* Programa notificación push interna de Joi
* @param {string} usuarioID
* @param {object} evento
*/
function programarNotificacion(usuarioID, evento) {
  const fechaEvento = new Date(`${evento.fecha}T${evento.hora || '08:00'}`);
  const ahora = new Date();

  // notificación 1 día antes
  const unDiaAntes = new Date(fechaEvento);
  unDiaAntes.setDate(unDiaAntes.getDate() - 1);

  if (unDiaAntes > ahora) {
    // Simulación: almacenar notificación pendiente
    memoria.guardarNotificacion(usuarioID, {
      fecha: unDiaAntes,
      mensaje: `Recordatorio: mañana tienes ${evento.tipo} - ${evento.descripcion}`,
      tipo: 'recordatorio'
    });
  }

  // Notificación el mismo día
  if (fechaEvento > ahora) {
    memoria.guardarNotificacion(usuarioID, {
      fecha: fechaEvento,
      mensaje: `Hoy tienes ${evento.tipo}: ${evento.descripcion}`,
      tipo: 'evento'
    });
  }
}

/**
* Marca un evento como notificado (después de enviar push)
* @param {string} usuarioID
* @param {string} descripcion
*/
function marcarNotificado(usuarioID, descripcion) {
  const notificaciones = memoria.obtenerNotificaciones(usuarioID) || [];
  const filtradas = notificaciones.filter(n => n.mensaje.includes(descripcion) === false);
  memoria.guardarNotificaciones(usuarioID, filtradas);
}

/**
* Función principal para interactuar con el calendario de Joi
* @param {string} usuarioID
* @param {object} input - { accion, datos }
*/
function calendarioJoi(usuarioID, input) {
  if (!input || !input.accion) return { exito: false, mensaje: 'Acción no definida' };

  switch (input.accion) {
    case 'agregar':
      return agregarEvento(usuarioID, input.datos);
    case 'eliminar':
      return eliminarEvento(usuarioID, input.datos.descripcion);
    case 'obtener':
      return obtenerEventosProximos(usuarioID);
    default:
      return { exito: false, mensaje: 'Acción desconocida' };
  }
}

// Exportación ESM
export default calendarioJoi; 
