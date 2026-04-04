import { spawnSync } from "node:child_process";

import { repoRoot } from "./e2e-env";

export function runCommand(command: string, args: string[], env?: NodeJS.ProcessEnv) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    env: {
      ...process.env,
      ...env
    },
    stdio: "inherit",
    shell: process.platform === "win32"
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(" ")}`);
  }
}

export function getPnpmCommand() {
  return process.platform === "win32" ? "pnpm.cmd" : "pnpm";
}
