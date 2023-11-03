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
      hbs: ExpressHandlebars;
      logger: Logger;
    }
  }

  namespace Server {
    type ViewEngineConfig = Expand<Required<ExpressHandlebars["config"]>>;

    interface Settings {
      manifest: Server.Manifest;
      logger: Logger;
      locals: express.Locals;
      router?: express.RouterOptions;
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

export function initApplication<L>(settings: Server.Settings) {
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
