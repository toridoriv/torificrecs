import { addNamespacePrefix, getFilePaths } from "@utilities/filesystem.ts";
import { isRouteErrorHandler, isRouteHappyHandler } from "@utilities/server/routes.ts";
import { mapValues } from "std/collections/map_values.ts";

export function defineMiddleware<O extends Route.HandlersOptions>(
  handler: Route.HappyHandler<O>,
  priority: number,
): Middlewares.Middleware<O>;

export function defineMiddleware<O extends Route.HandlersOptions>(
  handler: Route.ErrorHandler<O>,
  priority: number,
): Middlewares.Middleware<O>;

/**
 * Defines a middleware handler by assigning it a priority property.
 * This allows middleware to be sorted by priority order.
 */
export function defineMiddleware(
  handler: Route.Handler,
  priority: number,
) {
  Object.defineProperty(handler, "priority", {
    value: priority,
    enumerable: true,
  });

  return handler;
}

/**
 * @internal
 */
export function getMiddlewarePaths() {
  return getFilePaths("./routes", {
    exts: [".ts"],
    match: [/\_middlewares/],
  }).map(addNamespacePrefix);
}

/**
 * Checks if the given value is a valid middleware handler function.
 *
 * A middleware handler is a function that meets the Route.HappyHandler interface
 * and has a numeric priority property.
 */
export function isMiddlewareHandler(
  value: unknown,
): value is Middlewares.Middleware {
  return (
    isRouteHappyHandler(value) &&
    typeof (value as Middlewares.Middleware)?.priority === "number"
  );
}

/**
 * Checks if the given value is a valid error middleware handler function.
 *
 * An error middleware handler is a function that meets the Route.ErrorHandler interface
 * and has a numeric priority property.
 */
export function isErrorMiddlewareHandler(
  value: unknown,
): value is Middlewares.ErrorMiddleware {
  return (
    isRouteErrorHandler(value) &&
    typeof (value as Middlewares.ErrorMiddleware)?.priority === "number"
  );
}

/**
 * Compares two middleware handler by their priority number.
 *
 * @returns
 * - A negative number if `handler1` has a lower priority number than `handler2`.
 * - A positive number if `handler1` has a higher priority number than `handler2`.
 * - `0` if they have the same priority number.
 */
export function compareByPriority(
  handler1: Middlewares.Options,
  handler2: Middlewares.Options,
) {
  return handler1.priority - handler2.priority;
}

/**
 * Filters the given middleware map to only happy middlewares,
 * sorts them by priority, and returns the filtered map.
 *
 * @param map - The middleware map to filter and sort.
 * @returns A new map with only the happy middlewares, sorted by priority.
 */
export function getHappyMiddlewares(map: Middlewares.Mapping) {
  return mapValues(
    map,
    (middlewares) => middlewares.filter(isMiddlewareHandler).sort(compareByPriority),
  );
}

/**
 * Filters the given middleware map to only error middlewares,
 * sorts them by priority, and returns the filtered map.
 *
 * @param map - The middleware map to filter and sort.
 * @returns A new map with only the error middlewares, sorted by priority.
 */
export function getErrorMiddlewares(map: Middlewares.Mapping) {
  return mapValues(
    map,
    (middlewares) => middlewares.filter(isErrorMiddlewareHandler).sort(compareByPriority),
  );
}

declare global {
  namespace Middlewares {
    type AnyMiddleware = Middleware | ErrorMiddleware;

    type Mapping = Record<string, AnyMiddleware[]>;

    type Options = {
      priority: number;
    };

    /**
     * ErrorMiddleware is a type that extends Route.ErrorHandler and adds
     * the properties `priority` and `path`.
     *
     * It represents middleware that handles errors for the route.
     *
     * @param O - Type of route handler options. Defaults to {@link Route.HandlersOptions}.
     */
    type ErrorMiddleware<
      O extends Route.HandlersOptions = Route.HandlersOptions,
    > = Route.ErrorHandler<O> & {
      priority: number;
      path: string;
    };

    /**
     * Type alias for middleware functions.
     *
     * Middleware extends Route.HappyHandler and adds the properties `priority` and `path`.
     *
     * @param O - Type of route handler options. Defaults to {@link Route.HandlersOptions}.
     */
    type Middleware<O extends Route.HandlersOptions = Route.HandlersOptions> =
      & Route.HappyHandler<O>
      & {
        priority: number;
        path: string;
      };
  }
}
