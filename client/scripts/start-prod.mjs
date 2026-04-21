import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawn } from "node:child_process";

const root = process.cwd();
const standaloneServer = resolve(root, ".next", "standalone", "server.js");
const buildIdPath = resolve(root, ".next", "BUILD_ID");
const nodeBin = process.execPath;
const nextCli = resolve(root, "node_modules", "next", "dist", "bin", "next");

const runAndWait = (command, args = []) =>
  new Promise((resolveRun, rejectRun) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.on("exit", (code) => {
      if (code === 0) {
        resolveRun();
        return;
      }
      rejectRun(new Error(`${command} ${args.join(" ")} exited with code ${code ?? 1}`));
    });
    child.on("error", rejectRun);
  });

const runPersistent = (command, args = []) => {
  const child = spawn(command, args, { 
    stdio: "inherit",
    env: { ...process.env, MEDIA_DIR: resolve(root, "public", "media") }
  });
  child.on("exit", (code) => process.exit(code ?? 0));
  child.on("error", (err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
};

async function main() {
  if (!existsSync(buildIdPath)) {
    console.warn("No production build found. Running `next build` first.");
    await runAndWait(nodeBin, [nextCli, "build"]);
  }

  if (existsSync(standaloneServer)) {
    console.log(`Starting standalone server: ${standaloneServer}`);
    runPersistent("node", [standaloneServer]);
    return;
  }

  console.warn("Standalone server not found. Falling back to `next start`.");
  runPersistent(nodeBin, [nextCli, "start"]);
}

main().catch((err) => {
  console.error("Failed to start production server:", err);
  process.exit(1);
});
