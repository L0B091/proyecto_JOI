// Backend/memoria/recuerdosImportantes.js
// Gestión de recuerdos importantes persistentes

import memoriaPersistente from "./memoriaPersistente.js";

const PREFIJO_RECUERDO = "_recuerdo_importante_";

/**
 * Genera la clave interna de un recuerdo.
 */
function generarClave(clave) {
  return PREFIJO_RECUERDO + clave;
}

/**
 * Obtiene todos los registros de recuerdos importantes.
 */
function obtenerRegistros(usuarioId) {
  if (!usuarioId) {
    return [];
  }

  const memoria =
    memoriaPersistente.obtener(usuarioId);

  if (!Array.isArray(memoria)) {
    return [];
  }

  return memoria.filter(
    function (item) {
      return (
        item &&
        typeof item.clave === "string" &&
        item.clave.startsWith(
          PREFIJO_RECUERDO
        )
      );
    }
  );
}

/**
 * Guardar recuerdo importante.
 *
 * Si la clave ya existe, la reemplaza.
 */
function guardar(usuarioId, clave, valor) {
  if (!usuarioId || !clave) {
    return null;
  }

  const claveInterna =
    generarClave(clave);

  const memoria =
    memoriaPersistente.obtener(
      usuarioId
    );

  const registro = {
    clave: claveInterna,
    tipo: "recuerdoImportante",
    recuerdo: {
      clave: clave,
      valor: valor,
      timestamp: Date.now()
    }
  };

  const indice = memoria.findIndex(
    function (item) {
      return (
        item &&
        item.clave === claveInterna
      );
    }
  );

  if (indice === -1) {
    memoria.push(registro);
  } else {
    memoria[indice] = registro;
  }

  memoriaPersistente.guardar(
    usuarioId,
    memoria
  );

  return registro.recuerdo;
}

/**
 * Obtener recuerdo importante.
 */
function obtener(usuarioId, clave) {
  if (!usuarioId || !clave) {
    return null;
  }

  const claveInterna =
    generarClave(clave);

  const registro =
    memoriaPersistente.obtenerPorClave(
      usuarioId,
      claveInterna
    );

  if (!registro) {
    return null;
  }

  return registro.recuerdo || null;
}

/**
 * Obtener todos los recuerdos importantes.
 */
function obtenerTodos(usuarioId) {
  const registros =
    obtenerRegistros(usuarioId);

  const recuerdos = {};

  registros.forEach(
    function (registro) {
      if (
        registro.recuerdo &&
        registro.recuerdo.clave
      ) {
        recuerdos[
          registro.recuerdo.clave
        ] = registro.recuerdo;
      }
    }
  );

  return recuerdos;
}

/**
 * Verificar existencia de un recuerdo.
 */
function existe(usuarioId, clave) {
  return obtener(
    usuarioId,
    clave
  ) !== null;
}

/**
 * Eliminar recuerdo específico.
 */
function borrar(usuarioId, clave) {
  if (!usuarioId || !clave) {
    return false;
  }

  const claveInterna =
    generarClave(clave);

  return memoriaPersistente.eliminarPorClave(
    usuarioId,
    claveInterna
  );
}

/**
 * Limpiar todos los recuerdos importantes.
 */
function limpiarUsuario(usuarioId) {
  if (!usuarioId) {
    return false;
  }

  const memoria =
    memoriaPersistente.obtener(
      usuarioId
    );

  const restante =
    memoria.filter(
      function (item) {
        return !(
          item &&
          typeof item.clave === "string" &&
          item.clave.startsWith(
            PREFIJO_RECUERDO
          )
        );
      }
    );

  return memoriaPersistente.guardar(
    usuarioId,
    restante
  );
}

/**
 * Elimina toda la memoria del usuario.
 *
 * Uso extremo.
 */
function eliminarTodo(usuarioId) {
  if (!usuarioId) {
    return false;
  }

  return memoriaPersistente.limpiar(
    usuarioId
  );
}

export default {
  guardar,
  obtener,
  obtenerTodos,
  existe,
  borrar,
  limpiarUsuario,
  eliminarTodo
};