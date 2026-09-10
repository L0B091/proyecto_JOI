const OPENWEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";

function fallbackClima(lat, lon) {
  return {
    temperatura: 21,
    descripcion: "clima estable",
    mensajeCorto: `No tengo acceso al clima en tiempo real, pero mantengo una referencia suave para ${lat}, ${lon}.`
  };
}

function generarMensajeCorto(temp, desc) {
  let mensaje = "Que tengas un buen día.";
  if (temp !== null) {
    if (temp <= 10) mensaje += " Lleva abrigo, hoy hace frío.";
    else if (temp >= 25) mensaje += " Hace calor, hidratate.";
    else mensaje += " El clima está agradable hoy.";
  }
  if (desc) mensaje += ` (${desc})`;
  return mensaje;
}

async function obtenerClima(lat = -34.6037, lon = -58.3816) {
  const apiKey = process.env.OPENWEATHER_API_KEY || "";

  if (!apiKey) {
    return fallbackClima(lat, lon);
  }

  try {
    const url = new URL(OPENWEATHER_URL);
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lon));
    url.searchParams.set("appid", apiKey);
    url.searchParams.set("units", "metric");
    url.searchParams.set("lang", "es");

    const respuesta = await fetch(url);
    if (!respuesta.ok) {
      throw new Error(`Error al obtener clima: ${respuesta.status}`);
    }

    const data = await respuesta.json();
    const temperatura = data?.main?.temp ?? null;
    const descripcion = data?.weather?.[0]?.description ?? null;
    return {
      temperatura,
      descripcion,
      mensajeCorto: generarMensajeCorto(temperatura, descripcion)
    };
  } catch (error) {
    console.error("Error en clima.js:", error.message);
    return fallbackClima(lat, lon);
  }
}

export default obtenerClima;
