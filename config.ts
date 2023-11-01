/**
 * @file Contains the global configuration of this application.
 */

import { LoggerConfig } from "@utilities/logger.config.ts";
import { toUppercase } from "@utilities/string.ts";
import { loadSync } from "std/dotenv/mod.ts";
import { z } from "zod";
import { default as importMap } from "./import-map.json" assert { type: "json" };
import { default as packageJson } from "./package.json" assert { type: "json" };
export { default as denoJson } from "./deno.json" assert { type: "json" };

const ENV_FILE = Deno.env.get("ENV_FILE");

if (ENV_FILE) {
  loadSync({ envPath: ENV_FILE, export: true });
} else {
  loadSync({ export: true });
}

const ENVIRONMENT = z.preprocess(
  toUppercase,
  z.enum(["DEVELOPMENT", "TEST", "PRODUCTION"]),
).default("PRODUCTION").parse(Deno.env.get("ENVIRONMENT"));

const LOG_SEVERITY = z.preprocess(
  toUppercase,
  LoggerConfig.SeverityNameSchema.default("INFORMATIONAL"),
).parse(Deno.env.get("LOG_SEVERITY"));

const LOG_FORMAT = z.preprocess(
  toUppercase,
  LoggerConfig.ModeSchema.default("JSON"),
).parse(Deno.env.get("LOG_FORMAT"));

export const config = Object.freeze({
  project: packageJson,
  environment: ENVIRONMENT,
  importMap,
  logger: {
    severity: LOG_SEVERITY,
    format: LOG_FORMAT,
  },
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
});
