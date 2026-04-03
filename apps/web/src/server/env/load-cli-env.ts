import { config } from "dotenv";

let loaded = false;

export function loadCliEnv() {
  if (loaded) {
    return;
  }

  // Match the local Next.js precedence closely enough for CLI scripts:
  // existing shell env wins, then .env.local, then .env.
  config({
    path: ".env.local",
    override: false
  });
  config({
    path: ".env",
    override: false
  });

  loaded = true;
}
