import {
  addNamespacePrefix,
  createDirectory,
  getPublicFilePaths,
  PathRetrievalOptions,
} from "@utilities/filesystem.ts";
import { mainLogger } from "@utilities/logger.ts";
import { compareAlphabetically } from "@utilities/string.ts";
import { SafeAny } from "@utilities/types.ts";
import { Command } from "cliffy/command/mod.ts";
import Mustache from "mustache";

type AnyCommand = Command<SafeAny, SafeAny, SafeAny, SafeAny>;

export type GetCommandHandlerArgs<C extends AnyCommand> = [
  this: C,
  ...Parameters<Parameters<C["action"]>[0]>,
];

export type GetCommandHandlerOptions<C extends AnyCommand> = GetCommandHandlerArgs<C>[1];

const COMMAND_TEMPLATE = getTemplate("command");

export const logger = mainLogger.getSubLogger({
  module: "bin",
  mode: "PRETTY",
  inspectOptions: {
    strAbbreviateSize: 9_000,
  },
});

export async function registerCommands(
  mainCommand: Command,
  dir: string,
  options: PathRetrievalOptions = {},
) {
  const paths = getPublicFilePaths(dir, options)
    .map(addNamespacePrefix)
    .sort(compareAlphabetically);

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

export function renderTemplate(template: string, context: unknown) {
  return Mustache.render(template, context);
}
