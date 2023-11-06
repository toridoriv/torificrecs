/**
 * @file Contains the configuration of this application.
 */

export { type ConfigurationFile } from "./config/_helpers.ts";

import { EnvironmentNameSchema } from "@utilities/schemas.ts";
import type { ConfigurationFile } from "./config/_helpers.ts";

const ENVIRONMENT = EnvironmentNameSchema.default("PRODUCTION")
  .catch("PRODUCTION")
  .parse(Deno.env.get("ENVIRONMENT"));

export let config = {} as ConfigurationFile;

if (ENVIRONMENT === "TEST") {
  const configModule = await import("./config/test.ts");
  config = configModule.default;
} else if (ENVIRONMENT === "DEVELOPMENT") {
  const configModule = await import("./config/development.ts");
  config = configModule.default;
} else {
  const configModule = await import("./config/production.ts");
  config = configModule.default;
}
