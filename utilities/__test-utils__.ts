import { _dependencies } from "@utilities/filesystem.ts";
import { _internals as gitInternals, type Commit } from "@utilities/git.ts";
import { type WalkEntry } from "std/fs/walk.ts";
import { returnsNext, stub } from "std/testing/mock.ts";

export function stubWalkSync(times = 1, ...paths: string[]) {
  const iterators = Array.from({ length: times }, () => startEntryIterator(...paths));

  return stub(_dependencies, "walkSync", returnsNext(iterators));
}

export function stubRetrieveFirstCommit(times = 1, ...commits: Commit[]) {
  const values = Array.from({ length: times }, (_, i) => commits[i]);

  return stub(gitInternals, "retrieveFirstCommit", returnsNext(values));
}

function* startEntryIterator(...paths: string[]) {
  let i = 0;

  while (i < paths.length) {
    const entry: WalkEntry = {
      isFile: true,
      isDirectory: false,
      isSymlink: false,
      path: paths[i],
      name: "",
    };

    i = i + 1;

    yield entry;
  }
}
