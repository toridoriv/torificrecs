import { ConfigurationFile } from "@config";
import { expect } from "chai";
import { afterAll, beforeAll, describe, it } from "std/testing/bdd.ts";

describe("object config when ENVIRONMENT is TEST", () => {
  const environmentCache = Deno.env.get("ENVIRONMENT") as string;
  let config = {} as ConfigurationFile;

  beforeAll(async () => {
    Deno.env.set("ENVIRONMENT", "TEST");
    config = await importConfigObject();
  });

  afterAll(() => {
    Deno.env.set("ENVIRONMENT", environmentCache);
  });

  it("should have the property environment set to TEST", () => {
    expect(config.environment).to.equal("TEST");
  });
});

async function importConfigObject() {
  const { config } = await import(`./config.ts`);

  return config as ConfigurationFile;
}
