// src/detectEnvironment.js
import fs from "fs";
import path from "path";

const detectEnvironments = () => {
  const root = process.cwd();
  const envs = [];

  if (fs.existsSync(path.join(root, ".cursor"))) envs.push("cursor");
  if (fs.existsSync(path.join(root, ".claude"))) envs.push("claude");
  if (fs.existsSync(path.join(root, ".windsurf"))) envs.push("windsurf");

  return envs;
};

export default detectEnvironments;