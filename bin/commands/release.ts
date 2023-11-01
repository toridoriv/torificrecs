import {
  GetCommandHandlerOptions,
  getTemplate,
  logger,
  renderTemplate,
} from "@bin/_helpers.ts";
import { config } from "@config";
import { getReleaseObject, ReleaseObject, retrieveAllCommits } from "@utilities/git.ts";
import { executeCommand } from "@utilities/process.ts";
import { getCurrentVersion } from "@utilities/versioning.ts";
import ansicolors from "ansi-colors";
import { Command } from "cliffy/command/mod.ts";

type ReleaseCommandOptions = GetCommandHandlerOptions<typeof ReleaseCommand>;

const RELEASE_NOTES_TEMPLATE = getTemplate("release-notes");

const ReleaseCommand = new Command()
  .name("release")
  .description("Release a new version of this application.")
  .option("-M, --major", "Release a major version.", {
    conflicts: ["minor", "patch"],
    required: true,
  })
  .option("-m, --minor", "Release a minor version.", {
    conflicts: ["major", "patch"],
    required: true,
  })
  .option("-p, --patch", "Release a patch version", {
    conflicts: ["minor", "major"],
    required: true,
  })
  .option(
    "-n, --dry-run [dry-run:boolean]",
    "Print the release notes without actually making a new release.",
    { default: false },
  )
  .action(runAction);

if (import.meta.main) {
  ReleaseCommand.parse(Deno.args);
}

export default ReleaseCommand;

function runAction(options: ReleaseCommandOptions) {
  const currentVersion = getCurrentVersion();
  const releaseType = getReleaseType(options);
  const nextVersion = currentVersion.getNextVersion(releaseType);
  const allCommits = retrieveAllCommits();
  const releaseDetails = getReleaseObject(nextVersion.version, allCommits);
  const notes = getReleaseNotes(releaseDetails);
  const packageJson = getUpdatedPackageJson(nextVersion.version);

  if (options.dryRun) {
    logger.debug(ansicolors.underline("NOTES:"));
    console.info(notes);

    logger.debug(ansicolors.underline("PACKAGE.JSON:"));
    console.info(packageJson);
  } else {
    Deno.writeTextFileSync("./package.json", packageJson);
    triggerRelease(nextVersion.tag, notes);
  }
}

function getReleaseType(options: ReleaseCommandOptions) {
  return Object.keys(options)[0] as "major" | "minor" | "patch";
}

function getReleaseNotes(details: ReleaseObject) {
  const changes = Object.values(details.changes).filter((c) => c.commits.length > 0);

  return renderTemplate(RELEASE_NOTES_TEMPLATE, {
    ...details,
    changes,
  });
}

function getUpdatedPackageJson(version: string) {
  const packageJson = config.project;
  packageJson.version = version;

  return JSON.stringify(packageJson, null, 2);
}

function triggerRelease(tag: string, notes: string) {
  executeCommand("git", {
    args: ["tag", "-a", tag, "-m", `${tag}\n\n${notes}`],
  });

  logger.info(`Tag ${tag} created!`);

  executeCommand("git", { args: ["push", "--follow-tags"] });

  logger.info(`Code pushed to Github!`);

  executeCommand("gh", {
    args: ["release", "create", tag, "--notes-from-tag"],
  });

  logger.info(`Release created ✨`);
}
