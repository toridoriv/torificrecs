/// <reference lib="dom" />

import { Expand } from "@utilities/types.ts";

export type Attributes<T extends keyof HTMLElementTagNameMap> = Expand<
  Partial<HTMLElementTagNameMap[T]>
>;

const TEXT_ATTRIBUTE_KEYS = ["text", "textContent"];

export function buildTag<T extends keyof HTMLElementTagNameMap>(
  tag: T,
  attrs: Attributes<T>,
) {
  let attributes = Object.entries(attrs).filter(isNotTextKey)
    .map(stringifyAttribute)
    .join(" ");

  if (attributes !== "") {
    attributes = ` ${attributes}`;
  }

  // @ts-ignore: ¯\_(ツ)_/¯
  const text = attrs?.text || attrs?.textContent || "";

  return `<${tag}${attributes}>${text}</${tag}>`;
}

function isNotTextKey(value: [string, unknown]) {
  return !TEXT_ATTRIBUTE_KEYS.includes(value[0]);
}

function stringifyAttribute(values: [string, unknown]) {
  const [key, value] = values;

  if (value === true) {
    return key;
  }

  return `${key.toLowerCase()}="${value}"`;
}
