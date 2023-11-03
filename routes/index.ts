import { Homepage } from "@pages/homepage.ts";
import { defineRouteHandlers } from "@utilities/server/routes.ts";
import { Status } from "std/http/status.ts";

export default defineRouteHandlers()({
  get: function Home(_req, res, _next) {
    const view = new Homepage({ subtitle: "" });

    return res.status(Status.OK).render(view.name, view.context);
  },
});
