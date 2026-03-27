#!/usr/bin/env node

const init = require("../src/commands/init");
const sync = require("../src/commands/sync");

const command = process.argv[2];
const args = process.argv.slice(3);

const run = async () => {
  switch (command) {
    case "init":
      await init();
      break;

    case "run":
    case "sync":
      await sync();
      break;

    default:
      console.log(`
Spec-Driven Pipeline 🚀

Commands:
  init     Instala el pipeline, pipeline.config.yaml y el árbol bajo specs/.
  run|sync Crea carpetas si faltan, specs/config.yaml y step-extra-skills.md.

Uso: npx spec-driven-pipeline <comando>
`);
  }
};

run();
