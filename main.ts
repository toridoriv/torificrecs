import { mainLogger } from "@app-logger";
import { config, type ConfigurationFile } from "@config";
import { buildTag } from "@utilities/html.ts";
import { initApplication } from "@utilities/server/application.ts";
import manifest from "./manifest.ts";

const application = initApplication({
  manifest,
  logger: mainLogger,
  locals: {
    title: config.app.title,
    stylesheets: config.app.stylesheets,
    scripts: config.app.scripts,
  },
  views: {
    partialsDir: ["views/partials/"],
    helpers: {
      script: buildTag.bind(null, "script"),
    },
  },
});

const server = application.listen(3000, handleListening);

// deno-lint-ignore require-await
async function handleListening() {
  mainLogger.info("listening");
}

server.on("close", handleClose);

Deno.addSignalListener("SIGTERM", handleKillSignal);
Deno.addSignalListener("SIGINT", handleKillSignal);

// deno-lint-ignore require-await
async function handleClose() {
  application.logger.info("Shutting down application.");
}

async function handleKillSignal() {
  console.log();
  await server.close();
}

type AppConfig = ConfigurationFile["app"];

declare global {
  namespace Express {
    interface Locals extends AppConfig {
    }
  }
}
