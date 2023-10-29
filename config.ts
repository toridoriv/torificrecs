/**
 * @file Contains the global configuration of this application.
 */
import "std/dotenv/load.ts";

import { toUppercase } from "@utilities/string.ts";
import { z } from "zod";
import { default as importMap } from "./import-map.json" assert { type: "json" };
import { default as packageJson } from "./package.json" assert { type: "json" };
export { default as denoJson } from "./deno.json" assert { type: "json" };

const EnvironmentSchema = z.object({
  ENVIRONMENT: z
    .preprocess(toUppercase, z.enum(["DEVELOPMENT", "PRODUCTION"]))
    .default("PRODUCTION"),
  PRETTY_LOG: z.coerce.boolean().default(false),
});

export const config = Object.freeze({
  project: packageJson,
  importMap,
  env: EnvironmentSchema.parse(Deno.env.toObject()),
});
