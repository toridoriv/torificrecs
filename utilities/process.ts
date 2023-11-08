import { mainLogger } from "@app-logger";
import ansicolors from "ansi-colors";
import { existsSync } from "std/fs/exists.ts";
import { dirname } from "std/path/dirname.ts";

const logger = mainLogger.getSubLogger({ module: "process" });

/**
 * Custom error class for subprocess errors.
 *
 * Thrown when there is a non-zero exit code from a subprocess.
 */
export class SubprocessError extends Error {
  /**
   * Constructs a new `SubprocessError`.
   *
   * @param name - The name of the command that was executed
   * @param output - The stderr output from the failed command
   * @param args - Optional arguments passed to the command
   */
  constructor(name: string, output: Uint8Array, args?: string[]) {
    super(`There was an error executing the command ${name}.`, {
      cause: {
        args,
        output: new TextDecoder().decode(output),
      },
    });
  }
}

/**
 * Executes the given command synchronously using `Deno.Command`,
 * throwing a `SubprocessError` if the exit code is non-zero.
 *
 * @param main - The command to execute.
 * @param options - Optional options to pass to `Deno.Command`.
 * @returns The stdout output of the command as a string.
 * @throws - {@link SubprocessError}
 */
export function executeCommand(main: string, options?: Deno.CommandOptions) {
  const command = initExecuteCommand(main, options);

  const { code, stdout, stderr } = command.outputSync();

  if (code !== 0) {
    throw new SubprocessError(main, stderr, options?.args);
  }

  return new TextDecoder().decode(stdout).trim();
}

/**
 * Executes the given command asynchronously using `Deno.Command`,
 * throwing a `SubprocessError` if the exit code is non-zero.
 *
 * @param main - The command to execute.
 * @param options - Optional options to pass to `Deno.Command`.
 * @returns A promise that resolves to stdout output of the command as a string.
 * @throws - {@link SubprocessError}
 */
export async function executeCommandAsync(main: string, options?: Deno.CommandOptions) {
  const command = initExecuteCommand(main, options);

  const { code, stdout, stderr } = await command.output();

  if (code !== 0) {
    throw new SubprocessError(main, stderr, options?.args);
  }

  return new TextDecoder().decode(stdout).trim();
}

/**
 * Creates an empty file at the given filepath if the parent directory exists.
 * Uses the `touch` command to create the file.
 *
 * @param filepath - The path of the file to create.
 */
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

function initExecuteCommand(main: string, options?: Deno.CommandOptions) {
  const command = new Deno.Command(main, options);

  logger.debug(`Executing command: \n  ${formatStringCommand(main, options?.args)}`);

  return command;
}
