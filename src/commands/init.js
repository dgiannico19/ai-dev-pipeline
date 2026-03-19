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
  if (envs.length === 1) return envs[0];

  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "env",
      message: "Se detectaron múltiples entornos. ¿Cuál quieres configurar?",
      choices: envs,
    },
  ]);

  return answers.env;
};

// Nueva función para elegir ubicación
const selectLocation = async (env) => {
  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "location",
      message: `¿Dónde quieres instalar los agentes de .${env}?`,
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
  const envs = detectEnvironments();

  if (!envs.length) {
    console.log("❌ No se detectó ningún entorno de IA soportado.");
    console.log("Entornos soportados: cursor, claude, windsurf, copilot");
    return;
  }

  const env = await selectEnvironment(envs);
  const location = await selectLocation(env);

  console.log(`\nConfigurando entorno: ${env}`);

  const packageRoot = path.join(__dirname, "../../");
  const templateRoot = path.join(packageRoot, "templates");

  // Lógica para determinar el Target
  let targetRoot;
  if (location === "home") {
    targetRoot = path.join(userHome, `.${env}`);
    console.log(`📍 Ubicación elegida: Global (Home)`);
  } else {
    targetRoot = path.join(projectRoot, `.${env}`);
    console.log(`📍 Ubicación elegida: Local (Proyecto)`);
  }

  if (!fs.existsSync(templateRoot)) {
    console.log(`❌ No se encontró la carpeta de templates en el package.`);
    return;
  }

  if (!fs.existsSync(targetRoot)) {
    fs.mkdirSync(targetRoot, { recursive: true });
    console.log(`📁 Creando directorio .${env}...`);
  }

  copyDir(templateRoot, targetRoot);

  console.log(`\n✅ AI Dev Pipeline instalado con éxito en: ${targetRoot}`);
  
  if (location === "home") {
    console.log("💡 Nota: Al ser una instalación global, afectará a todos los proyectos abiertos con este IDE.");
  }
};

module.exports = init;