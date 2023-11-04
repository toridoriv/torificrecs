import { addNamespacePrefix, getFilePaths } from "@utilities/filesystem.ts";
import { replaceContents } from "@utilities/string.ts";
import { Expand, SafeAny } from "@utilities/types.ts";
import express from "express";
import type { ExpressHandlebars } from "express-handlebars";

/**
 * Defines the route handlers for the router.
 *
 * This returns a function that accepts the route handlers
 * and returns them so they can be exported as the default export.
 *
 * @returns A function that accepts and returns the route handlers.
 */
export function defineRouteHandlers<O extends Route.HandlersOptions>() {
  return function initRouteHandlers<Handlers extends Route.Handlers<O>>(
    handlers: Handlers,
  ) {
    return handlers;
  };
}

/**
 * Creates an Express router from the provided route mapping.
 *
 * @param mapping - The route mapping to generate the router for.
 * @param options - Options to pass to the Express router.
 * @returns The configured Express router instance.
 */
export function createRouter(
  mapping: Route.Mapping,
  options: express.RouterOptions = {},
) {
  const router = express.Router(options);

  for (const path in mapping) {
    const routeHandlers = mapping[path];

    for (const _ in routeHandlers) {
      const method = _ as Route.Method;
      const handlers = (
        Array.isArray(routeHandlers[method])
          ? routeHandlers[method]
          : [routeHandlers[method]]
      ) as Route.Handler[];

      router[method](path, ...handlers);
    }
  }

  return router;
}

/**
 * Checks if the given value is a route error handler function.
 *
 * @returns `true` if value is a function with 4 arguments (error handler signature)
 * or if the function name includes "NotFound". Otherwise returns `false`.
 */
export function isRouteErrorHandler(
  value: unknown,
): value is Route.ErrorHandler {
  if (typeof value !== "function") {
    return false;
  }

  return value.length === 4 || value.name.includes("NotFound");
}

/**
 * Checks if the given value is a happy route handler function.
 *
 * @returns `true` if the value is a function with 3 arguments (happy handler signature)
 * and its name does not include "NotFound". Otherwise returns `false`.
 */
export function isRouteHappyHandler(
  value: unknown,
): value is Route.HappyHandler {
  if (typeof value !== "function") {
    return false;
  }

  return value.length === 3 && !value.name?.includes("NotFound");
}

/**
 * Retrieves all route handler file paths from the routes directory.
 *
 * @returns Array of namespace-prefixed paths to route handler modules.
 */
export function getRoutesPaths() {
  return getFilePaths("./routes", {
    exts: [".ts"],
    skip: [/\_/],
  }).map(addNamespacePrefix);
}

/**
 * Generates a route URL path from a file path.
 *
 * Replaces namespace prefixes, filenames, and extensions
 * in the provided path to create a cleaned route URL.
 */
export function getRouteUrlFromFilePath(path: string) {
  return replaceContents(path, {
    "@routes": "",
    "index.ts": "",
    "_middlewares.ts": "",
    "[": ":",
    "]": "",
    ".ts": "",
  });
}

declare global {
  /**
   * Namespace for route handler types and interfaces.
   */
  namespace Route {
    /**
     * Type alias for the route handlers mapping.
     * Maps route paths to the handler functions.
     */
    type Mapping = Record<string, Handlers>;

    /**
     * Options for route handlers.
     *
     * Defines the possible request and response types that can be used in route handlers.
     */
    interface HandlersOptions {
      params?: SafeAny;
      reqBody?: SafeAny;
      query?: SafeAny;
      resBody?: SafeAny;
      locals?: SafeAny;
    }

    /**
     * Type for a route handler that does not return an error.
     *
     * @param req - The request object.
     * @param res - The response object.
     * @param next - The next middleware function.
     * @returns The result of the route handler logic.
     */
    type HappyHandler<O extends HandlersOptions = HandlersOptions> = (
      req: Request<O>,
      res: Response<O>,
      next: express.NextFunction,
    ) => SafeAny | Promise<SafeAny>;

    /**
     * Type for a route error handler function.
     *
     * @param error - The error object.
     * @param req - The request object.
     * @param res - The response object.
     * @param next - The next middleware function.
     * @returns The result of the error handler logic.
     */
    type ErrorHandler<O extends HandlersOptions = HandlersOptions> = (
      error: Error,
      req: Request<O>,
      res: Response<O>,
      next: express.NextFunction,
    ) => SafeAny | Promise<SafeAny>;

    /**
     * Type alias for a route handler function.
     * A route handler can be a normal handler or an error handler.
     */
    type Handler<O extends HandlersOptions = HandlersOptions> =
      | HappyHandler<O>
      | ErrorHandler<O>;

    /**
     * Route handlers object.
     *
     * Maps {@link express.Router} methods to route handler functions.
     */
    type Handlers<O extends HandlersOptions = HandlersOptions> = Partial<
      Record<Method, HappyHandler<O> | HappyHandler<O>[]>
    >;

    type Method = Exclude<keyof express.Router, "param" | "stack" | "route">;

    /**
     * Request type for route handlers.
     *
     * Extends the Express Request type to include the route handler options for type safety.
     *
     * @param O - Route handler options
     */
    type Request<O extends HandlersOptions = HandlersOptions> = express.Request<
      O["params"],
      O["resBody"],
      O["reqBody"],
      O["query"],
      O["locals"]
    >;

    /**
     * Response type for route handlers.
     *
     * Extends the Express Response type to include the route handler options for type safety.
     *
     * @param O - Route handler options
     */
    interface Response<O extends HandlersOptions = HandlersOptions>
      extends Omit<express.Response, "render" | "status"> {
      status(status: number): Response<O>;
      render: RenderFn;
    }

    /**
     * Options for rendering a view template.
     */
    type RenderViewOptions = Expand<
      Parameters<ExpressHandlebars["renderView"]>[1]
    >;

    /**
     *  Type for the render function on the route {@link Route.Response} object.
     *
     * @param name - The name of the view template.
     * @param options - Optional view render options.
     */
    type RenderFn = (name: string, options?: RenderViewOptions) => void;
  }
}
