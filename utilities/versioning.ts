export type { SemVer } from "std/semver/mod.ts";

import { config } from "@config";
import { format, increment, parse, type SemVer } from "std/semver/mod.ts";

const NEXT_VERSION_METHOD_BY_RELEASE_TYPE = {
  patch: "getNextPatch",
  minor: "getNextMinor",
  major: "getNextMajor",
} as const;

/** The type of release to perform when generating the next version. */
export type ReleaseType = keyof typeof NEXT_VERSION_METHOD_BY_RELEASE_TYPE;

/**
 * Represents a version object that encapsulates a semantic version and provides methods
 * to obtain the next version based on different release types.
 */
export class VersionObject {
  /**
   * Get the method name to retrieve the next version based on the specified release type.
   *
   * @param type - The type of release (major, minor, or patch).
   * @returns The name of the method for obtaining the next version.
   */
  static getMethodNameByReleaseType(type: ReleaseType) {
    return NEXT_VERSION_METHOD_BY_RELEASE_TYPE[type];
  }

  readonly version: string;
  readonly tag: string;
  readonly semver: SemVer;

  constructor(rawVersion: string | SemVer) {
    if (typeof rawVersion === "string") {
      this.version = rawVersion;
      this.semver = parse(rawVersion);
    } else {
      this.semver = rawVersion;
      this.version = format(this.semver);
    }

    this.tag = `v${this.version}`;
  }

  /**
   * Get the next version by the specified release type.
   *
   * @param type - The type of release (major, minor, or patch).
   * @returns A new `VersionObject` instance representing the next version.
   */
  getNextVersion(type: ReleaseType) {
    return this[VersionObject.getMethodNameByReleaseType(type)]();
  }

  /**
   * Get the next patch version.
   *
   * @returns A new VersionObject instance representing the next patch version.
   */
  getNextPatch() {
    return new VersionObject(increment(this.semver, "patch"));
  }

  /**
   * Get the next minor version.
   *
   * @returns A new VersionObject instance representing the next minor version.
   */
  getNextMinor() {
    return new VersionObject(increment(this.semver, "minor"));
  }

  /**
   * Get the next major version.
   *
   * @returns A new VersionObject instance representing the next major version.
   */
  getNextMajor() {
    return new VersionObject(increment(this.semver, "major"));
  }
}

/**
 * Gets the current version number from the project configuration.
 *
 * @returns A VersionObject instance representing the current version.
 */
export function getCurrentVersion() {
  return new VersionObject(config.version);
}
