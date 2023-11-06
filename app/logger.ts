import { config } from "@config";
import { Logger } from "@utilities/logger.ts";

export const mainLogger = new Logger(config.log);
