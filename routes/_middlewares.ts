import { buildTag } from "@utilities/html.ts";
import { defineMiddleware } from "@utilities/server/middlewares.ts";
import { difference } from "std/datetime/difference.ts";
import { Status, STATUS_TEXT } from "std/http/status.ts";
import { ErrorPage } from "../app/pages/error-page.ts";

const inspectRequest = defineMiddleware(function inspectRequest(
  req,
  res,
  next,
) {
  req.id = globalThis.crypto.randomUUID();
  res.duration = 0.1;
  const start = new Date();
  res.on("finish", function handleFinish() {
    const end = new Date();
    res.duration = difference(start, end, { units: ["milliseconds"] })
      .milliseconds as number;

    res.app.logger.http(req, res);
  });

  next();
}, 0);

const handleNotFound = defineMiddleware(function handleNotFound(
  req,
  res,
  _next,
) {
  const status = Status.NotFound;
  const errorName = STATUS_TEXT[status];
  const view = new ErrorPage({
    status,
    subtitle: errorName,
    error: errorName,
    message: req.url,
    partials: {
      message: res.app.hbs.handlebars.compile(
        buildTag("code", { textContent: "{{message}}" }),
        {},
      ),
    },
  });

  return res.status(status).render(view.name, view.context);
}, 1);

export default [inspectRequest, handleNotFound];

declare global {
  namespace Express {
    interface Request {
      id: string;
    }
    interface Response {
      duration: number;
    }
  }
}
