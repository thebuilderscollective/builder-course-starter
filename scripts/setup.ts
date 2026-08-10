// Copyright (c) 2026 The Builder Course and Rajat. All rights reserved.

import { copyFileSync, existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const minimumNodeMajor = 22;
const root = process.cwd();
const packagePath = resolve(root, "package.json");
const examplePath = resolve(root, ".env.example");
const localPath = resolve(root, ".env.local");

function stop(message: string): never {
  console.error(`Setup stopped: ${message}`);
  process.exit(1);
}

const nodeMajor = Number.parseInt(process.versions.node.split(".")[0] ?? "0", 10);

if (nodeMajor < minimumNodeMajor) {
  stop(`Node.js ${minimumNodeMajor} or newer is required. You have ${process.versions.node}.`);
}

if (!existsSync(packagePath)) {
  stop("run this command from the repository root, where package.json is located.");
}

const project = JSON.parse(readFileSync(packagePath, "utf8")) as { name?: string };

if (project.name !== "builder-course-starter") {
  stop("this folder is not the Builder Course starter repository.");
}

if (!existsSync(examplePath)) {
  stop(".env.example is missing. Restore it from the course repository.");
}

if (existsSync(localPath)) {
  console.log("Setup ready: .env.local already exists, so it was left unchanged.");
} else {
  copyFileSync(examplePath, localPath);
  console.log("Setup ready: created .env.local from the blank template.");
}

console.log("Next: open .env.local in VS Code and add the five private values.");
console.log("The filename starts with a dot, so your computer may hide it outside VS Code.");
