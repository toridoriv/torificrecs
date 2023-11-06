import "std/dotenv/load.ts";

import { LoggerConfig } from "@utilities/logger.config.ts";
import {
  EmailSchema,
  EnvironmentNameSchema,
  NonEmptyStringSchema,
  PortSchema,
  ScriptSchema,
  UrlSchema,
} from "@utilities/schemas.ts";
import { DeepDiff, DeepPartial } from "@utilities/types.ts";
import { deepMerge } from "std/collections/deep_merge.ts";
import { z } from "zod";

/**
 * The schema for the application configuration.
 */
const ConfigSchema = z.object({
  /**
   * The environment name, used to determine which environment variables and configuration to load.
   */
  environment: EnvironmentNameSchema,
  /**
   * The port number that the application should listen on.
   */
  port: PortSchema,
  /**
   * The application version number in **SEMVER** format.
   */
  version: NonEmptyStringSchema,
  /**
   * The configuration for the application logger.
   */
  log: LoggerConfig.SettingsSchema,
  /**
   * The configuration for administrator accounts.
   */
  admin: z.object({
    /**
     * An array of email addresses for administrator accounts.
     */
    emails: z.array(EmailSchema),
    /**
     * An array of hashed password strings for admin accounts.
     */
    passwords: z.array(NonEmptyStringSchema),
  }),
  /**
   * The configuration for the application itself.
   *
   * - `title` is the name of the application.
   * - `description` is an optional description of the app.
   * - `stylesheets` lists CSS files to include.
   * - `scripts` lists JavaScript files to include.
   */
  app: z.object({
    /**
     * The title of the application.
     */
    title: NonEmptyStringSchema,
    /**
     * A description for the application.
     */
    description: z.string().optional(),
    /**
     * The list of stylesheet files to include in the application.
     */
    stylesheets: z.array(UrlSchema),
    /**
     * The list of JavaScript files to include in the application.
     */
    scripts: z.array(ScriptSchema),
  }),
  /**
   * The timezone to use when formatting dates and times.
   */
  timezone: z.string(),
});

type ConfigInput = z.input<typeof ConfigSchema>;

/**
 * The ConfigurationFile type represents the structure of the validated configuration object.
 */
export type ConfigurationFile = z.TypeOf<typeof ConfigSchema>;

/**
 * Defines a configuration object by merging common configuration
 * values with custom values.
 *
 * @param common - The common configuration values.
 * @param value - The custom configuration values.
 * @returns The merged configuration object.
 */
export function defineConfig<Common extends DeepPartial<ConfigInput>>(
  common: Common,
  value: DeepDiff<ConfigInput, Common>,
) {
  return ConfigSchema.parse(deepMerge(common, value));
}

/**
 * Gets a comma-separated list of values from an environment variable.
 *
 * @param name - The name of the environment variable.
 * @returns An array of values from the environment variable.
 */
export function getListFromEnvironment(name: string) {
  return (Deno.env.get(name) || "").split(",");
}
