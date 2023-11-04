import { initApplication } from "@utilities/server/application.ts";
import { expect } from "chai";
import { describe, it } from "std/testing/bdd.ts";

describe("function initApplication", () => {
  const settings: Server.Settings = {
    manifest: {
      baseUrl: import.meta.url,
      routes: {},
      middlewares: {},
    },
    locals: {
      title: "Title",
      stylesheets: ["style.css"],
      scripts: [{ src: "script.js" }],
    },
    // @ts-ignore: ¯\_(ツ)_/¯
    logger: console,
  };
  const app = initApplication(settings);

  it("should return an Express application", () => {
    expect(app).to.be.a("function");
    expect(app.name).to.equal("app");
  });

  it("should return an Express application with the given locals defined", () => {
    // @ts-ignore: ¯\_(ツ)_/¯
    expect(app.locals.title).to.equal(settings.locals.title);
    // @ts-ignore: ¯\_(ツ)_/¯
    expect(app.locals.stylesheets).to.have.members(settings.locals.stylesheets);
    // @ts-ignore: ¯\_(ツ)_/¯
    expect(app.locals.scripts).to.have.members(settings.locals.scripts);
  });
});
