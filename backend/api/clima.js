import HttpError from "../utils/httpError.js";

const OPENWEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";

function generarMensajeCorto(temp, desc) {
  let mensaje = "Que tengas un buen día.";
  if (temp <= 10) mensaje += " Lleva abrigo, hoy hace frío.";
  else if (temp >= 25) mensaje += " Hace calor, hidratate.";
  else mensaje += " El clima está agradable hoy.";
  if (desc) mensaje += ` (${desc})`;
  return mensaje;
}

export default async function obtenerClima(lat = -34.6037, lon = -58.3816) {
  const apiKey = String(process.env.OPENWEATHER_API_KEY || "").trim();
  if (!apiKey) {
    throw new HttpError(503, "OPENWEATHER_API_KEY no está configurado");
  }

  const url = new URL(OPENWEATHER_URL);
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("appid", apiKey);
  url.searchParams.set("units", "metric");
  url.searchParams.set("lang", "es");

  const respuesta = await fetch(url);
  const raw = await respuesta.text();
  const data = raw ? JSON.parse(raw) : null;

  if (!respuesta.ok) {
    throw new HttpError(respuesta.status, data?.message || "No se pudo obtener el clima", data);
  }

  const temperatura = Number.isFinite(data?.main?.temp) ? data.main.temp : null;
  const descripcion = data?.weather?.[0]?.description ?? null;

  if (temperatura === null) {
    throw new HttpError(502, "OpenWeather no devolvió temperatura válida", data);
  }

  return {
    temperatura,
    descripcion,
    mensajeCorto: generarMensajeCorto(temperatura, descripcion),
    ciudad: data?.name || null,
    pais: data?.sys?.country || null
  };
}
