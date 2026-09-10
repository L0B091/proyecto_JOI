const FALLBACK_NEWS = [
  {
    titulo: "JOI mantiene un resumen local",
    descripcion: "No hay API key de noticias configurada; se entrega un resumen de respaldo.",
    link: null,
    fecha: new Date().toISOString()
  }
];

async function obtenerNoticias(ciudad = "", categorias = []) {
  const apiKey = process.env.NEWS_API_KEY || "";
  if (!apiKey) {
    return FALLBACK_NEWS.map(item => ({
      ...item,
      descripcion: ciudad
        ? `${item.descripcion} Contexto consultado: ${ciudad}.`
        : item.descripcion,
      categorias
    }));
  }

  try {
    const url = new URL("https://newsapi.org/v2/top-headlines");
    url.searchParams.set("pageSize", "5");
    url.searchParams.set("language", "es");
    url.searchParams.set("country", "ar");
    url.searchParams.set("apiKey", apiKey);
    if (categorias.length > 0) {
      url.searchParams.set("q", categorias.join(","));
    } else if (ciudad) {
      url.searchParams.set("q", ciudad);
    }

    const respuesta = await fetch(url);
    if (!respuesta.ok) {
      throw new Error(`Error al obtener noticias: ${respuesta.status}`);
    }

    const data = await respuesta.json();
    const articulos = Array.isArray(data?.articles) ? data.articles : [];

    return articulos.map(articulo => ({
      titulo: articulo.title,
      descripcion: articulo.description,
      link: articulo.url,
      fecha: articulo.publishedAt
    }));
  } catch (error) {
    console.error("Error en noticias.js:", error.message);
    return FALLBACK_NEWS;
  }
}

function generarMensajePush(noticia) {
  if (!noticia) return "";
  return `${noticia.titulo}${noticia.descripcion ? " - " + noticia.descripcion : ""}`;
}

export default {
  obtenerNoticias,
  generarMensajePush
};
