import { executeCommand, SubprocessError, touch } from "@utilities/process.ts";
import { expect } from "chai";
import { existsSync } from "std/fs/exists.ts";
import { afterAll, beforeAll, describe, it } from "std/testing/bdd.ts";

describe("function executeCommand", () => {
  it("should return the output of a given command", () => {
    const echoHi = executeCommand("echo", { args: ["Hi!"] });

    expect(echoHi).to.equal("Hi!");
  });

  it("should throw if a nonexistent command is given", () => {
    expect(executeCommand.bind(null, "missingCommand")).to.throw(Deno.errors.NotFound);
  });

  it("should throw if the given command fails", () => {
    expect(executeCommand.bind(null, "deno", { args: ["asdf"] })).to.throw(
      SubprocessError,
    );
  });
});

describe("function touch", () => {
  const testDir = "process-test";
  const testFile = `${testDir}/file1.txt`;

  beforeAll(() => {
    executeCommand("mkdir", { args: [testDir] });
  });

  afterAll(() => {
    executeCommand("rm", { args: ["-rf", testDir] });
  });

  it("if the directory exists, should create a file with the given path", () => {
    touch(testFile);

    expect(existsSync(testFile)).to.equal(true);
  });

  it("if the directory does not exist, should do nothing", () => {
    const testFile2 = "missing-dir/file2.txt";
    touch(testFile2);

    expect(existsSync(testFile2)).to.equal(false);
  });
});
