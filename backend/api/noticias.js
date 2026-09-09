// backend/apis/noticias.js
// API de noticias y alertas para Joi
// Provee información para notificaciones y conversación según intereses del usuario

import fetch from 'node-fetch';

// Memoria interna para evitar enviar noticias repetidas
const memoriaNoticias = {};

/**
* Obtiene noticias filtradas según ciudad o categoría
* @param {string} ciudad - ciudad del usuario
* @param {Array<string>} categorias - ej: ["tránsito", "transporte", "curiosidades"]
* @returns {Array<object>} - lista de noticias { titulo, descripcion, link, fecha }
*/
async function obtenerNoticias(ciudad, categorias = []) {
  try {
    const API_KEY = 'TU_API_KEY_NOTICIAS'; // Reemplazar con la clave real
    const url = `https://newsapi.org/v2/top-headlines?q=${categorias.join(',')}&pageSize=5&apiKey=${API_KEY}&language=es&country=ar`;

    const respuesta = await fetch(url);
    if (!respuesta.ok) throw new Error(`Error al obtener noticias: ${respuesta.statusText}`);

    const data = await respuesta.json();
    if (!data.articles) return [];

    // Filtrar por ciudad si el título o descripción la menciona
    const noticiasFiltradas = data.articles.filter(noticia => {
      if (!ciudad) return true;
      const texto = `${noticia.title} ${noticia.description}`.toLowerCase();
      return texto.includes(ciudad.toLowerCase());
    });

    // Evitar repetir noticias ya enviadas
    const noticiasUnicas = noticiasFiltradas.filter(noticia => {
      const key = noticia.url;
      if (memoriaNoticias[key]) return false;
      memoriaNoticias[key] = true;
      return true;
    });

    // Mapear noticias a formato simple
    return noticiasUnicas.map(noticia => ({
      titulo: noticia.title,
      descripcion: noticia.description,
      link: noticia.url,
      fecha: noticia.publishedAt
    }));

  } catch (error) {
    console.error('Error en noticias.js:', error.message);
    return [];
  }
}

/**
* Genera mensaje corto para notificación push o conversación de Joi
* @param {object} noticia
* @returns {string}
*/
function generarMensajePush(noticia) {
  if (!noticia) return '';
  return `${noticia.titulo}${noticia.descripcion ? ' - ' + noticia.descripcion : ''}`;
}

export default {
  obtenerNoticias,
  generarMensajePush
}; 
