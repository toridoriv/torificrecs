import packageJson from "@packageJson" assert { type: "json" };

export const CommonConfig = {
  port: packageJson.config.port,
  version: packageJson.version,
  app: {
    title: packageJson.displayName,
    description: packageJson.description,
    stylesheets: [
      "https://cdn.jsdelivr.net/npm/halfmoon@2.0.1/css/halfmoon.min.css",
      "https://cdn.jsdelivr.net/npm/halfmoon@2.0.1/css/cores/halfmoon.modern.css",
      "https://cdn.jsdelivr.net/npm/victormono@latest/dist/index.min.css",
      "/styles/main.css",
    ],
    scripts: [
      {
        async: true,
        src: "https://kit.fontawesome.com/a1f28487fc.js",
        crossorigin: "anonymous",
      },
      {
        async: true,
        src:
          "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js",
        crossorigin: "anonymous",
        integrity:
          "sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL",
      },
      { src: "/scripts/main.js", type: "module" },
    ],
  },
  log: {
    application: packageJson.name,
    version: packageJson.version,
  },
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};
