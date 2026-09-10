import path from "path";

const catalogo = {
  alegre: [
    { etiqueta: "alegre", archivo: "avatar/galeria/alegre/ALEGRE_BASE.mp4" },
    { etiqueta: "alegre", archivo: "avatar/galeria/alegre/ALEGRE_BRILLO.mp4" }
  ],
  atenta: [
    { etiqueta: "atenta", archivo: "avatar/galeria/atenta/ATENTA_BASE.mp4" },
    { etiqueta: "atenta", archivo: "avatar/galeria/atenta/ATENTA_THINK.mp4" }
  ],
  calida: [
    { etiqueta: "calida", archivo: "avatar/galeria/calida/CALIDA_BASE.mp4" },
    { etiqueta: "calida", archivo: "avatar/galeria/calida/CALIDA_CERCANA.mp4" }
  ],
  aliviada: [
    { etiqueta: "aliviada", archivo: "avatar/galeria/aliviada/ALIVIADA_BASE.mp4" },
    { etiqueta: "aliviada", archivo: "avatar/galeria/aliviada/ALIVIADA_CALMA.mp4" }
  ],
  agradecida: [
    { etiqueta: "agradecida", archivo: "avatar/galeria/agradecida/AGRADECIDA_BASE.mp4" }
  ],
  texting: [
    { etiqueta: "texting", archivo: "avatar/galeria/TEXTING/TEXTING_01.mp4" }
  ]
};

function determinarCategoria(contexto = {}, expresion = {}) {
  const emocion = contexto.entradaProcesada?.emocion || "neutral";
  const tipo = contexto.entradaProcesada?.intencion || "comentario";
  const tono = expresion?.tono || "calido";

  if (tipo === "pregunta") return "atenta";
  if (tipo === "agradecimiento") return "agradecida";
  if (emocion === "triste") return "aliviada";
  if (emocion === "feliz" || tono === "alegre") return "alegre";
  if (contexto.memoriaSistema?.memoriaCorta?.intencionDetectada === "desarrollo") return "texting";
  return "calida";
}

function seleccionarVideo(contexto = {}, expresion = {}) {
  const categoria = determinarCategoria(contexto, expresion);
  const opciones = catalogo[categoria] || catalogo.calida;
  const indice = 0;
  const seleccionado = opciones[indice];
  return {
    categoria,
    etiqueta: seleccionado.etiqueta,
    assetPath: seleccionado.archivo,
    assetName: path.basename(seleccionado.archivo),
    loop: true
  };
}

export default {
  seleccionarVideo
};
