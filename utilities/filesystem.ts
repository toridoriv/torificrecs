export { type WalkOptions } from "std/fs/mod.ts";
import { Diff } from "@utilities/types.ts";
import { deepMerge } from "std/collections/deep_merge.ts";
import { existsSync, type WalkEntry, type WalkOptions, walkSync } from "std/fs/mod.ts";

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

export function createDirectory(path: string) {
  if (!existsSync(path)) {
    Deno.mkdirSync(path, { recursive: true });
  }

  return;
}

export function toRelativePath(path: string) {
  return `./${path}`;
}
