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

export function replaceAt(value: string, index: number, replacement: string, length = 1) {
  return value.substring(0, index) + replacement + value.substring(index + length);
}

export function insertAt(value: string, index: number, replacement: string) {
  return value.substring(0, index) + replacement + value.substring(index);
}
