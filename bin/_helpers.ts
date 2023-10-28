import {
  addNamespacePrefix,
  getPublicFilePaths,
  PathRetrievalOptions,
} from "@utilities/filesystem.ts";
import { Command } from "cliffy/command/mod.ts";

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
