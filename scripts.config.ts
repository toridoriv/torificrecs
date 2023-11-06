import type { DenonConfig } from "denon";

const config: DenonConfig = {
  scripts: {
    start: {
      cmd: "main.ts",
      desc: "Run my webserver",
      watch: true,
      env: {
        ENVIRONMENT: "DEVELOPMENT",
      },
    },
  },
  allow: "all",
  unstable: true,
  watcher: {
    interval: 1_000,
    skip: ["**/.git/**", "**/bin/**"],
    paths: ["utilities", "routes", "public", "main.ts", "views", "app"],
    exts: ["ts", "css", "mjs", "json", "webmanifest", "hbs", "js"],
  },
};

export default config;
