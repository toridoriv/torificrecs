import { getFilePaths, toRelativePath } from "@utilities/filesystem.ts";
import { getRouteUrlFromFilePath } from "@utilities/server/routes.ts";
import express from "express";
import { Status } from "std/http/status.ts";
import { extname } from "std/path/extname.ts";

const CONTENT_TYPE_BY_FILE_EXTENSION = {
  ".png": "image/png",
  ".ico": "image/png",
  ".webmanifest": "application/json",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".css": "text/css",
  ".txt": "text/plain",
};

const ONE_MONTH = 30 * 24 * 60 * 60;

export const _internals = {
  getFileExtension,
  getHandler,
  readFileSync,
};

/**
 * Creates an Express router to serve static assets.
 *
 * Gets a list of all files in the provided directory, converts the file paths
 * to route handler options using `toHandlerOptions`, and registers a GET route
 * for each path.
 *
 * This allows serving static assets directly from the file system.
 *
 * @param dir - The directory containing the static assets.
 * @returns An Express router instance to serve the static assets.
 */
export function createAssetsRouter(dir: string) {
  const router = express.Router();
  const assets = getFilePaths(dir).map(toRelativePath)
    .map(toHandlerOptions.bind(null, dir));

  assets.forEach((asset) => {
    router.get(asset.path, asset.handler);
  });

  return router;
}

/**
 * Converts a file path to handler options used for routing.
 *
 * The handler serves the content with the correct content type
 * and sets cache headers.
 *
 * @param dir - The directory containing the assets.
 * @param path - The file path to convert.
 * @returns The handler options object.
 * @internal
 */
export function toHandlerOptions(dir: string, path: string) {
  const content = _internals.readFileSync(path);
  const ext = _internals.getFileExtension(path);

  return {
    path: getRouteUrlFromFilePath(path.replace(dir, "")),
    handler: getHandler(ext, content),
  };
}

function readFileSync(path: string | URL) {
  return Deno.readFileSync(path);
}

function getHandler(
  ext: keyof typeof CONTENT_TYPE_BY_FILE_EXTENSION,
  content: Uint8Array,
) {
  return function getAsset(
    _req: Route.Request,
    res: Route.Response,
    _next: express.NextFunction,
  ) {
    const contentType = CONTENT_TYPE_BY_FILE_EXTENSION[ext];

    res.setHeader("content-type", contentType);
    res.setHeader("cache-control", "max-age=" + ONE_MONTH + ", immutable");

    return res.status(Status.OK).end(content, "binary");
  };
}

function getFileExtension(path: string) {
  return extname(path) as keyof typeof CONTENT_TYPE_BY_FILE_EXTENSION;
}
