import { getEntryPath, getFilePaths } from "@utilities/filesystem.ts";
import { executeCommand, touch } from "@utilities/process.ts";
import { expect } from "chai";
import { WalkEntry } from "std/fs/walk.ts";
import { afterAll, beforeAll, describe, it } from "std/testing/bdd.ts";

describe("function getEntryPath", () => {
  it("should return only the path of an entry", () => {
    const entry: WalkEntry = {
      name: "file",
      isFile: true,
      isDirectory: false,
      isSymlink: false,
      path: "file://path-to-file/file.ts",
    };

    expect(getEntryPath(entry)).to.equal(entry.path);
  });
});

describe("function getFilePaths", () => {
  const testDir = "filesystem-test";
  const testFiles = [`${testDir}/file1.txt`, `${testDir}/file2.txt`];

  beforeAll(() => {
    executeCommand("mkdir", { args: [testDir] });
    testFiles.forEach(touch);
  });

  afterAll(() => {
    executeCommand("rm", { args: ["-rf", testDir] });
  });

  it("should return all paths in a given directory with the options given", () => {
    const result = getFilePaths(testDir);

    expect(result).to.have.members(testFiles);
  });
});
