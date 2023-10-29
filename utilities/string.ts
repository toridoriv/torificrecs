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
