const fs = require("fs");
const path = require("path");
const os = require("os");
const inquirer = require("inquirer");
const yaml = require("js-yaml"); // Asegúrate de tenerlo en dependencias

const detectEnvironments = require("../detectEnvironment");
const {
  loadPipelineConfig,
  resolveSpecPaths,
  ensureSpecsLayout,
  ensureTeamConfigYaml,
  writeStepExtraSkillsMd,
} = require("../lib/specPaths");

const copyDir = (src, dest) => {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
      continue;
    }

    if (fs.existsSync(destPath)) {
      console.log(`⚠️ Skipped existing file: ${destPath}`);
      continue;
    }

    fs.copyFileSync(srcPath, destPath);
    console.log(`✔ Installed: ${destPath}`);
  }
};

const selectEnvironment = async (envs) => {
  const choices = [
    ...envs,
    new inquirer.Separator(),
    { name: "➕ Otro (Configuración personalizada)", value: "custom" },
  ];

  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "env",
      message: "Selecciona el entorno de IA para configurar:",
      choices: choices,
    },
    {
      type: "input",
      name: "customEnv",
      message: "¿Cómo se llama la carpeta de configuración? (ej: my-ai-rules):",
      when: (answers) => answers.env === "custom",
      validate: (input) =>
        input.length > 0 || "El nombre no puede estar vacío.",
      filter: (input) => input.replace(/^\./, ""),
    },
  ]);

  return answers.env === "custom" ? answers.customEnv : answers.env;
};

const selectLocation = async (env) => {
  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "location",
      message: `¿Dónde quieres instalar los agentes para .${env}?`,
      choices: [
        { name: "📁 En este Proyecto (Local Repo)", value: "project" },
        { name: "🏠 En mi Usuario (Global Home)", value: "home" },
      ],
    },
  ]);

  return answers.location;
};

const init = async () => {
  const projectRoot = process.cwd();
  const userHome = os.homedir();
  const packageRoot = path.join(__dirname, "../../");

  let detectedEnvs = detectEnvironments();
  const env = await selectEnvironment(detectedEnvs);
  const location = await selectLocation(env);

  console.log(`\n🚀 Configurando entorno: ${env}`);

  // --- 1. CONFIGURACIÓN DINÁMICA (YAML) ---
  const configPath = path.join(projectRoot, "pipeline.config.yaml");
  if (!fs.existsSync(configPath)) {
    const defaultConfig = {
      schema: "spec-driven",
      docs_root: "specs",
      library_dir: "library",
      context: `Idioma: Español.\nStack: [Define tu stack aquí]\nArquitectura: [Define tu arquitectura]\nReglas adicionales: [Tus reglas de equipo]`,
      skills_path: "specs/skills",
      rules_path: "specs/rules",
      step_extra_skills: {},
    };
    fs.writeFileSync(configPath, yaml.dump(defaultConfig), "utf8");
    console.log(`✨ Creado: pipeline.config.yaml`);
  }

  // --- 2. ESTRUCTURA DE CARPETAS DEL USUARIO (specs/) ---
  const cfg = loadPipelineConfig(projectRoot);
  const paths = resolveSpecPaths(projectRoot, cfg);
  const created = ensureSpecsLayout(paths);
  for (const d of created) {
    console.log(`📁 Carpeta usuario creada: ${path.relative(projectRoot, d)}`);
  }
  const teamCfg = ensureTeamConfigYaml(projectRoot, paths);
  if (teamCfg) {
    console.log(`✨ Creado: ${path.relative(projectRoot, teamCfg)}`);
  }
  const skillsMd = writeStepExtraSkillsMd(projectRoot, paths, cfg);
  console.log(`✔ Generado: ${path.relative(projectRoot, skillsMd)}`);

  // --- 3. ESTRUCTURA CORE (.ai/) ---
  // Aquí guardamos tus skills y rules que vienen con el package
  const coreSubdirs = ["core-skills", "core-rules"];
  coreSubdirs.forEach((sub) => {
    const fullPath = path.join(projectRoot, ".ai", sub);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`📁 Carpeta core creada: .ai/${sub}`);
    }
  });

  // Copiamos tus skills y rules base desde el package al proyecto
  copyDir(
    path.join(packageRoot, "core-skills"),
    path.join(projectRoot, ".ai", "core-skills"),
  );
  copyDir(
    path.join(packageRoot, "core-rules"),
    path.join(projectRoot, ".ai", "core-rules"),
  );

  // --- 4. INSTALACIÓN DE TEMPLATES DEL IDE ---
  const templateRoot = path.join(packageRoot, "templates");
  let targetRoot;
  const folderName = `.${env}`;

  if (location === "home") {
    targetRoot = path.join(userHome, folderName);
  } else {
    targetRoot = path.join(projectRoot, folderName);
  }

  if (!fs.existsSync(targetRoot)) fs.mkdirSync(targetRoot, { recursive: true });
  copyDir(templateRoot, targetRoot);

  console.log(`\n✅ Spec-Driven Pipeline instalado con éxito.`);
  console.log(
    `👉 IMPORTANTE: Corre 'npx spec-driven-pipeline run' para sincronizar el contexto con el IDE.`,
  );
};

module.exports = init;
