const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const DEFAULT_DOCS_ROOT = "specs";
const DEFAULT_LIBRARY_DIR = "library";

const DEFAULT_TEAM_CONFIG_YAML = `# Configuración del agente de specs (equipo) — leída por todos los steps.
# Valores por defecto; cada épica puede sobreescribir en specs/changes/.../config.yaml
spect:
  language: es
  stack:
    node: "22"
    react: "18"
  conventions: |
    [Estilo de código, linters obligatorios, convención de commits, etc.]
`;

function loadPipelineConfig(projectRoot) {
  const configPath = path.join(projectRoot, "pipeline.config.yaml");
  if (!fs.existsSync(configPath)) return {};
  try {
    return yaml.load(fs.readFileSync(configPath, "utf8")) || {};
  } catch {
    return {};
  }
}

/**
 * Rutas absolutas del árbol de documentación (fuente: pipeline.config.yaml).
 */
function resolveSpecPaths(projectRoot, config) {
  const docsRoot = config.docs_root || DEFAULT_DOCS_ROOT;
  const libraryDir = config.library_dir || DEFAULT_LIBRARY_DIR;
  const skillsPath =
    config.skills_path || path.join(docsRoot, "skills").replace(/\\/g, "/");
  const rulesPath =
    config.rules_path || path.join(docsRoot, "rules").replace(/\\/g, "/");

  const changesAbs = path.join(projectRoot, docsRoot, "changes");
  return {
    docsRoot,
    libraryDir,
    docsRootAbs: path.join(projectRoot, docsRoot),
    libraryAbs: path.join(projectRoot, docsRoot, libraryDir),
    changesAbs,
    /** Histórico: siempre bajo changes/archive/ (misma convención que el árbol activo). */
    archiveAbs: path.join(changesAbs, "archive"),
    skillsAbs: path.join(projectRoot, skillsPath),
    rulesAbs: path.join(projectRoot, rulesPath),
  };
}

function ensureDirWithGitkeep(absDir) {
  if (!fs.existsSync(absDir)) {
    fs.mkdirSync(absDir, { recursive: true });
    fs.writeFileSync(path.join(absDir, ".gitkeep"), "");
    return true;
  }
  return false;
}

/**
 * Crea el árbol bajo docs_root si falta (changes, changes/archive, library, skills, rules).
 */
function ensureSpecsLayout(paths) {
  const created = [];
  const dirs = [
    paths.docsRootAbs,
    paths.libraryAbs,
    paths.changesAbs,
    paths.archiveAbs,
    paths.skillsAbs,
    paths.rulesAbs,
  ];
  for (const d of dirs) {
    if (ensureDirWithGitkeep(d)) {
      created.push(d);
    }
  }
  return created;
}

function writeStepExtraSkillsMd(projectRoot, paths, config) {
  const extra = config.step_extra_skills || {};
  const lines = [
    "# Skills adicionales por step",
    "",
    "Generado por `npx spec-driven-pipeline run`. Edita `pipeline.config.yaml` → `step_extra_skills`.",
    "Al ejecutar un agente, carga estos recursos **además** de los del frontmatter del agente.",
    "Las claves deben coincidir con el campo `name:` del agente (ej. `step-1-ai-proposal-initiator`).",
    "",
  ];
  const keys = Object.keys(extra);
  if (keys.length === 0) {
    lines.push("_No hay entradas. Ejemplo:_");
    lines.push("");
    lines.push("```yaml");
    lines.push("step_extra_skills:");
    lines.push("  step-1-ai-proposal-initiator:");
    lines.push("    - skills/nuestro-checklist.md");
    lines.push("```");
    lines.push("");
  } else {
    for (const agent of keys.sort()) {
      const skills = extra[agent];
      const list = Array.isArray(skills) ? skills : skills ? [skills] : [];
      lines.push(`## \`${agent}\``);
      lines.push("");
      if (list.length === 0) {
        lines.push("_(vacío)_");
      } else {
        for (const s of list) {
          lines.push(`- ${s}`);
        }
      }
      lines.push("");
    }
  }
  const out = path.join(paths.docsRootAbs, "step-extra-skills.md");
  fs.writeFileSync(out, lines.join("\n"), "utf8");
  return out;
}

function ensureTeamConfigYaml(projectRoot, paths) {
  const teamConfig = path.join(paths.docsRootAbs, "config.yaml");
  if (!fs.existsSync(teamConfig)) {
    fs.writeFileSync(teamConfig, DEFAULT_TEAM_CONFIG_YAML, "utf8");
    return teamConfig;
  }
  return null;
}

module.exports = {
  DEFAULT_DOCS_ROOT,
  DEFAULT_LIBRARY_DIR,
  DEFAULT_TEAM_CONFIG_YAML,
  loadPipelineConfig,
  resolveSpecPaths,
  ensureSpecsLayout,
  writeStepExtraSkillsMd,
  ensureTeamConfigYaml,
};
