import { _dependencies } from "@utilities/filesystem.ts";
import { getRoutesPaths, getRouteUrlFromFilePath } from "@utilities/server/routes.ts";
import { expect } from "chai";
import { WalkEntry } from "std/fs/mod.ts";
import { describe, it } from "std/testing/bdd.ts";
import { returnsNext, stub } from "std/testing/mock.ts";

describe("function getRoutesPaths", () => {
  it("should", () => {
    const entryIterator: IterableIterator<WalkEntry> = startEntryIterator(
      "routes/index.ts",
      "routes/greet/[name].ts",
    );
    stub(_dependencies, "walkSync", returnsNext([entryIterator]));
    const result = getRoutesPaths();

    expect(result).to.include.members(["@routes/index.ts", "@routes/greet/[name].ts"]);
  });
});

describe("function getRouteUrlFromFilePath", () => {
  it("should correctly convert an index file path into a root URL path", () => {
    const value = "@routes/resources/index.ts";
    const result = getRouteUrlFromFilePath(value);

    expect(result).to.equal("/resources/");
  });

  it("should correctly convert a middleware file path into a root URL path", () => {
    const value = "@routes/resources/_middlewares.ts";
    const result = getRouteUrlFromFilePath(value);

    expect(result).to.equal("/resources/");
  });

  it("should correctly convert a file path between brackets into a param URL", () => {
    const value = "@routes/resources/[id].ts";
    const result = getRouteUrlFromFilePath(value);

    expect(result).to.equal("/resources/:id");
  });
});

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
