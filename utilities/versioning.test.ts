import { config } from "@config";
import { getCurrentVersion, SemVer, VersionObject } from "@utilities/versioning.ts";
import { expect } from "chai";
import { describe, it } from "std/testing/bdd.ts";

describe("class VersionObject", () => {
  it("should create a new VersionObject given a version string", () => {
    const version = "1.0.0";
    const versionObject = new VersionObject(version);

    expect(versionObject).to.be.instanceof(VersionObject);
    expect(versionObject).to.have.keys("version", "tag", "semver");
  });

  it("should create a new VersionObject given a semver object", () => {
    const version: SemVer = {
      major: 1,
      minor: 0,
      patch: 0,
      prerelease: [],
      build: [],
    };
    const versionObject = new VersionObject(version);

    expect(versionObject).to.be.instanceof(VersionObject);
    expect(versionObject).to.have.keys("version", "tag", "semver");
  });

  describe("its method", () => {
    const version = "1.0.0";
    const versionObject = new VersionObject(version);

    it(".getNextPatch should return a version object for the next Patch version", () => {
      const nextVersionObject = versionObject.getNextPatch();

      expect(nextVersionObject.version).to.equal("1.0.1");
    });

    it(".getNextMinor should return a version object for the next Minor version", () => {
      const nextVersionObject = versionObject.getNextMinor();

      expect(nextVersionObject.version).to.equal("1.1.0");
    });

    it(".getNextMajor should return a version object for the next Major version", () => {
      const nextVersionObject = versionObject.getNextMajor();

      expect(nextVersionObject.version).to.equal("2.0.0");
    });

    it(".getNextVersion should return a version object for the next version given a release type", () => {
      const patch = versionObject.getNextVersion("patch");
      const minor = versionObject.getNextVersion("minor");
      const major = versionObject.getNextVersion("major");

      expect(patch.version).to.equal("1.0.1");
      expect(minor.version).to.equal("1.1.0");
      expect(major.version).to.equal("2.0.0");
    });
  });
});

describe("function getCurrentVersion", () => {
  const currentVersion = getCurrentVersion();

  it("should create a version object based on the current version of this project", () => {
    expect(currentVersion.version).to.equal(config.version);
  });
});
