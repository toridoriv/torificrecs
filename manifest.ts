/**
 * @file Contains the mapping of the routes and its correspondent route handlers and
 * middlewares. It's automatically generated using the command `deno task manage addmanifest`.
 */
import { default as $route0 } from "@routes/index.ts";
import { default as $middleware0 } from "@routes/_middlewares.ts";

const manifest: Server.Manifest = {
  routes: {
    "/": $route0,
  },
  middlewares: {
    "/": $middleware0,
  },
  baseUrl: import.meta.url,
}

export default manifest;