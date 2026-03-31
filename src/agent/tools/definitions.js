const fs = require("fs/promises");
const path = require("path");
const {
  READ_TEXT_FILE_NAME,
  LIST_DIR_NAME,
  STR_REPLACE_EDIT_NAME,
  readTextFilePrompt,
  listDirectoryPrompt,
  readTextFileSummary,
  listDirectorySummary,
  strReplaceEditPrompt,
  strReplaceEditSummary,
} = require("./prompts");
const { replaceUniqueSubstring } = require("./strReplaceLogic");

/**
 * @typedef {object} ToolDefinition
 * @property {string} name
 * @property {string} summary - Línea corta (API description primera línea).
 * @property {string} prompt - Instrucciones detalladas (estilo prompt.ts).
 * @property {object} input_schema - JSON Schema para Anthropic tools.
 * @property {(input: object, ctx: { cwd: string }) => Promise<string>} run
 */

/** @type {Record<string, ToolDefinition>} */
const registry = {};

function register(def) {
  registry[def.name] = def;
}

function buildAnthropicTool(def) {
  return {
    name: def.name,
    description: `${def.summary}\n\n${def.prompt}`.trim(),
    input_schema: def.input_schema,
  };
}

function getAnthropicTools() {
  return Object.values(registry).map(buildAnthropicTool);
}

async function readTextFile(input, ctx) {
  const raw = input.path;
  if (!raw || typeof raw !== "string") {
    throw new Error("path es obligatorio");
  }
  const abs = path.isAbsolute(raw) ? raw : path.resolve(ctx.cwd, raw);
  const data = await fs.readFile(abs, "utf8");
  return data;
}

async function listDirectory(input, ctx) {
  const raw = input.path;
  if (!raw || typeof raw !== "string") {
    throw new Error("path es obligatorio");
  }
  const abs = path.isAbsolute(raw) ? raw : path.resolve(ctx.cwd, raw);
  const recursive = Boolean(input.recursive);
  const maxDepth =
    typeof input.max_depth === "number" && input.max_depth >= 0
      ? Math.min(input.max_depth, 8)
      : 3;

  if (!recursive) {
    const entries = await fs.readdir(abs, { withFileTypes: true });
    return entries
      .map((e) => `${e.isDirectory() ? "[dir] " : "[file] "}${e.name}`)
      .join("\n");
  }

  const lines = [];
  async function walk(dir, depth) {
    if (depth > maxDepth) return;
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch (e) {
      lines.push(`(error en ${dir}: ${e.message})`);
      return;
    }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      lines.push(`${"  ".repeat(depth)}${e.isDirectory() ? "[dir] " : "[file] "}${e.name}`);
      if (e.isDirectory()) await walk(full, depth + 1);
    }
  }
  await walk(abs, 0);
  return lines.join("\n") || "(vacío)";
}

async function strReplaceEdit(input, ctx) {
  const raw = input.path;
  const oldStr = input.old_str;
  const newStr = input.new_str;
  if (!raw || typeof raw !== "string") {
    throw new Error("path es obligatorio");
  }
  if (typeof oldStr !== "string") {
    throw new Error("old_str es obligatorio");
  }
  if (typeof newStr !== "string") {
    throw new Error("new_str es obligatorio");
  }
  const abs = path.isAbsolute(raw) ? raw : path.resolve(ctx.cwd, raw);
  const before = await fs.readFile(abs, "utf8");
  const after = replaceUniqueSubstring(before, oldStr, newStr);
  await fs.writeFile(abs, after, "utf8");
  return [
    `OK: reemplazo único aplicado.`,
    `Archivo: ${abs}`,
    `Tamaño previo: ${before.length} caracteres; nuevo: ${after.length} caracteres.`,
  ].join("\n");
}

register({
  name: READ_TEXT_FILE_NAME,
  summary: readTextFileSummary,
  prompt: readTextFilePrompt,
  input_schema: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "Ruta del archivo a leer.",
      },
    },
    required: ["path"],
  },
  run: readTextFile,
});

register({
  name: LIST_DIR_NAME,
  summary: listDirectorySummary,
  prompt: listDirectoryPrompt,
  input_schema: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "Directorio a listar.",
      },
      recursive: {
        type: "boolean",
        description: "Si true, lista recursiva acotada por max_depth.",
      },
      max_depth: {
        type: "number",
        description: "Profundidad máxima cuando recursive es true (0-8).",
      },
    },
    required: ["path"],
  },
  run: listDirectory,
});

register({
  name: STR_REPLACE_EDIT_NAME,
  summary: strReplaceEditSummary,
  prompt: strReplaceEditPrompt,
  input_schema: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "Ruta del archivo a editar (UTF-8).",
      },
      old_str: {
        type: "string",
        description:
          "Fragmento exacto a reemplazar; debe ser único en el archivo.",
      },
      new_str: {
        type: "string",
        description: "Texto sustituto para esa única ocurrencia.",
      },
    },
    required: ["path", "old_str", "new_str"],
  },
  run: strReplaceEdit,
});

module.exports = {
  registry,
  getAnthropicTools,
  buildAnthropicTool,
};
