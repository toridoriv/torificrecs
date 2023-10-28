import { registerCommands } from "@bin/_helpers.ts";
import { Command } from "cliffy/command/mod.ts";

const ManageCommand = new Command()
  .name("manage")
  .description("Manage all available commands for this project.")
  .action(function () {
    this.showHelp();
  });

await registerCommands(ManageCommand, "./bin/commands", {
  maxDepth: 1,
  exts: [".ts"],
  skip: [/_/],
});

ManageCommand.parse(Deno.args);
