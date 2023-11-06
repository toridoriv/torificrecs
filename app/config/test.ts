import { LoggerConfig } from "@utilities/logger.config.ts";
import { CommonConfig } from "./_common.ts";
import { defineConfig } from "./_helpers.ts";

const ENVIRONMENT = "TEST" as const;

export default defineConfig(CommonConfig, {
  admin: {
    emails: ["admin@example.org"],
    passwords: ["abcde123"],
  },
  environment: ENVIRONMENT,
  log: {
    severity: LoggerConfig.SeverityName.Silent,
    environment: ENVIRONMENT,
    mode: LoggerConfig.Mode.Json,
  },
});
