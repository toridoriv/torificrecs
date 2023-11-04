import { stubWalkSync } from "@utilities/__test-utils__.ts";
import {
  createRouter,
  defineRouteHandlers,
  getRoutesPaths,
  getRouteUrlFromFilePath,
  isRouteErrorHandler,
  isRouteHappyHandler,
} from "@utilities/server/routes.ts";
import { expect } from "chai";
import { describe, it } from "std/testing/bdd.ts";

describe("function getRoutesPaths", () => {
  it("should retrieve the paths under the ./routes directory and replace the relative path prefix with the namespace prefix @", () => {
    const paths = ["routes/index.ts", "routes/greet/[name].ts"];
    const walkSyncStub = stubWalkSync(1, ...paths);
    const result = getRoutesPaths();

    expect(result).to.include.members(["@routes/index.ts", "@routes/greet/[name].ts"]);

    walkSyncStub.restore();
  });
});

describe("function getRouteUrlFromFilePath", () => {
  it("should correctly convert an index file path into a root URL path", () => {
    const value = "@routes/resources/index.ts";
    const result = getRouteUrlFromFilePath(value);

    expect(result).to.equal("/resources/");
  });

  it("should correctly convert a middleware file path into a root URL path", () => {
    const value = "@routes/resources/_middlewares.ts";
    const result = getRouteUrlFromFilePath(value);

    expect(result).to.equal("/resources/");
  });

  it("should correctly convert a file path between brackets into a param URL", () => {
    const value = "@routes/resources/[id].ts";
    const result = getRouteUrlFromFilePath(value);

    expect(result).to.equal("/resources/:id");
  });
});

describe("function isRouteErrorHandler", () => {
  const errorHandler = (_: unknown, __: unknown, ___: unknown, ____: unknown) => {};
  const notFoundHandler = function NotFound(__: unknown, ___: unknown, ____: unknown) {};
  const happyHandler = (_: unknown, __: unknown, ___: unknown) => {};

  it("should return true if a handler receives 4 arguments", () => {
    const result = isRouteErrorHandler(errorHandler);

    expect(result).to.be.true;
  });

  it("should return true if the handler contains NotFound on its name", () => {
    const result = isRouteErrorHandler(notFoundHandler);

    expect(result).to.be.true;
  });

  it("should return false if a handler receives less than 4 arguments", () => {
    const result = isRouteErrorHandler(happyHandler);

    expect(result).to.be.false;
  });

  it("should return false if a value is not a function", () => {
    const result = isRouteErrorHandler([1, 2, 3, 4]);

    expect(result).to.be.false;
  });
});

describe("function isRouteHappyHandler", () => {
  const errorHandler = (_: unknown, __: unknown, ___: unknown, ____: unknown) => {};
  const notFoundHandler = function NotFound(__: unknown, ___: unknown, ____: unknown) {};
  const happyHandler = (_: unknown, __: unknown, ___: unknown) => {};
  const anotherFn = () => {};

  it("should return true if a handler receives 3 arguments", () => {
    const result = isRouteHappyHandler(happyHandler);

    expect(result).to.be.true;
  });

  it("should return false if a handler receives more or less than 3 arguments", () => {
    const result1 = isRouteHappyHandler(errorHandler);
    const result2 = isRouteHappyHandler(anotherFn);

    expect(result1).to.be.false;
    expect(result2).to.be.false;
  });

  it("should return false if the handler contains NotFound on its name", () => {
    const result = isRouteHappyHandler(notFoundHandler);

    expect(result).to.be.false;
  });

  it("should return false if a value is not a function", () => {
    const result = isRouteHappyHandler([1, 2, 3]);

    expect(result).to.be.false;
  });
});

describe("function createRouter", () => {
  const mapping: Route.Mapping = {
    "/": {
      get(_, __, ___) {},
    },
    "/cats": {
      get: [(_, __, ___) => {}, (_, __, ___) => {}],
    },
  };

  it("should create and return an Express router", () => {
    const router = createRouter(mapping);

    expect(router.name).to.equal("router");
  });

  it("should create and return an Express router with the given options", () => {
    const router = createRouter(mapping, { mergeParams: true });

    // @ts-ignore: ¯\_(ツ)_/¯
    expect(router.mergeParams).to.be.true;
  });

  it("should register all routes given in the handlers mapping", () => {
    const router = createRouter(mapping);

    expect(router.stack[0].route.path).to.equal("/");
    expect(router.stack[0].route.stack.length).to.equal(1);
    expect(router.stack[1].route.path).to.equal("/cats");
    expect(router.stack[1].route.stack.length).to.equal(2);
  });
});

describe("function defineRouteHandlers", () => {
  const initRouteHandlers = defineRouteHandlers();
  const handlers: Route.Handlers = {
    get(_, __, ___) {},
  };

  it("should return a the initRouteHandlers function", () => {
    expect(initRouteHandlers.name).to.equal("initRouteHandlers");
  });

  it("the initRouteHandlers function should return the handlers it received", () => {
    expect(initRouteHandlers(handlers)).to.equal(handlers);
  });
});
