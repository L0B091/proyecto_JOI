import HttpError from "../utils/httpError.js";

export async function obtenerNoticias(ciudad = "", categorias = [], opciones = {}) {
  const apiKey = String(process.env.NEWS_API_KEY || "").trim();
  if (!apiKey) {
    throw new HttpError(503, "NEWS_API_KEY no está configurado");
  }

  const url = new URL("https://newsapi.org/v2/top-headlines");
  url.searchParams.set("pageSize", "5");
  url.searchParams.set("language", "es");
  url.searchParams.set("country", "ar");
  url.searchParams.set("apiKey", apiKey);

  if (categorias.length > 0) {
    url.searchParams.set("q", categorias.join(" OR "));
  } else if (ciudad) {
    url.searchParams.set("q", ciudad);
  }

  const respuesta = await fetch(url, { signal: AbortSignal.timeout(opciones.timeoutMs || 8000) });
  const raw = await respuesta.text();
  const data = raw ? JSON.parse(raw) : null;

  if (!respuesta.ok || data?.status === "error") {
    throw new HttpError(respuesta.status || 502, data?.message || "No se pudieron obtener noticias", data);
  }

  const articulos = Array.isArray(data?.articles) ? data.articles : [];
  return articulos.map(articulo => ({
    titulo: articulo.title,
    descripcion: articulo.description,
    link: articulo.url,
    fecha: articulo.publishedAt,
    fuente: articulo?.source?.name || null,
    imagen: articulo.urlToImage || null
  }));
}

export function generarMensajePush(noticia) {
  if (!noticia) return "";
  return `${noticia.titulo}${noticia.descripcion ? ` - ${noticia.descripcion}` : ""}`;
}

export default {
  obtenerNoticias,
  generarMensajePush
};
