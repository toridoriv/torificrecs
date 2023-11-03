import {
  compareAlphabetically,
  replaceContents,
  toUppercase,
} from "@utilities/string.ts";
import { expect } from "chai";
import { describe, it } from "std/testing/bdd.ts";

describe("function compareAlphabetically", () => {
  it("should return a negative number if a comes before b", () => {
    const result = compareAlphabetically("Car", "Zoo");
    expect(result).to.be.lessThan(0);
  });

  it("should return a positive number if b comes before a", () => {
    const result = compareAlphabetically("Zoo", "Car");
    expect(result).to.be.greaterThan(0);
  });

  it("should return zero if a and b are equals", () => {
    const result = compareAlphabetically("Car", "Car");
    expect(result).to.equal(0);
  });
});

describe("function replaceContents", () => {
  it("should replace all occurrences of keys in the provided map with their corresponding values in the input string", () => {
    const value = "./some/path/to/file/[id].ts";
    const result = replaceContents(value, { "./": "/", "[": ":", "]": "", ".ts": "" });

    expect(result).to.equal("/some/path/to/file/:id");
  });
});

describe("function toUppercase", () => {
  it("should uppercase a string", () => {
    const value = "owo";
    const result = toUppercase(value);

    expect(result).to.equal("OWO");
  });

  it("should return the received value if is not a string", () => {
    const value = 1;
    const result = toUppercase(value);

    expect(result).to.equal(value);
  });
});
