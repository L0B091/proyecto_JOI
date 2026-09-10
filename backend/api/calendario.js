import storage from "../utils/jsonStorage.js";
import notificaciones from "./notificaciones.js";

const NAMESPACE = "calendario";

function listarEventos(usuarioID) {
  return storage.readUserData(NAMESPACE, usuarioID, []);
}

function guardarEventos(usuarioID, eventos) {
  storage.writeUserData(NAMESPACE, usuarioID, eventos);
  return eventos;
}

function agregarEvento(usuarioID, evento) {
  if (!usuarioID || !evento?.fecha) {
    return { exito: false, mensaje: "Faltan datos del evento" };
  }

  const eventos = listarEventos(usuarioID);
  const nuevoEvento = {
    id: String(evento.id || `${usuarioID}_${Date.now()}`),
    tipo: String(evento.tipo || "evento"),
    fecha: String(evento.fecha),
    hora: String(evento.hora || "08:00"),
    descripcion: String(evento.descripcion || "Sin descripción"),
    createdAt: new Date().toISOString()
  };

  eventos.push(nuevoEvento);
  guardarEventos(usuarioID, eventos);

  const fechaEvento = new Date(`${nuevoEvento.fecha}T${nuevoEvento.hora}`);
  if (!Number.isNaN(fechaEvento.getTime())) {
    notificaciones.notificarRecordatorio(usuarioID, nuevoEvento.descripcion, fechaEvento.toISOString());
  }

  return { exito: true, mensaje: "Evento agregado correctamente", evento: nuevoEvento };
}

function eliminarEvento(usuarioID, eventoId) {
  const eventos = listarEventos(usuarioID);
  const filtrados = eventos.filter(item => item.id !== eventoId && item.descripcion !== eventoId);
  guardarEventos(usuarioID, filtrados);
  return {
    exito: filtrados.length !== eventos.length,
    mensaje: filtrados.length !== eventos.length ? "Evento eliminado" : "No se encontró el evento"
  };
}

function obtenerEventosProximos(usuarioID) {
  const ahora = Date.now();
  return listarEventos(usuarioID).filter(evento => {
    const fecha = new Date(`${evento.fecha}T${evento.hora || "00:00"}`).getTime();
    return Number.isFinite(fecha) && fecha >= ahora;
  });
}

function calendarioJoi(usuarioID, input) {
  if (!input?.accion) return { exito: false, mensaje: "Acción no definida" };
  if (input.accion === "agregar") return agregarEvento(usuarioID, input.datos);
  if (input.accion === "eliminar") return eliminarEvento(usuarioID, input.datos?.id || input.datos?.descripcion);
  if (input.accion === "obtener") return obtenerEventosProximos(usuarioID);
  return { exito: false, mensaje: "Acción desconocida" };
}

export default {
  listarEventos,
  agregarEvento,
  eliminarEvento,
  obtenerEventosProximos,
  calendarioJoi
};
