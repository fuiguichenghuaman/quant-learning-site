import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const publicDir = resolve(root, "public");
const contentDir = resolve(root, "content");

const filesToExpose = [
  "LEARNING_PROGRESS.md",
  "TestNumpyStock.py",
  "TestNumpyStock_explained.py"
];

await rm(publicDir, { recursive: true, force: true });
await mkdir(publicDir, { recursive: true });

await cp(contentDir, resolve(publicDir, "content"), { recursive: true });

for (const file of filesToExpose) {
  await cp(resolve(root, file), resolve(publicDir, file));
}

console.log("Static site public assets prepared.");
