/**
 * Persistencia de salidas largas de herramientas (patrón inspirado en toolResultStorage.ts del core).
 * Si el resultado supera el umbral, se guarda en disco y el modelo solo ve ruta + preview.
 */

const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

/** Umbral en caracteres (solicitud: >4000). */
const DEFAULT_PERSIST_THRESHOLD_CHARS = 4000;

/** Preview visible para el modelo (solicitud: 500 caracteres). */
const DEFAULT_PREVIEW_CHARS = 500;

const PERSISTED_TAG_OPEN = "<persisted-output>";
const PERSISTED_TAG_CLOSE = "</persisted-output>";

function getResultsDir(cwd = process.cwd()) {
  return path.join(cwd, "tmp", "results");
}

/**
 * Preview corto, preferiblemente cortando en salto de línea cercano al límite.
 * @param {string} content
 * @param {number} maxChars
 */
function generatePreview(content, maxChars) {
  if (content.length <= maxChars) {
    return { preview: content, hasMore: false };
  }
  const truncated = content.slice(0, maxChars);
  const lastNl = truncated.lastIndexOf("\n");
  const cut =
    lastNl > maxChars * 0.5 ? lastNl : maxChars;
  return { preview: content.slice(0, cut), hasMore: true };
}

/**
 * @param {string} rawText
 * @param {{ cwd?: string, thresholdChars?: number, previewChars?: number }} [opts]
 * @returns {Promise<string>}
 */
async function maybePersistLargeToolResult(rawText, opts = {}) {
  const cwd = opts.cwd ?? process.cwd();
  const threshold =
    opts.thresholdChars ?? DEFAULT_PERSIST_THRESHOLD_CHARS;
  const previewLen = opts.previewChars ?? DEFAULT_PREVIEW_CHARS;

  if (typeof rawText !== "string") {
    rawText = String(rawText ?? "");
  }

  if (rawText.length <= threshold) {
    return rawText;
  }

  const dir = getResultsDir(cwd);
  await fs.mkdir(dir, { recursive: true });

  const id = crypto.randomUUID();
  const filepath = path.join(dir, `${id}.txt`);
  await fs.writeFile(filepath, rawText, "utf8");

  const { preview, hasMore } = generatePreview(rawText, previewLen);
  let message = `${PERSISTED_TAG_OPEN}\n`;
  message += `Salida demasiado grande (${rawText.length} caracteres). Archivo completo: ${filepath}\n\n`;
  message += `Preview (primeros ~${previewLen} caracteres):\n`;
  message += preview;
  message += hasMore ? "\n...\n" : "\n";
  message += PERSISTED_TAG_CLOSE;
  return message;
}

module.exports = {
  maybePersistLargeToolResult,
  generatePreview,
  getResultsDir,
  DEFAULT_PERSIST_THRESHOLD_CHARS,
  DEFAULT_PREVIEW_CHARS,
  PERSISTED_TAG_OPEN,
  PERSISTED_TAG_CLOSE,
};
