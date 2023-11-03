import { addNamespacePrefix, getFilePaths } from "@utilities/filesystem.ts";

/**
 * @internal
 */
export function getMiddlewarePaths() {
  return getFilePaths("./routes", {
    exts: [".ts"],
    match: [/\_middlewares/],
  }).map(addNamespacePrefix);
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
