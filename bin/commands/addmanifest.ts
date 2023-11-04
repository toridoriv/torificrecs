import {
  GetCommandHandlerOptions,
  getTemplate,
  logger,
  renderTemplate,
} from "@bin/_helpers.ts";
import { getMiddlewarePaths } from "@utilities/server/middlewares.ts";
import { getRoutesPaths, getRouteUrlFromFilePath } from "@utilities/server/routes.ts";
import { compareAlphabetically } from "@utilities/string.ts";
import ansicolors from "ansi-colors";
import { Command } from "cliffy/command/mod.ts";

type AddManifestCommandOptions = GetCommandHandlerOptions<typeof AddManifestCommand>;

const MANIFEST_TEMPLATE = getTemplate("manifest");

const AddManifestCommand = new Command()
  .name("addmanifest")
  .description("Generate the manifest file for the server.")
  .option(
    "-n, --dry-run [dry-run:boolean]",
    "Print the manifest without actually writing the file.",
    { default: false },
  )
  .action(runAction);

if (import.meta.main) {
  AddManifestCommand.parse(Deno.args);
}

export default AddManifestCommand;

function runAction(options: AddManifestCommandOptions) {
  const routePaths = getRoutesPaths();
  const middlewarePaths = getMiddlewarePaths();
  const imports: string[] = [];
  const routes: string[] = [];
  const middlewares: string[] = [];

  for (let i = 0; i < routePaths.length; i++) {
    const path = routePaths[i];
    const importName = `$route${i}`;
    const url = getRouteUrlFromFilePath(path);

    imports.push(createImportLine(importName, path));
    routes.push(`"${url}": ${importName}`);
  }

  for (let i = 0; i < middlewarePaths.length; i++) {
    const path = middlewarePaths[i];
    const importName = `$middleware${i}`;
    const url = getRouteUrlFromFilePath(path);

    imports.push(createImportLine(importName, path));
    middlewares.push(`"${url}": ${importName}`);
  }

  const manifest = renderTemplate(MANIFEST_TEMPLATE, {
    imports: imports.sort(compareAlphabetically),
    routes,
    middlewares,
  });

  if (options.dryRun) {
    logger.debug(ansicolors.underline("MANIFEST:"));
    console.info(manifest);
  } else {
    Deno.writeTextFileSync("./manifest.ts", manifest);
  }
}

function createImportLine(name: string, path: string) {
  return `import { default as ${name} } from "${path}";`;
}
