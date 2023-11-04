import "@utilities/server/manifest.ts";

import { Logger } from "@utilities/logger.ts";
import {
  getErrorMiddlewares,
  getHappyMiddlewares,
} from "@utilities/server/middlewares.ts";
import { createAssetsRouter } from "@utilities/server/public.ts";
import { createRouter } from "@utilities/server/routes.ts";
import { Expand, MakeOptional } from "@utilities/types.ts";
import express from "express";
import { create, type ExpressHandlebars } from "express-handlebars";
import { deepMerge } from "std/collections/deep_merge.ts";

declare global {
  namespace Express {
    interface Application {
      /**
       * The Express Handlebars instance used for rendering views.
       */
      hbs: ExpressHandlebars;
      /**
       * The logger instance registered in the Express application.
       */
      logger: Logger;
    }
  }

  namespace Server {
    /**
     * Configuration options for the Express Handlebars view engine.
     * It extends the required properties from the {@link ExpressHandlebars} config interface.
     */
    type ViewEngineConfig = Expand<Required<ExpressHandlebars["config"]>>;

    /**
     * The Settings interface defines the configuration options for initializing the Express application.
     */
    interface Settings {
      /**
       * The server manifest containing routes, middlewares, base URL, etc.
       */
      manifest: Server.Manifest;
      /**
       * The logger instance to use.
       */
      logger: Logger;
      /**
       * The default locals to make available in all views.
       */
      locals: express.Locals;
      /**
       * Optional router configuration.
       */
      router?: express.RouterOptions;
      /**
       * Optional view engine configuration.
       */
      views?: Partial<ViewEngineConfig>;
    }
  }
}

const DEFAULT_ENGINE_CONFIG: MakeOptional<
  Server.ViewEngineConfig,
  "handlebars" | "compilerOptions" | "runtimeOptions" | "defaultLayout" | "layoutsDir"
> = {
  extname: ".hbs",
  encoding: "utf-8",
  partialsDir: "partials",
  helpers: {},
};

/**
 * Initializes an Express application instance with the provided settings.
 * Configures the view engine, routers, middleware mappings, and locals.
 *
 * @param settings
 * @returns The initialized app instance.
 */
export function initApplication(settings: Server.Settings) {
  const app = express();
  const engineConfig = deepMerge(DEFAULT_ENGINE_CONFIG, settings.views || {});
  const hbs = create(engineConfig);

  Object.assign(app.locals, settings.locals);

  app.set("views", "./views");
  app.engine(engineConfig.extname, hbs.engine);
  app.set("view engine", engineConfig.extname);

  app.hbs = hbs;
  app.logger = settings.logger;

  const happyMiddlewares = getHappyMiddlewares(settings.manifest.middlewares);

  for (const path in happyMiddlewares) {
    app.use(path, ...happyMiddlewares[path]);
  }

  const assetsRouter = createAssetsRouter("./public");
  const router = createRouter(settings.manifest.routes, settings.router);
  app.use(assetsRouter);
  app.use(router);

  const errorMiddlewares = getErrorMiddlewares(settings.manifest.middlewares);
  for (const path in errorMiddlewares) {
    app.use(path, ...errorMiddlewares[path]);
  }

  return app;
}
