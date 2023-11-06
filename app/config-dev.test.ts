import { ConfigurationFile } from "@config";
import { expect } from "chai";
import { afterAll, beforeAll, describe, it } from "std/testing/bdd.ts";

describe("object config when ENVIRONMENT is DEVELOPMENT", () => {
  const environmentCache = Deno.env.get("ENVIRONMENT") as string;
  let config = {} as ConfigurationFile;

  beforeAll(async () => {
    Deno.env.set("ENVIRONMENT", "DEVELOPMENT");
    Deno.env.set("ADMIN_EMAILS", "admin1@example.org,admin2@example.org");
    Deno.env.set("ADMIN_PASSWORDS", "abc123,def456");
    config = await importConfigObject();
  });

  afterAll(() => {
    Deno.env.set("ENVIRONMENT", environmentCache);
    Deno.env.delete("ADMIN_EMAILS");
    Deno.env.delete("ADMIN_PASSWORDS");
  });

  it("should have the property environment set to DEVELOPMENT", () => {
    expect(config.environment).to.equal("DEVELOPMENT");
  });

  it("should obtain the admin emails from the environment variables", () => {
    expect(config.admin.emails).to.include.members([
      "admin1@example.org",
      "admin2@example.org",
    ]);
  });

  it("should obtain the admin passwords from the environment variables", () => {
    expect(config.admin.passwords).to.include.members([
      "abc123",
      "def456",
    ]);
  });
});

async function importConfigObject() {
  const { config } = await import(`./config.ts`);

  return config as ConfigurationFile;
}
