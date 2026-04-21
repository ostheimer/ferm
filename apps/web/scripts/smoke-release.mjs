#!/usr/bin/env node

import { runSmokeCli } from "./smoke-web-core.mjs";

await runSmokeCli({
  targetUrl: process.argv[2] ?? process.env.PRODUCTION_URL,
  label: "Release smoke",
  usage: "Usage: node ./apps/web/scripts/smoke-release.mjs <production-url>"
});
