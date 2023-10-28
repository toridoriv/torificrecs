import { existsSync } from "std/fs/exists.ts";
import { dirname } from "std/path/dirname.ts";

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
