import { mainLogger } from "@app-logger";
import ansicolors from "ansi-colors";
import { existsSync } from "std/fs/exists.ts";
import { dirname } from "std/path/dirname.ts";

const logger = mainLogger.getSubLogger({ module: "process" });

export class SubprocessError extends Error {
  constructor(name: string, output: Uint8Array, args?: string[]) {
    super(`There was an error executing the command ${name}.`, {
      cause: {
        args,
        output: new TextDecoder().decode(output),
      },
    });
  }
}

export function executeCommand(main: string, options?: Deno.CommandOptions) {
  const command = new Deno.Command(main, options);

  logger.debug(`Executing command: \n  ${formatStringCommand(main, options?.args)}`);

  const { code, stdout, stderr } = command.outputSync();

  if (code !== 0) {
    throw new SubprocessError(main, stderr, options?.args);
  }

  return new TextDecoder().decode(stdout).trim();
}

export function touch(filepath: string) {
  const dir = dirname(filepath);

  if (existsSync(dir)) {
    executeCommand("touch", { args: [filepath] });
  }
}

function formatStringCommand(command: string, args: string[] = []) {
  const prompt = ansicolors.greenBright("$");
  const cmd = ansicolors.greenBright.bold(command);
  const opts = ansicolors.white(args.join(" "));

  return ansicolors.bgBlack(`${prompt} ${cmd} ${opts}`);
}
