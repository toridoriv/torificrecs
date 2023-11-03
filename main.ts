import { config } from "@config";
import { Attributes, buildTag } from "@utilities/html.ts";
import { mainLogger } from "@utilities/logger.ts";
import { initApplication } from "@utilities/server/application.ts";
import manifest from "./manifest.ts";

const application = initApplication({
  manifest,
  logger: mainLogger,
  locals: {
    title: config.project.name,
    stylesheets: [
      "https://cdn.jsdelivr.net/npm/halfmoon@2.0.1/css/halfmoon.min.css",
      "https://cdn.jsdelivr.net/npm/halfmoon@2.0.1/css/cores/halfmoon.modern.css",
      "https://cdn.jsdelivr.net/npm/victormono@latest/dist/index.min.css",
      "/styles/main.css",
    ],
    scripts: [
      {
        async: true,
        src: "https://kit.fontawesome.com/a1f28487fc.js",
        crossOrigin: "anonymous",
      },
      {
        async: true,
        src:
          "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js",
        crossOrigin: "anonymous",
        integrity:
          "sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL",
      },
      { src: "/scripts/main.js", type: "module" },
    ],
  },
  views: {
    partialsDir: ["views/partials/"],
    helpers: {
      script: buildTag.bind(null, "script"),
    },
  },
});

const server = application.listen(3000, handleListening);

async function handleListening() {
  mainLogger.info("listening");
}

server.on("close", handleClose);

Deno.addSignalListener("SIGTERM", handleKillSignal);
Deno.addSignalListener("SIGINT", handleKillSignal);

async function handleClose() {
  // if (database.isConnected) {
  //   await database.close();
  // }

  application.logger.info("Shutting down application.");
}

async function handleKillSignal() {
  console.log();
  await server.close();
}

declare global {
  namespace Express {
    interface Locals {
      title: string;
      stylesheets: string[];
      scripts: Attributes<"script">[];
    }
  }
}
