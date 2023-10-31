import { GITMOJIS } from "@utilities/git.data.ts";
import { Commit } from "@utilities/git.ts";
import { capitalizeText } from "@utilities/string.ts";
import { DeepPartial } from "@utilities/types.ts";
import { faker } from "faker";

export function createCommit(commit?: DeepPartial<Commit>): Commit {
  const hash = commit?.hash || faker.git.commitSha();

  return {
    hash,
    id: hash.substring(0, 7),
    timestamp: commit?.timestamp || faker.date.recent({ refDate: new Date() }),
    author: {
      name: commit?.author?.name || faker.person.fullName(),
      email: commit?.author?.email || faker.internet.email().toLowerCase(),
    },
    subject: createCommitSubject(commit?.subject),
    body: commit?.body || "",
    ref: commit?.ref || "",
  };
}

export function createRawCommit(partialCommit?: DeepPartial<Commit>): string {
  const commit = createCommit(partialCommit);

  return JSON.stringify({
    ...commit,
    timestamp: commit.timestamp.getTime() / 1000,
  });
}

export function getGitLogOutput(...commits: Commit[]) {
  const rawList = commits.map(createRawCommit);

  return rawList.join("\n");
}

export function createCommitSubject(subject?: string) {
  if (subject && subject !== "") {
    return subject;
  }

  const emoji = faker.helpers.arrayElement(GITMOJIS);
  return `${emoji.code} ${capitalizeText(faker.git.commitMessage())}`;
}
