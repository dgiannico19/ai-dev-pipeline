const fs = require("fs");
const path = require("path");
const os = require("os"); // Para obtener el home del usuario
const inquirer = require("inquirer");

const detectEnvironments = require("../detectEnvironment");

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
  // Agregamos la opción personalizada al final de la lista
  const choices = [...envs, new inquirer.Separator(), { name: "➕ Otro (Configuración personalizada)", value: "custom" }];

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
      validate: (input) => input.length > 0 || "El nombre no puede estar vacío.",
      filter: (input) => input.replace(/^\./, ""), // Quitamos el punto inicial si lo pone, lo manejamos nosotros luego
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
  
  // Detectamos entornos, pero ya no cortamos el flujo si no hay ninguno
  let detectedEnvs = detectEnvironments();

  const env = await selectEnvironment(detectedEnvs);
  const location = await selectLocation(env);

  console.log(`\n🚀 Configurando entorno: ${env}`);

  const packageRoot = path.join(__dirname, "../../");
  const templateRoot = path.join(packageRoot, "templates");

  // Determinamos el Target
  let targetRoot;
  const folderName = `.${env}`; // Mantenemos la convención del punto

  if (location === "home") {
    targetRoot = path.join(userHome, folderName);
    console.log(`📍 Ubicación elegida: Global (Home)`);
  } else {
    targetRoot = path.join(projectRoot, folderName);
    console.log(`📍 Ubicación elegida: Local (Proyecto)`);
  }

  // --- LÓGICA DE PRIVACIDAD Y DIRECTORIOS ---
  // 1. Asegurar que existe la carpeta ai/ y ai/changes/ con un .gitkeep
  const aiChangesPath = path.join(projectRoot, "ai", "changes");
  const aiSpecsPath = path.join(projectRoot, "ai", "specs");
  
  [aiChangesPath, aiSpecsPath].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, ".gitkeep"), "");
      console.log(`📁 Carpeta creada: ${dir}`);
    }
  });

  // 2. Instalar Templates del IDE
  if (!fs.existsSync(templateRoot)) {
    console.log(`❌ No se encontró la carpeta de templates en el package.`);
    return;
  }

  if (!fs.existsSync(targetRoot)) {
    fs.mkdirSync(targetRoot, { recursive: true });
    console.log(`📁 Creando directorio ${folderName}...`);
  }

  copyDir(templateRoot, targetRoot);

  console.log(`\n✅ AI Dev Pipeline instalado con éxito en: ${targetRoot}`);
};

module.exports = init;