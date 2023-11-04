import { stubWalkSync } from "@utilities/__test-utils__.ts";
import {
  compareByPriority,
  defineMiddleware,
  getErrorMiddlewares,
  getHappyMiddlewares,
  getMiddlewarePaths,
  isErrorMiddlewareHandler,
  isMiddlewareHandler,
} from "@utilities/server/middlewares.ts";
import { expect } from "chai";
import { describe, it } from "std/testing/bdd.ts";

describe("function defineMiddleware", () => {
  it("should return the same given function", () => {
    const handlers = createRouteHandlers();
    const happyMiddleware = defineMiddleware(handlers.happy, 0);
    const errorMiddleware = defineMiddleware(handlers.error, 1);

    expect(happyMiddleware).to.equal(handlers.happy);
    expect(errorMiddleware).to.equal(handlers.error);
  });

  it("should return the same given function with the given priority defined", () => {
    const handlers = createRouteHandlers();
    const happyMiddleware = defineMiddleware(handlers.happy, 0);
    const errorMiddleware = defineMiddleware(handlers.error, 1);

    expect(happyMiddleware.priority).to.equal(0);
    expect(errorMiddleware.priority).to.equal(1);
  });
});

describe("function getMiddlewarePaths", () => {
  it("should retrieve the middleware files under the ./routes directory and replace the relative path prefix with the namespace prefix @", () => {
    const paths = ["routes/_middlewares.ts", "routes/greet/_middlewares.ts"];
    const walkSyncStub = stubWalkSync(1, ...paths);
    const result = getMiddlewarePaths();

    expect(result).to.include.members([
      "@routes/_middlewares.ts",
      "@routes/greet/_middlewares.ts",
    ]);

    walkSyncStub.restore();
  });
});

describe("function isMiddlewareHandler", () => {
  const handlers = createRouteHandlers();
  const middlewares = createMiddlewares({ happy: 0, error: 1 });

  it("should return true if the given value is compliant with a route happy handler and has a priority defined", () => {
    expect(isMiddlewareHandler(middlewares.happy)).to.be.true;
  });

  it("should return false if the given value does not have a priority defined", () => {
    expect(isMiddlewareHandler(handlers.happy)).to.be.false;
    expect(isMiddlewareHandler(handlers.error)).to.be.false;
  });

  it("should return false if the given value is compliant with a route error handler", () => {
    expect(isMiddlewareHandler(middlewares.error)).to.be.false;
  });
});

describe("function isErrorMiddlewareHandler", () => {
  const handlers = createRouteHandlers();
  const middlewares = createMiddlewares({ happy: 0, error: 1 });

  it("should return true if the given value is compliant with a route error handler and has a priority defined", () => {
    expect(isErrorMiddlewareHandler(middlewares.error)).to.be.true;
  });

  it("should return false if the given value does not have a priority defined", () => {
    expect(isErrorMiddlewareHandler(handlers.happy)).to.be.false;
    expect(isErrorMiddlewareHandler(handlers.error)).to.be.false;
  });

  it("should return false if the given value is compliant with a route happy handler", () => {
    expect(isErrorMiddlewareHandler(middlewares.happy)).to.be.false;
  });
});

describe("function compareByPriority", () => {
  const middlewares = createMiddlewares({ happy: 0, error: 1 });

  it("should return a negative number if the first handler has a lower priority number than the second", () => {
    const result = compareByPriority(middlewares.happy, middlewares.error);

    expect(result).to.be.lessThan(0);
  });
  it("should return a positive number if the first handler has a higher priority number than the second", () => {
    const result = compareByPriority(middlewares.error, middlewares.happy);

    expect(result).to.be.greaterThan(0);
  });
  it("should return 0 if both handlers have the same priority number", () => {
    const result = compareByPriority(middlewares.error, middlewares.error);

    expect(result).to.equal(0);
  });
});

describe("function getHappyMiddlewares", () => {
  const middlewares = createMiddlewares({ happy: 0, error: 1 });
  const mapping: Middlewares.Mapping = {
    "/": [middlewares.happy, middlewares.error],
  };

  it("should filter out all handlers compliant with a route error handler", () => {
    const result = getHappyMiddlewares(mapping);

    expect(result["/"].length).to.equal(1);
    expect(result["/"][0]).to.equal(middlewares.happy);
  });
});

describe("function getErrorMiddlewares", () => {
  const middlewares = createMiddlewares({ happy: 0, error: 1 });
  const mapping: Middlewares.Mapping = {
    "/": [middlewares.happy, middlewares.error],
  };

  it("should filter out all handlers compliant with a route happy handler", () => {
    const result = getErrorMiddlewares(mapping);

    expect(result["/"].length).to.equal(1);
    expect(result["/"][0]).to.equal(middlewares.error);
  });
});

function createRouteHandlers() {
  const happy: Route.HappyHandler = function doSomething(_req, _res, _next) {};
  const error: Route.ErrorHandler = function catchSomething(_error, _req, _res, _next) {};

  return { happy, error };
}

function createMiddlewares(priority: { happy: number; error: number }) {
  const handlers = createRouteHandlers();

  return {
    happy: defineMiddleware(handlers.happy, priority.happy),
    error: defineMiddleware(handlers.error, priority.error),
  };
}
