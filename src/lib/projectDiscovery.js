/**
 * Zero-config discovery: identidad del repo, árbol, scripts, entrypoints.
 * Solo fs/path (CommonJS). Salida: un único markdown bajo docs_root.
 */

const fs = require("fs");
const path = require("path");

/** Directorios que casi siempre son artefacto de build o deps (además de .gitignore). */
const DEFAULT_IGNORE_DIR_NAMES = new Set([
  "node_modules",
  "dist",
  "build",
  "out",
  ".git",
  "coverage",
  ".nyc_output",
  ".next",
  "target",
  "__pycache__",
  ".turbo",
  ".parcel-cache",
  ".cache",
  "venv",
  ".venv",
  "env",
  ".eggs",
  "*.egg-info",
  "obj",
  ".gradle",
  "DerivedData",
]);

/** Nombres de archivo considerados puntos de entrada comunes. */
const ENTRYPOINT_BASENAMES = new Set([
  "main.ts",
  "main.tsx",
  "main.js",
  "main.jsx",
  "index.ts",
  "index.tsx",
  "index.js",
  "index.jsx",
  "index.mjs",
  "index.cjs",
  "App.tsx",
  "App.jsx",
  "app.tsx",
  "app.jsx",
  "handler.py",
  "main.py",
  "app.py",
  "wsgi.py",
  "asgi.py",
  "server.ts",
  "server.js",
  "cli.ts",
  "cli.js",
  "application.java",
  "Application.java",
  "Main.java",
  "Program.cs",
  "Program.fs",
  "go.mod",
  "Cargo.toml",
]);

const MAX_TREE_DEPTH = 4;
const MAX_TREE_LINES = 120;
const MAX_ENTRYPOINTS = 40;
const MAX_SCRIPTS_LIST = 40;

/**
 * @param {string} projectRoot
 * @returns {string[]}
 */
function loadGitignorePatterns(projectRoot) {
  const gi = path.join(projectRoot, ".gitignore");
  if (!fs.existsSync(gi)) return [];
  let text;
  try {
    text = fs.readFileSync(gi, "utf8");
  } catch {
    return [];
  }
  const out = [];
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    if (t.startsWith("!")) continue;
    out.push(t);
  }
  return out;
}

/**
 * Patrón .gitignore muy simplificado: nombres de segmento y sufijos *.ext
 * @param {string} relPosix path relativo con /
 * @param {string} baseName
 * @param {boolean} isDir
 * @param {string[]} patterns
 */
function matchesGitignore(relPosix, baseName, isDir, patterns) {
  for (const raw of patterns) {
    let pat = raw.replace(/\\/g, "/").trim();
    if (!pat) continue;

    const dirOnly = pat.endsWith("/");
    if (dirOnly) pat = pat.slice(0, -1);
    if (dirOnly && !isDir) continue;

    if (pat.includes("*")) {
      if (pat.startsWith("*.")) {
        const ext = pat.slice(1);
        if (baseName.endsWith(ext)) return true;
      }
      continue;
    }

    if (!pat.includes("/")) {
      if (baseName === pat) return true;
      continue;
    }

    const anchored = pat.startsWith("/");
    const p = anchored ? pat.slice(1) : pat;
    if (relPosix === p || relPosix.endsWith("/" + p)) return true;
  }
  return false;
}

/**
 * @param {string} name
 * @param {Set<string>} gitignoreDirNames
 */
function shouldSkipDirName(name, gitignoreDirNames) {
  if (DEFAULT_IGNORE_DIR_NAMES.has(name)) return true;
  if (gitignoreDirNames.has(name)) return true;
  return false;
}

/**
 * @param {string[]} patterns
 * @returns {Set<string>}
 */
function extractSimpleDirNamesFromGitignore(patterns) {
  const set = new Set();
  for (const raw of patterns) {
    const pat = raw.replace(/\\/g, "/").trim();
    if (!pat || pat.includes("*") || pat.startsWith("!")) continue;
    if (pat.includes("/")) {
      const first = pat.split("/").filter(Boolean)[0];
      if (first && !first.includes("*")) set.add(first);
      if (pat.endsWith("/")) {
        const seg = pat.replace(/\/$/, "").split("/").pop();
        if (seg) set.add(seg);
      }
    } else {
      set.add(pat.replace(/\/$/, ""));
    }
  }
  return set;
}

/**
 * @param {object} data package.json parseado
 */
function extractPackageIdentity(data) {
  const name = typeof data.name === "string" ? data.name : null;
  const version = typeof data.version === "string" ? data.version : null;
  const scripts = data.scripts && typeof data.scripts === "object" ? data.scripts : {};
  const scriptLines = Object.keys(scripts)
    .sort()
    .slice(0, MAX_SCRIPTS_LIST)
    .map((k) => `- \`${k}\`: ${String(scripts[k]).trim()}`);
  return { name, version, scriptLines, rawScripts: scripts };
}

/**
 * @param {string} projectRoot
 */
function readPomIdentity(projectRoot) {
  const pomPath = path.join(projectRoot, "pom.xml");
  if (!fs.existsSync(pomPath)) return null;
  let xml;
  try {
    xml = fs.readFileSync(pomPath, "utf8");
  } catch {
    return null;
  }
  const artifact =
    xml.match(/<artifactId>([^<]+)<\/artifactId>/) ||
    xml.match(/<artifactId>\s*([^<\s]+)\s*<\/artifactId>/);
  const version =
    xml.match(/<version>([^<]+)<\/version>/) ||
    xml.match(/<version>\s*([^<\s]+)\s*<\/version>/);
  return {
    name: artifact ? artifact[1].trim() : null,
    version: version ? version[1].trim() : null,
  };
}

/**
 * @param {string} projectRoot
 */
function readRequirementsHint(projectRoot) {
  const req = path.join(projectRoot, "requirements.txt");
  if (!fs.existsSync(req)) return null;
  return { present: true, path: "requirements.txt" };
}

/**
 * @param {string} projectRoot
 */
function readPyprojectIdentity(projectRoot) {
  const pp = path.join(projectRoot, "pyproject.toml");
  if (!fs.existsSync(pp)) return null;
  let text;
  try {
    text = fs.readFileSync(pp, "utf8");
  } catch {
    return null;
  }
  const projBlock = text.match(/\[project\][\s\S]*?(?=\n\[|\s*$)/);
  const block = projBlock ? projBlock[0] : text;
  const nameM = block.match(/^name\s*=\s*["']([^"']+)["']/m);
  const verM = block.match(/^version\s*=\s*["']([^"']+)["']/m);
  return {
    name: nameM ? nameM[1] : null,
    version: verM ? verM[1] : null,
  };
}

/**
 * @param {string} projectRoot
 */
function readGoModIdentity(projectRoot) {
  const gm = path.join(projectRoot, "go.mod");
  if (!fs.existsSync(gm)) return null;
  let text;
  try {
    text = fs.readFileSync(gm, "utf8");
  } catch {
    return null;
  }
  const mod = text.match(/^module\s+(\S+)/m);
  const goVer = text.match(/^go\s+(\S+)/m);
  return {
    name: mod ? mod[1] : null,
    version: goVer ? `go ${goVer[1]}` : null,
  };
}

/**
 * @param {string} projectRoot
 */
function readCargoIdentity(projectRoot) {
  const c = path.join(projectRoot, "Cargo.toml");
  if (!fs.existsSync(c)) return null;
  let text;
  try {
    text = fs.readFileSync(c, "utf8");
  } catch {
    return null;
  }
  const pkgSection = text.match(/\[package\][\s\S]*?(?=\n\[|\s*$)/);
  const block = pkgSection ? pkgSection[0] : text;
  const nameM = block.match(/^\s*name\s*=\s*["']([^"']+)["']/m);
  const verM = block.match(/^\s*version\s*=\s*["']([^"']+)["']/m);
  return {
    name: nameM ? nameM[1] : null,
    version: verM ? verM[1] : null,
  };
}

/**
 * Árbol con sangría; respeta .gitignore (heurística) y carpetas de build comunes.
 * @param {string} absDir
 * @param {string} relFromRoot ruta relativa POSIX desde la raíz del proyecto
 * @param {number} depth
 * @param {string[]} patterns
 * @param {Set<string>} gitignoreDirNames
 * @param {string[]} lines
 * @param {{ v: number }} lineCount
 */
function walkTreeRecursive(
  absDir,
  relFromRoot,
  depth,
  patterns,
  gitignoreDirNames,
  lines,
  lineCount,
) {
  if (lineCount.v >= MAX_TREE_LINES || depth > MAX_TREE_DEPTH) return;
  let entries;
  try {
    entries = fs.readdirSync(absDir, { withFileTypes: true });
  } catch {
    return;
  }

  entries.sort((a, b) => a.name.localeCompare(b.name));

  for (const ent of entries) {
    if (lineCount.v >= MAX_TREE_LINES) break;
    const name = ent.name;
    const relPosix = relFromRoot ? `${relFromRoot}/${name}` : name;
    const isDir = ent.isDirectory();

    if (isDir) {
      if (shouldSkipDirName(name, gitignoreDirNames)) continue;
      if (DEFAULT_IGNORE_DIR_NAMES.has(name)) continue;
      if (matchesGitignore(relPosix, name, true, patterns)) continue;
    } else if (matchesGitignore(relPosix, name, false, patterns)) {
      continue;
    }

    const indent = "  ".repeat(depth);
    lines.push(`${indent}${name}${isDir ? "/" : ""}`);
    lineCount.v += 1;

    if (isDir) {
      walkTreeRecursive(
        path.join(absDir, name),
        relPosix,
        depth + 1,
        patterns,
        gitignoreDirNames,
        lines,
        lineCount,
      );
    }
  }
}

/**
 * Genera líneas tipo tree desde projectRoot (solo lectura).
 * @param {string} projectRoot
 */
function buildSmartTree(projectRoot) {
  const patterns = loadGitignorePatterns(projectRoot);
  const gitignoreDirNames = extractSimpleDirNamesFromGitignore(patterns);
  const lines = [];
  const lineCount = { v: 0 };
  walkTreeRecursive(
    projectRoot,
    "",
    0,
    patterns,
    gitignoreDirNames,
    lines,
    lineCount,
  );
  if (lines.length === 0) return ["_(no se pudo listar la raíz)_"];
  return lines;
}

/**
 * @param {string} projectRoot
 * @param {string} dir
 * @param {number} depth
 * @param {string[]} patterns
 * @param {Set<string>} gitignoreDirNames
 * @param {string[]} found
 */
function collectEntrypoints(
  projectRoot,
  dir,
  depth,
  patterns,
  gitignoreDirNames,
  found,
) {
  if (found.length >= MAX_ENTRYPOINTS) return;
  if (depth > 5) return;

  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const ent of entries) {
    if (found.length >= MAX_ENTRYPOINTS) break;
    const name = ent.name;
    const full = path.join(dir, name);
    const rel = path.relative(projectRoot, full);
    const relPosix = rel.split(path.sep).join("/");
    const isDir = ent.isDirectory();

    if (isDir) {
      if (shouldSkipDirName(name, gitignoreDirNames)) continue;
      if (matchesGitignore(relPosix, name, true, patterns)) continue;
      collectEntrypoints(
        projectRoot,
        full,
        depth + 1,
        patterns,
        gitignoreDirNames,
        found,
      );
      continue;
    }

    if (matchesGitignore(relPosix, name, false, patterns)) continue;
    if (ENTRYPOINT_BASENAMES.has(name)) {
      found.push(relPosix);
    }
  }
}

/**
 * @param {string} projectRoot
 */
function findEntrypoints(projectRoot) {
  const patterns = loadGitignorePatterns(projectRoot);
  const gitignoreDirNames = extractSimpleDirNamesFromGitignore(patterns);
  const found = [];
  collectEntrypoints(
    projectRoot,
    projectRoot,
    0,
    patterns,
    gitignoreDirNames,
    found,
  );
  return [...new Set(found)].sort();
}

/**
 * @param {string} projectRoot
 */
function detectIdentity(projectRoot) {
  const hints = [];

  const pkgPath = path.join(projectRoot, "package.json");
  if (fs.existsSync(pkgPath)) {
    try {
      const raw = fs.readFileSync(pkgPath, "utf8");
      const data = JSON.parse(raw);
      const { name, version, scriptLines } = extractPackageIdentity(data);
      hints.push({
        stack: "Node.js / JavaScript",
        source: "package.json",
        name,
        version,
        scripts: scriptLines,
      });
    } catch {
      hints.push({
        stack: "Node.js / JavaScript",
        source: "package.json (presente, no parseable)",
        name: null,
        version: null,
        scripts: [],
      });
    }
  }

  const pom = readPomIdentity(projectRoot);
  if (pom) {
    hints.push({
      stack: "Java (Maven)",
      source: "pom.xml",
      name: pom.name,
      version: pom.version,
      scripts: [],
    });
  }

  const req = readRequirementsHint(projectRoot);
  const pyproj = readPyprojectIdentity(projectRoot);
  if (req || pyproj) {
    const sources = [];
    if (req) sources.push("requirements.txt");
    if (fs.existsSync(path.join(projectRoot, "pyproject.toml"))) {
      sources.push("pyproject.toml");
    }
    hints.push({
      stack: "Python",
      source: sources.length ? sources.join(", ") : "Python",
      name: pyproj ? pyproj.name : null,
      version: pyproj ? pyproj.version : null,
      scripts: [],
    });
  }

  const goMod = readGoModIdentity(projectRoot);
  if (goMod && goMod.name) {
    hints.push({
      stack: "Go",
      source: "go.mod",
      name: goMod.name,
      version: goMod.version,
      scripts: [],
    });
  }

  const cargo = readCargoIdentity(projectRoot);
  if (cargo && (cargo.name || cargo.version)) {
    hints.push({
      stack: "Rust",
      source: "Cargo.toml",
      name: cargo.name,
      version: cargo.version,
      scripts: [],
    });
  }

  return hints;
}

/**
 * @param {{ docsRootAbs: string }} paths
 * @param {string} projectRoot
 * @returns {string}
 */
function generateProjectContextMarkdown(projectRoot, paths) {
  const identityBlocks = detectIdentity(projectRoot);
  const treeLines = buildSmartTree(projectRoot);
  const entrypoints = findEntrypoints(projectRoot);

  const lines = [
    "# Contexto del proyecto (auto-descubierto)",
    "",
    "> Generado por `npx spec-driven-pipeline run` / `sync`. No edites manualmente si querés que se regenere en cada sync.",
    "",
    "## Identidad y stack",
    "",
  ];

  if (identityBlocks.length === 0) {
    lines.push(
      "_No se detectó `package.json`, `pom.xml`, `requirements.txt` ni metadatos típicos en la raíz._",
    );
    lines.push("");
  } else {
    for (const block of identityBlocks) {
      lines.push(`- **Stack:** ${block.stack}`);
      lines.push(`- **Fuente:** \`${block.source}\``);
      if (block.name) lines.push(`- **Nombre:** \`${block.name}\``);
      if (block.version) lines.push(`- **Versión:** \`${block.version}\``);
      lines.push("");
    }
  }

  lines.push("## Capacidades (scripts / comandos)");
  lines.push("");

  const pkgPath = path.join(projectRoot, "package.json");
  if (fs.existsSync(pkgPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
      const scripts = data.scripts && typeof data.scripts === "object" ? data.scripts : {};
      const keys = Object.keys(scripts);
      if (keys.length === 0) {
        lines.push("_`package.json` sin campo `scripts`._");
      } else {
        lines.push("### npm / package.json (`npm run <nombre>`)");
        lines.push("");
        for (const k of keys.sort().slice(0, MAX_SCRIPTS_LIST)) {
          lines.push(`- \`${k}\`: \`${String(scripts[k]).trim()}\``);
        }
        lines.push("");
      }
    } catch {
      lines.push("_No se pudieron leer los scripts de package.json._");
      lines.push("");
    }
  } else {
    lines.push("_No hay `package.json` en la raíz; no hay scripts npm listados._");
    lines.push("");
  }

  lines.push("## Puntos de entrada (heurística)");
  lines.push("");
  if (entrypoints.length === 0) {
    lines.push(
      "_No se encontraron archivos con nombres típicos (p. ej. `main.ts`, `index.js`, `handler.py`) en las primeras profundidades respetando ignores._",
    );
  } else {
    for (const e of entrypoints) {
      lines.push(`- \`${e}\``);
    }
  }
  lines.push("");

  lines.push("## Mapa de directorios (vista parcial)");
  lines.push("");
  lines.push(
    "Profundidad máxima por rama y carpetas ignoradas: `.gitignore`, además de `node_modules`, `dist`, `build`, `out`, `.git`, `target`, `__pycache__`, etc.",
  );
  lines.push("");
  lines.push("```");
  lines.push(treeLines.join("\n"));
  lines.push("```");
  lines.push("");

  return lines.join("\n");
}

/**
 * Escribe `project-context.md` bajo `paths.docsRootAbs` (p. ej. `specs/project-context.md`).
 * @param {string} projectRoot
 * @param {{ docsRootAbs: string }} paths
 * @returns {string} ruta absoluta del archivo escrito
 */
function writeProjectContextMd(projectRoot, paths) {
  if (!fs.existsSync(paths.docsRootAbs)) {
    fs.mkdirSync(paths.docsRootAbs, { recursive: true });
  }
  const md = generateProjectContextMarkdown(projectRoot, paths);
  const out = path.join(paths.docsRootAbs, "project-context.md");
  fs.writeFileSync(out, md, "utf8");
  return out;
}

module.exports = {
  writeProjectContextMd,
  generateProjectContextMarkdown,
  loadGitignorePatterns,
  buildSmartTree,
  findEntrypoints,
  detectIdentity,
};
