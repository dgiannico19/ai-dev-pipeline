#!/usr/bin/env node

import init from "../src/commands/init";

const command = process.argv[2];

const run = async () => {
  switch (command) {
    case "init":
      await init();
      break;
    default:
      console.log(`
AI Dev Pipeline

Commands:

  init     install AI dev pipeline
`);
  }
};

run();
