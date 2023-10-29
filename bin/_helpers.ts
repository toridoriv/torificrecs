import {
  addNamespacePrefix,
  createDirectory,
  getPublicFilePaths,
  PathRetrievalOptions,
} from "@utilities/filesystem.ts";
import { mainLogger } from "@utilities/logger.ts";
import { Command } from "cliffy/command/mod.ts";
import Mustache from "mustache";

const COMMAND_TEMPLATE = getTemplate("command");

export const logger = mainLogger.getSubLogger({
  module: "bin",
  mode: "PRETTY",
});

export async function registerCommands(
  mainCommand: Command,
  dir: string,
  options: PathRetrievalOptions = {},
) {
  const paths = getPublicFilePaths(dir, options).map(addNamespacePrefix);

  for (let i = 0; i < paths.length; i++) {
    const { default: command } = await import(paths[i]);

    if (command instanceof Command) {
      mainCommand.command(command.getName(), command);
    }
  }
}

export function getTemplate(name: string) {
  return Deno.readTextFileSync(`./bin/templates/${name}.mustache`);
}

interface CommandFileContext {
  constName: string;
  description: string;
  name: string;
}

export function writeCommandFile(dir: string, context: CommandFileContext) {
  const directory = `./bin/commands/${dir}`;

  createDirectory(directory);

  const path = `${directory}/${context.name}.ts`.replace("//", "/");
  const content = Mustache.render(COMMAND_TEMPLATE, context);

  logger.debug(`Writing command at ${path}`);

  return Deno.writeTextFileSync(path, content);
}