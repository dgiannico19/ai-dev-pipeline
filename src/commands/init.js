const fs = require("fs");
const path = require("path");
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
      message: "Multiple AI environments detected. Choose where to install:",
      choices: envs,
    },
  ]);

  return answers.env;
};

const init = async () => {
  const projectRoot = process.cwd();
  const envs = detectEnvironments();

  if (!envs.length) {
    console.log("❌ No AI environment detected");
    console.log("Supported environments: cursor, claude, windsurf");
    return;
  }

  const env = await selectEnvironment(envs);

  console.log(`Detected environment: ${env}`);

  const packageRoot = path.join(__dirname, "../../");
  const templateRoot = path.join(packageRoot, "templates");
  // destino depende del env
  const targetRoot = path.join(projectRoot, ENV_TARGET_MAP[env]);
  if (!fs.existsSync(templateRoot)) {
    console.log(`❌ Templates folder not found`);
    return;
  }

  if (!fs.existsSync(targetRoot)) {
    fs.mkdirSync(targetRoot, { recursive: true });
    console.log(`📁 Created .${env} directory`);
  }

  copyDir(templateRoot, targetRoot);

  console.log(`\n✅ AI Dev Pipeline successfully installed in .${env}`);
};

module.exports = init;
