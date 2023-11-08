export { type WalkOptions } from "std/fs/mod.ts";

import { Diff, JsonValue } from "@utilities/types.ts";
import { deepMerge } from "std/collections/deep_merge.ts";
import { existsSync, type WalkEntry, type WalkOptions, walkSync } from "std/fs/mod.ts";
import { dirname } from "std/path/mod.ts";

const GET_PATHS_DEFAULTS = {
  includeDirs: false,
  includeFiles: true,
};

export const _dependencies = {
  walkSync,
};

export type PathRetrievalOptions = Diff<WalkOptions, typeof GET_PATHS_DEFAULTS>;

export function getFilePaths(
  dir: string,
  options: PathRetrievalOptions = {},
) {
  const entries = _dependencies.walkSync(dir, { ...GET_PATHS_DEFAULTS, ...options });

  return [...entries].map(getEntryPath);
}

const GET_PUBLIC_PATHS_DEFAULTS = {
  skip: [/_/, /\.test/, /\.seeds/],
};

export function getPublicFilePaths(dir: string, options: PathRetrievalOptions = {}) {
  const opts = deepMerge(options, GET_PUBLIC_PATHS_DEFAULTS);

  return getFilePaths(dir, opts);
}

export function getEntryPath(entry: WalkEntry) {
  return entry.path;
}

export function addNamespacePrefix(path: string) {
  return `@${path}`;
}

/**
 * Creates a directory at the given path recursively.
 *
 * This function will create the directory at the provided path, creating any missing parent
 * directories along the way. For example, if the path is "a/b/c" and only "a" exists, then
 * "b" and "c" will also be created.
 *
 * @param path - The file path for the directory to create
 *
 * @example
 * ```typescript
 * // Create "foo/bar/baz"
 * createDirectory("foo/bar/baz");
 * ```
 */
export function createDirectory(path: string) {
  if (!existsSync(path)) {
    Deno.mkdirSync(path, { recursive: true });
  }

  return;
}

export function toRelativePath(path: string) {
  return `./${path}`;
}

/**
 * Writes the given content to a text file at the specified path.
 * Creates the directory for the path if it does not already exist.
 *
 * The content is stringified as JSON if it is not already a string.
 * This allows passing in complex data structures to be written as a file.
 *
 * @param path - The file path to write to
 * @param value - The content to write to the file
 * @returns Object containing the path, content written, and directory created
 *
 * @example
 * ```typescript
 * const data = {message: "Hello World"};
 * const result = writeTextFile("path/to/file.txt", data);
 *
 * console.log(result);
 * // {
 * //   path: "path/to/file.txt",
 * //   content: '{"message":"Hello World"}',
 * //   directory: "path/to"
 * // }
 * ```
 */
export function writeTextFile(path: string, value: JsonValue) {
  const directory = dirname(path);
  const content = typeof value === "string" ? value : JSON.stringify(value, null, 2);

  createDirectory(directory);

  Deno.writeTextFileSync(path, content);

  return { path, content, directory };
}

/**
 * Writes the given content to a text file asynchronously at the specified path.
 * Creates the directory for the path if it does not already exist.
 *
 * This is an async version of the {@link writeTextFile} function. It writes the file contents
 * asynchronously and returns a Promise instead of the synchronous return value.
 *
 * @param path - The file path to write to
 * @param value - The content to write to the file
 * @returns Promise that resolves with an object containing the path, content, and directory created
 *
 * @example
 * ```typescript
 * const data = {message: "Hello World"};
 * const result = await writeTextFileAsync("path/to/file.txt", data);
 *
 * console.log(result);
 * // {
 * //   path: "path/to/file.txt",
 * //   content: '{"message":"Hello World"}',
 * //   directory: "path/to"
 * // }
 * ```
 */
export async function writeTextFileAsync(path: string, value: JsonValue) {
  const directory = dirname(path);
  const content = typeof value === "string" ? value : JSON.stringify(value, null, 2);

  createDirectory(directory);

  await Deno.writeTextFile(path, content);

  return { path, content, directory };
}
