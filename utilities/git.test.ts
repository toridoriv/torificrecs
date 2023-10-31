import { createCommit, getGitLogOutput } from "@utilities/git.seeds.ts";
import {
  compareCommitsByTimestamp,
  getCommitGroup,
  getUnreleasedCommits,
  parseGitLogOutput,
} from "@utilities/git.ts";
import { expect } from "chai";
import { describe, it } from "std/testing/bdd.ts";

describe("function parseGitLogOutput", () => {
  const commits = Array.from({ length: 4 }, () => createCommit());
  const gitLogOutput = getGitLogOutput(...commits);

  it("should return an array of commit objects", () => {
    const parsed = parseGitLogOutput(gitLogOutput);

    expect(parsed.length).to.equal(commits.length);
    expect(parsed).to.eql(commits);
  });
});

describe("function compareCommitsByTimestamp", () => {
  it("should return a negative number if commit A is more recent than commit B", () => {
    const a = createCommit({ timestamp: new Date("2023-01-02") });
    const b = createCommit({ timestamp: new Date("2023-01-01") });
    const result = compareCommitsByTimestamp(a, b);

    expect(result).to.be.lessThan(0);
  });

  it("should return a positive number if commit B is more recent than commit A", () => {
    const a = createCommit({ timestamp: new Date("2023-01-01") });
    const b = createCommit({ timestamp: new Date("2023-01-02") });
    const result = compareCommitsByTimestamp(a, b);

    expect(result).to.be.greaterThan(0);
  });

  it("should return 0 if both commit were created at the same time", () => {
    const a = createCommit({ timestamp: new Date("2023-01-01") });
    const b = createCommit({ timestamp: new Date("2023-01-01") });
    const result = compareCommitsByTimestamp(a, b);

    expect(result).to.equal(0);
  });
});

describe("function getUntaggedCommits", () => {
  it("should only return commits that are not associated to a git tag", () => {
    const commits = [
      createCommit({
        timestamp: new Date("2023-01-01T23:00:00.000Z"),
        ref: "tag: v1.0.0",
      }),
      createCommit({ timestamp: new Date("2023-01-01T12:10:00.000Z") }),
      createCommit({ timestamp: new Date("2023-01-01T12:10:01.000Z") }),
      createCommit({ timestamp: new Date("2023-01-02T10:00:00.000Z") }),
      createCommit({ timestamp: new Date("2023-01-03T11:00:00.000Z") }),
    ];

    const unreleasedCommits = getUnreleasedCommits(commits);

    expect(unreleasedCommits).to.have.members(commits.slice(3));
  });
});

describe("function getCommitGroup", () => {
  it("should return `Added` if the commit subject includes an emoji belonging to that group", () => {
    const commits = [
      ":sparkles: Message",
      ":tada: (scope) Message",
      ":construction_worker: (scope) Message (#1)",
    ];
    const groups = commits.map(getCommitGroup);

    expect(groups).to.eql(["Added", "Added", "Added"]);
  });

  it("should return `Changed` if the commit subject includes an emoji belonging to that group", () => {
    const commits = [
      ":art: Message",
      ":bento: (scope) Message",
      ":building_construction: (scope) Message (#1)",
    ];
    const groups = commits.map(getCommitGroup);

    expect(groups).to.eql(["Changed", "Changed", "Changed"]);
  });

  it("should return `Breaking Changes` if the commit subject includes an emoji belonging to that group", () => {
    const commits = [
      ":boom: Message",
      ":boom: (scope) Message",
      ":boom: (scope) Message (#1)",
    ];
    const groups = commits.map(getCommitGroup);

    expect(groups).to.eql(["Breaking Changes", "Breaking Changes", "Breaking Changes"]);
  });

  it("should return `Deprecated` if the commit subject includes an emoji belonging to that group", () => {
    const commits = [
      ":wastebasket: Message",
      ":wastebasket: (scope) Message",
      ":wastebasket: (scope) Message (#1)",
    ];
    const groups = commits.map(getCommitGroup);

    expect(groups).to.eql(["Deprecated", "Deprecated", "Deprecated"]);
  });

  it("should return `Removed` if the commit subject includes an emoji belonging to that group", () => {
    const commits = [
      ":fire: Message",
      ":heavy_minus_sign: (scope) Message",
      ":mute: (scope) Message (#1)",
    ];
    const groups = commits.map(getCommitGroup);

    expect(groups).to.eql(["Removed", "Removed", "Removed"]);
  });

  it("should return `Fixed` if the commit subject includes an emoji belonging to that group", () => {
    const commits = [
      ":bug: Message",
      ":apple: (scope) Message",
      ":pencil2: (scope) Message (#1)",
    ];
    const groups = commits.map(getCommitGroup);

    expect(groups).to.eql(["Fixed", "Fixed", "Fixed"]);
  });

  it("should return `Security` if the commit subject includes an emoji belonging to that group", () => {
    const commits = [
      ":lock: Message",
      ":lock: (scope) Message",
      ":lock: (scope) Message (#1)",
    ];
    const groups = commits.map(getCommitGroup);

    expect(groups).to.eql(["Security", "Security", "Security"]);
  });

  it("should return `Release` if the commit subject includes an emoji belonging to that group", () => {
    const commits = [
      ":bookmark: Message",
      ":bookmark: (scope) Message",
      ":bookmark: (scope) Message (#1)",
    ];
    const groups = commits.map(getCommitGroup);

    expect(groups).to.eql(["Release", "Release", "Release"]);
  });

  it("should return `Miscellaneous` if the commit subject includes an emoji that does not belong to any group", () => {
    const commits = [
      ":smiling_face_with_hearts: Message",
      ":cold_face: (scope) Message",
      ":rainbow_flag: (scope) Message (#1)",
    ];
    const groups = commits.map(getCommitGroup);

    expect(groups).to.eql(["Miscellaneous", "Miscellaneous", "Miscellaneous"]);
  });
});
