export { type WalkOptions } from "std/fs/mod.ts";
import { Diff } from "@utilities/types.ts";
import { deepMerge } from "std/collections/deep_merge.ts";
import { type WalkEntry, type WalkOptions, walkSync } from "std/fs/mod.ts";

const GET_PATHS_DEFAULTS = {
  includeDirs: false,
  includeFiles: true,
};

export type PathRetrievalOptions = Diff<WalkOptions, typeof GET_PATHS_DEFAULTS>;

export function getFilePaths(
  dir: string,
  options: PathRetrievalOptions = {},
) {
  const entries = walkSync(dir, { ...GET_PATHS_DEFAULTS, ...options });

  return [...entries].map(getEntryPath);
}

const GET_PUBLIC_PATHS_DEFAULTS = {
  skip: [/_/],
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
