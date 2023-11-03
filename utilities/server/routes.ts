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
  return function <Handlers extends Route.Handlers<O>>(handlers: Handlers) {
    return handlers;
  };
}

/**
 * @internal
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

    type RenderViewOptions = Expand<
      Parameters<ExpressHandlebars["renderView"]>[1]
    >;

    type RenderFn = (name: string, options?: RenderViewOptions) => void;
  }
}
