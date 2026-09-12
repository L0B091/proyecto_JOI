const HORA = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export function minutos(hora) {
  if (typeof hora !== "string" || !HORA.test(hora)) throw new TypeError("Horario invalido");
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

export function instanteLocal(timestamp, zonaHoraria) {
  const partes = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
    timeZone: zonaHoraria, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23"
  }).formatToParts(timestamp).map(item => [item.type, item.value]));
  const fecha = `${partes.year}-${partes.month}-${partes.day}`;
  return { fecha, dia: new Date(`${fecha}T12:00:00Z`).getUTCDay(), minuto: Number(partes.hour) * 60 + Number(partes.minute) };
}

export function validarConfiguracion(configurado) {
  if (!configurado || typeof configurado !== "object" || Array.isArray(configurado)) {
    throw new TypeError("Configuracion de descanso invalida");
  }
  const validar = horario => {
    if (minutos(horario.dormir) === minutos(horario.despertar)) throw new TypeError("Descanso sin duracion");
  };
  validar(configurado);
  if (configurado.dias !== undefined) {
    if (!configurado.dias || typeof configurado.dias !== "object" || Array.isArray(configurado.dias)) {
      throw new TypeError("Dias de descanso invalidos");
    }
    for (const [dia, horario] of Object.entries(configurado.dias)) {
      if (!/^[0-6]$/.test(dia)) throw new TypeError("Dia de descanso invalido");
      validar(horario);
    }
  }
}

function enDescanso(minuto, horario) {
  const inicio = minutos(horario.dormir);
  const fin = minutos(horario.despertar);
  return inicio < fin ? minuto >= inicio && minuto < fin : minuto >= inicio || minuto < fin;
}

function horarioAprendido(observaciones, zona, politica) {
  const porDia = new Map();
  for (const ts of observaciones) {
    const local = instanteLocal(ts, zona);
    if (!porDia.has(local.fecha)) porDia.set(local.fecha, new Set());
    porDia.get(local.fecha).add(Math.floor(local.minuto / 60));
  }
  // Sparse observations cannot distinguish sleep from absence.
  const dias = [...porDia.values()].filter(horas => horas.size >= politica.minHorasObservadasPorDia);
  if (dias.length < politica.minDiasAprendizaje) return null;
  const conteos = Array.from({ length: 24 }, (_, hora) => dias.filter(d => d.has(hora)).length);
  const ventanas = Array.from({ length: 24 }, (_, inicio) => ({
    inicio,
    actividad: Array.from({ length: politica.horasDescansoAprendido }, (_, n) => conteos[(inicio + n) % 24])
      .reduce((a, b) => a + b, 0)
  })).sort((a, b) => a.actividad - b.actividad);
  const mejor = ventanas[0];
  const antes = conteos[(mejor.inicio + 23) % 24];
  const despues = conteos[(mejor.inicio + politica.horasDescansoAprendido) % 24];
  if (mejor.actividad > dias.length * 0.2 ||
      antes < dias.length * 0.5 || despues < dias.length * 0.5) return null;
  const hora = h => `${String(h % 24).padStart(2, "0")}:00`;
  return { dormir: hora(mejor.inicio), despertar: hora(mejor.inicio + politica.horasDescansoAprendido) };
}

export function evaluarPerfilRitmo(perfil, ahora, politica) {
  const zona = perfil.zonaHoraria || "UTC";
  const local = instanteLocal(ahora, zona);
  const observaciones = [...new Set(perfil.observaciones || [])]
    .filter(ts => ts <= ahora && ts >= ahora - politica.ventanaAprendizajeMs).sort((a, b) => a - b);
  const aprendido = horarioAprendido(observaciones, zona, politica);
  const configurado = perfil.configurado;
  if (configurado) validarConfiguracion(configurado);
  const origen = configurado ? "configurado" : aprendido ? "aprendido" : "provisional";
  const horario = configurado || aprendido || politica.descansoProvisional;
  let dormido;
  if (configurado?.dias) {
    const hoy = configurado.dias[local.dia] || configurado;
    const ayer = configurado.dias[(local.dia + 6) % 7] || configurado;
    // Day-specific schedules describe the night that STARTS on that day.
    dormido = (minutos(hoy.dormir) < minutos(hoy.despertar)
      ? enDescanso(local.minuto, hoy) : local.minuto >= minutos(hoy.dormir)) ||
      (minutos(ayer.dormir) > minutos(ayer.despertar) && local.minuto < minutos(ayer.despertar));
  } else {
    dormido = enDescanso(local.minuto, horario);
  }
  const actividad = observaciones.map(ts => instanteLocal(ts, zona).minuto);
  return {
    zonaHoraria: zona, origen, horario, configurado, observaciones,
    ultimaInteraccion: perfil.ultimaInteraccion || 0,
    dormido, evaluadoEn: ahora,
    periodosActividad: [...new Set(actividad.map(m => Math.floor(m / 60)))].sort((a, b) => a - b),
    periodosSilencio: [{ desde: horario.dormir, hasta: horario.despertar, estimado: origen !== "configurado" }]
  };
}
