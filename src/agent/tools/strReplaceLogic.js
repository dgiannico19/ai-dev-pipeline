/**
 * Conteo y reemplazo no solapado de subcadenas (sin dependencias externas).
 */

/**
 * Cuenta ocurrencias no solapadas de needle en haystack avanzando de a una.
 * @param {string} haystack
 * @param {string} needle
 * @returns {number}
 */
function countNonOverlappingOccurrences(haystack, needle) {
  if (needle.length === 0) {
    return -1;
  }
  let count = 0;
  let pos = 0;
  while (pos <= haystack.length - needle.length) {
    const idx = haystack.indexOf(needle, pos);
    if (idx === -1) break;
    count += 1;
    pos = idx + needle.length;
  }
  return count;
}

/**
 * Reemplaza exactamente una ocurrencia; lanza si no es única.
 * @param {string} original
 * @param {string} oldStr
 * @param {string} newStr
 * @returns {string}
 */
function replaceUniqueSubstring(original, oldStr, newStr) {
  const n = countNonOverlappingOccurrences(original, oldStr);
  if (oldStr.length === 0) {
    throw new Error(
      "old_str no puede estar vacío: no hay ancla para un reemplazo seguro.",
    );
  }
  if (n === 0) {
    throw new Error(
      "old_str no aparece en el archivo. Ampliá el contexto (más líneas o texto único alrededor) para que el fragmento coincida exactamente una vez.",
    );
  }
  if (n > 1) {
    throw new Error(
      `old_str aparece ${n} veces en el archivo. Incluí más contexto alrededor (líneas únicas) para que el fragmento sea único, o dividí la edición en pasos.`,
    );
  }
  return original.replace(oldStr, newStr);
}

module.exports = {
  countNonOverlappingOccurrences,
  replaceUniqueSubstring,
};
