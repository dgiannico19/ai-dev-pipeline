/**
 * Prompts descriptivos y restrictivos por herramienta (patrón: un prompt.ts por tool en el core).
 * Separados del JSON schema para mantener el mismo estilo de mantenimiento.
 */

const READ_TEXT_FILE_NAME = "read_text_file";
const LIST_DIR_NAME = "list_directory";
const STR_REPLACE_EDIT_NAME = "str_replace_edit";

const readTextFilePrompt = `Lee un archivo de texto del sistema de archivos local.

Uso:
- El parámetro path debe ser una ruta absoluta o resuelta desde el directorio de trabajo actual del proceso.
- Para archivos binarios o muy grandes, podés recibir un error o una salida truncada; en ese caso pedí aclaración o un rango menor.
- No inventes contenido si el archivo no existe: reportá el error tal cual.
- Preferí leer solo lo necesario si el usuario indicó límites; si no, leé el archivo completo para archivos razonables.`;

const listDirectoryPrompt = `Lista entradas de un directorio (no recursivo por defecto).

Uso:
- path debe ser absoluto o relativo al cwd; se normaliza respecto al proyecto.
- Si recursive es true, lista de forma recursiva con profundidad máxima max_depth (por defecto 3) para evitar recorridos enormes.
- No listes directorios de sistema sensibles fuera del workspace sin que el usuario lo pida explícitamente.
- Devuelve nombres y tipo (archivo/directorio), no contenido.`;

const readTextFileSummary = "Lee el contenido UTF-8 de un archivo de texto.";
const listDirectorySummary = "Lista archivos y subdirectorios bajo una ruta.";

const strReplaceEditSummary =
  "Reemplaza un único fragmento de texto en un archivo (edición mínima, sin reescribir el archivo entero).";

const strReplaceEditPrompt = `Aplica un cambio local en un archivo de texto existente reemplazando exactamente UNA ocurrencia de old_str por new_str.

Filosofía (edición minimalista):
- Preferí siempre el cambio más pequeño posible: solo las líneas o tokens necesarios.
- No pegues el archivo completo en new_str: solo el fragmento sustituido y su contexto inmediato en old_str.
- Si necesitás varios cambios distantes, llamá esta herramienta varias veces con contextos únicos.

Reglas de old_str:
- Debe aparecer exactamente UNA vez en el archivo. Si aparece 0 veces, ampliá old_str con líneas vecinas únicas.
- Si aparece más de una vez, ampliá old_str hasta que el match sea único.
- Respetá saltos de línea y espacios tal cual están en el disco (incluido final de línea).

new_str:
- Debe ser el texto resultante después del reemplazo; no incluyas el resto del archivo.

No uses esta herramienta para archivos binarios.`;

module.exports = {
  READ_TEXT_FILE_NAME,
  LIST_DIR_NAME,
  STR_REPLACE_EDIT_NAME,
  readTextFilePrompt,
  listDirectoryPrompt,
  readTextFileSummary,
  listDirectorySummary,
  strReplaceEditSummary,
  strReplaceEditPrompt,
};
