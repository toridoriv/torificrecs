import { withTempDirectory } from "@utilities/__test-utils__.ts";
import {
  getEntryPath,
  getFilePaths,
  writeTextFile,
  writeTextFileAsync,
} from "@utilities/filesystem.ts";
import { executeCommand, touch } from "@utilities/process.ts";
import { expect } from "chai";
import { WalkEntry } from "std/fs/walk.ts";
import { afterAll, beforeAll, describe, it } from "std/testing/bdd.ts";

const TEST_DIRECTORY = "filesystem-test";

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
  const testFiles = [
    `${TEST_DIRECTORY}/file1.txt`,
    `${TEST_DIRECTORY}/file2.txt`,
  ];

  beforeAll(() => {
    executeCommand("mkdir", { args: [TEST_DIRECTORY] });
    testFiles.forEach(touch);
  });

  afterAll(() => {
    executeCommand("rm", { args: ["-rf", TEST_DIRECTORY] });
  });

  it("should return all paths in a given directory with the options given", () => {
    const result = getFilePaths(TEST_DIRECTORY);

    expect(result).to.have.members(testFiles);
  });
});

describe("function writeTextFile", () => {
  const context = withTempDirectory("when called");

  it(
    context,
    "should synchronously create a file with the given content",
    function () {
      const path = `${this.dir}/file.txt`;
      const content = "Oops, I did it again!";
      const result = writeTextFile(path, content);

      expect(result.path).to.equal(path);
      expect(result.content).to.equal(content);
      expect(result.directory).to.equal(this.dir);
      expect(Deno.readTextFileSync(path)).to.equal(content);
    },
  );
});

describe("function writeTextFileAsync", () => {
  const context = withTempDirectory("when called");

  it(
    context,
    "should asynchronously create a file with the given content",
    async function () {
      const path = `${this.dir}/file.txt`;
      const content = "Oops, I did it again!";
      const result = await writeTextFileAsync(path, content);

      expect(result.path).to.equal(path);
      expect(result.content).to.equal(content);
      expect(result.directory).to.equal(this.dir);
      expect(Deno.readTextFileSync(path)).to.equal(content);
    },
  );
});

// const writeTextFileTest = withTempDirectory("function writeTextFile");

// it(writeTextFileTest, "should", function () {
// });

// const writeTextFileAsyncTest = withTempDirectory("function writeTextFileAsync");
