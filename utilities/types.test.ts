import type { Diff } from "@utilities/types.ts";
import { describe, it } from "std/testing/bdd.ts";
import { assertType, type IsExact } from "std/testing/types.ts";

describe("type Diff", () => {
  it("should return a type that excludes the keys of T2 from T1", () => {
    type DefaultOptions = {
      name: string;
    };

    type Options = {
      name?: string;
      version?: string;
      port?: number;
    };

    type OptionsDiff = Diff<Options, DefaultOptions>;
    assertType<IsExact<OptionsDiff, { version?: string; port?: number }>>(
      true,
    );
  });
});
