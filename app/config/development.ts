import { LoggerConfig } from "@utilities/logger.config.ts";
import { CommonConfig } from "./_common.ts";
import { defineConfig, getListFromEnvironment } from "./_helpers.ts";

const ENVIRONMENT = "DEVELOPMENT" as const;

export default defineConfig(CommonConfig, {
  admin: {
    emails: getListFromEnvironment("ADMIN_EMAILS"),
    passwords: getListFromEnvironment("ADMIN_PASSWORDS"),
  },
  environment: ENVIRONMENT,
  log: {
    severity: LoggerConfig.SeverityName.Debug,
    environment: ENVIRONMENT,
    mode: LoggerConfig.Mode.Pretty,
  },
});
