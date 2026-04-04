import type { LocatorScreenshotOptions } from "@playwright/test";

import { visualStylePath } from "./e2e-env";

export const visualSnapshotOptions: LocatorScreenshotOptions = {
  animations: "disabled",
  caret: "hide",
  scale: "css",
  stylePath: visualStylePath
};
