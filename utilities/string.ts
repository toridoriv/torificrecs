export function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function toUppercase<T>(value: T) {
  if (isString(value)) {
    return value.toUpperCase();
  }

  return value;
}

/**
 * Transforms the first letter of a sentence to uppercase.
 *
 * @param value - The text to transform.
 */
export function capitalizeText(value: string) {
  return value
    .replace(/[a-zñáéíóúü]/i, function (letter) {
      return letter.toUpperCase();
    })
    .trim();
}

/**
 * Compares two strings alphabetically.
 *
 * @param a - The first string to compare.
 * @param b - The second string to compare.
 * @returns A negative number if a < b, positive if a > b, 0 if a === b.
 */
export function compareAlphabetically(a: string, b: string) {
  return a.localeCompare(b);
}

/**
 * Replaces all occurrences of keys in the provided map with their corresponding values in the input string.
 *
 * @param value - The input string to replace values in
 * @param map - The key/value map of strings to replace
 * @returns The input string with all keys replaced by their values
 */
export function replaceContents(value: string, map: Record<string, string>) {
  let retValue = value;

  for (const key in map) {
    retValue = retValue.replaceAll(key, map[key]);
  }

  return retValue;
}
