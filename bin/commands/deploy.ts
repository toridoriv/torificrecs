import { GetCommandHandlerOptions, logger } from "@bin/_helpers.ts";
import { executeCommandAsync } from "@utilities/process.ts";
import { Command } from "cliffy/command/mod.ts";

type DeployCommandOptions = GetCommandHandlerOptions<typeof DeployCommand>;

const CONFIGURATION_FILE_PATH = "./app/config/production.ts";
const CONFIGURATION_FILE = Deno.readTextFileSync(CONFIGURATION_FILE_PATH);

const DeployCommand = new Command()
  .name("deploy")
  .description("Deploy an instance of this application.")
  .option("-p, --preview", "Deploys on preview mode.", {
    conflicts: ["production"],
    required: true,
  })
  .option("-P, --production", "Deploys on production mode.", {
    conflicts: ["preview"],
    required: true,
  })
  .option(
    "-n, --dry-run [dry-run:boolean]",
    "Simulate the deployment process.",
    { default: false },
  )
  .action(runAction);

if (import.meta.main) {
  DeployCommand.parse(Deno.args);
}

export default DeployCommand;

async function runAction(options: DeployCommandOptions) {
  const args = getDeployTaskArgs(options);

  await patchConfigurationFile()
    .then(executeCommandAsync.bind(null, "deno", { args }))
    .then(console.log)
    .finally(restoreConfigurationFile);
}

function getDeployTaskArgs(options: DeployCommandOptions) {
  const args = ["task", "deploy"];

  if (options.dryRun) {
    logger.debug("Using dry run mode.");
    args.push("--dry-run");
  }

  if (options.production) {
    logger.debug("Set deploy mode to production");
    args.push("--prod");
  } else {
    logger.debug("Set deploy mode to preview");
  }

  args.push("main.ts");

  return args;
}

function patchConfigurationFile() {
  logger.debug(`Setting IS_PREVIEW to true in ${CONFIGURATION_FILE_PATH}`);

  const fileContent = CONFIGURATION_FILE.replace(
    "const IS_PREVIEW = false;",
    "const IS_PREVIEW = true;",
  );

  return Deno.writeTextFile(CONFIGURATION_FILE_PATH, fileContent);
}

function restoreConfigurationFile() {
  logger.debug(`Restoring configuration file at ${CONFIGURATION_FILE_PATH}`);
  return Deno.writeTextFile(CONFIGURATION_FILE_PATH, CONFIGURATION_FILE);
}
