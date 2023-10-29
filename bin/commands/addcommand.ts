import { writeCommandFile } from "@bin/_helpers.ts";
import { Command } from "cliffy/command/mod.ts";
import { Input } from "cliffy/prompt/mod.ts";

const CreateCommand = new Command()
  .name("addcommand")
  .description("Add a new command to the bin/commands directory.")
  .action(runAction);

if (import.meta.main) {
  CreateCommand.parse(Deno.args);
}

export default CreateCommand;

async function runAction(this: typeof CreateCommand) {
  let dir = "";
  const constName = await Input.prompt({
    message: "Insert the name of the constant for this command",
  });
  let name = await Input.prompt({
    message: "Insert the name for this command",
  });
  const description = await Input.prompt({
    message: "Insert a description for the command",
  });

  if (name.includes("/")) {
    [dir, name] = name.split("/");
  }

  writeCommandFile(dir, { constName, description, name });
}
