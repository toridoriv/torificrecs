import { DEFAULT_EMOJI_GROUP, EMOJI_MAP } from "@utilities/git.data.ts";
import { executeCommand } from "@utilities/process.ts";
import { groupBy } from "std/collections/group_by.ts";
import { z } from "zod";

const commitFormat = {
  hash: "%H",
  id: "%h",
  timestamp: "%ad",
  author: {
    name: "%an",
    email: "%ae",
  },
  subject: "%s",
  body: "%b",
  ref: "%D",
};

const CommitSchema = z.object({
  /**
   * The commit hash.
   */
  hash: z.string(),
  /**
   * The commit ID - the short hash.
   */
  id: z.string(),
  /**
   * The commit timestamp.
   */
  timestamp: z.preprocess(parseDate, z.date()),
  /**
   * The author of the commit, containing their name and email address.
   */
  author: z.object({
    name: z.string(),
    email: z.string(),
  }),
  /**
   * The commit subject line.
   */
  subject: z.string(),
  /**
   * The commit message body.
   */
  body: z.string(),
  /**
   * The commit reference - the branch or tag name.
   */
  ref: z.string(),
});

/**
 * The Commit type, which represents a parsed Git commit.
 */
export type Commit = z.TypeOf<typeof CommitSchema>;

export type CommitLabel =
  | (typeof EMOJI_MAP)[number]["label"]
  | (typeof DEFAULT_EMOJI_GROUP)["label"];

/**
 * Parses the output of `git log` into a list of {@link Commit} objects.
 *
 * Takes the raw output string from `git log` and converts it into
 * a list of Commit objects by splitting the output into lines,
 * JSON-parsing each line into a raw commit object, and mapping
 * the raw commits through the parseCommit function.
 *
 * @param output - The raw output of `git log`.
 * @returns An array of {@link Commit} objects.
 */
export function parseGitLogOutput(output: string) {
  const rawList: unknown[] = JSON.parse(`[${output.split("\n").join(",")}]`);

  return rawList.map(parseCommit);
}

/**
 * Compares two commit timestamps to determine which commit is more recent.
 *
 * @param a - The first commit to compare
 * @param b - The second commit to compare
 * @returns
 *  - A negative number if `a` is more recent than `b`.
 *  - A positive number if `b` is more recent than `a`.
 *  - `0` if `a` and `b` have the same timestamp.
 */
export function compareCommitsByTimestamp(a: Commit, b: Commit) {
  return b.timestamp.getTime() - a.timestamp.getTime();
}

/**
 * Gets all commits from the provided list that are not associated with a git tag.
 *
 * Sorts the commits from newest to oldest, then iterates through looking for the first tagged commit.
 * Returns all commits up to the first tagged one.
 *
 * Useful for getting a list of commits since the last release.
 */
export function getUnreleasedCommits(commits: Commit[]) {
  const sortedDesc = commits.sort(compareCommitsByTimestamp).toReversed();
  const untagged = [] as Commit[];

  for (let i = 0; i < sortedDesc.length; i++) {
    const commit = sortedDesc[i];

    if (commit.ref.includes("tag")) {
      return untagged;
    }

    untagged.push(commit);
  }

  return untagged;
}

/**
 * Gets the commit group label for the given commit subject.
 *
 * Extracts the emoji from the commit subject and looks it up
 * in the {@link EMOJI_MAP} constant to find the matching group label.
 * Falls back to {@link DEFAULT_EMOJI_GROUP} if no match.
 *
 * @param subject - The commit subject to get the group label for
 * @returns The commit group label
 */
export function getCommitGroup(subject: string): CommitLabel {
  const emojiMatch = subject.match(/:\w+:/);

  if (emojiMatch === null) {
    throw new Error("No emoji found :(", { cause: { subject } });
  }

  const emoji = emojiMatch[0].replaceAll(":", "");

  for (let i = 0; i < EMOJI_MAP.length; i++) {
    const group = EMOJI_MAP[i];

    if (group.emojis.includes(emoji)) {
      return group.label;
    }
  }

  return DEFAULT_EMOJI_GROUP.label;
}

/**
 * Retrieves all commits since the last version tag, groups them by its commit type, and returns the grouped commits.
 *
 * Executes `git log` to get all commits, parses the output, filters to only unreleased commits, adds a label based on the commit emoji,
 * groups the labeled commits, and returns the grouped commits.
 *
 * Used to generate the commit info for the next version's changelog.
 */
export function retrieveCommitsForNextVersion() {
  const output = executeCommand("git", {
    args: [
      "log",
      "--tags",
      "--all",
      "--date=format:%s",
      `--pretty=format:${JSON.stringify(commitFormat)}`,
    ],
  });
  const allCommits = parseGitLogOutput(output).sort(compareCommitsByTimestamp);
  const unreleased = getUnreleasedCommits(allCommits).map(addGroupLabel);
  const grouped = groupBy(unreleased, (c) => c.label);

  return Object.entries(grouped).map(([kind, commits]) => ({
    kind: kind as CommitLabel,
    commits,
  }));
}

function parseCommit(rawCommit: unknown) {
  return CommitSchema.parse(rawCommit);
}

function parseDate(date: unknown) {
  const asNumber = Number(date);

  if (!Number.isNaN(asNumber)) {
    return new Date(asNumber * 1000);
  }

  return date;
}

function addGroupLabel(commit: Commit): Commit & { label: CommitLabel } {
  return {
    ...commit,
    label: getCommitGroup(commit.subject),
  };
}
