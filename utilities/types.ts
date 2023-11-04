/**
 * Instead of adding a `disable` directive, use this value
 * to indicate that an any type is expected that way purposely.
 */
// deno-lint-ignore no-explicit-any
export type SafeAny = any;

/**
 * Represents any possible array.
 */
export type AnyArray = Array<SafeAny>;

/**
 * Represents a function that can accept any number of arguments
 * of any type and returns a value of any type.
 *
 * This is useful for representing loosely typed callback functions
 * where the arguments and return value are not known or relevant.
 */
export type AnyFunction = (...args: AnyArray) => SafeAny;

/**
 * Represents an object type where the keys can be
 * either strings or numbers, and the values are any type.
 *
 * This is useful for representing loose object types where
 * the keys and values are not known ahead of time.
 */
export type AnyRecord = Record<string | number | symbol, SafeAny>;

/**
 * Takes a type T and expands it to an object type with all properties set to their original types.
 *
 * @example
 * ```ts
 *  // On hover: interface Person
 * interface Person {
 *   name: string;
 *   age: number;
 * }
 *
 * // On hover: type ExpandedPerson = { name: string; age: number }
 * type ExpandedPerson = Expand<Person>;
 * ```
 */
export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

/**
 * Recursively expands a type T to an object type with all nested properties mapped to their original types.
 * This is like {@link Expand} but works recursively to expand nested object properties.
 *
 * @example
 * ```ts
 * // On hover: interface Person
 * interface Person {
 *   name: string;
 *   address: {
 *     street: string;
 *     city: string;
 *   }
 * }
 *
 * // On hover: type RecursivePerson = {
 * //   name: string;
 * //   address: {
 * //     street: string;
 * //     city: string;
 * //   }
 * // }
 * type RecursivePerson = ExpandRecursively<Person>;
 * ```
 */
export type ExpandRecursively<T, Unless = null> = T extends object
  ? T extends infer O ? O extends Unless ? O
    : {
      [K in keyof O]: O[K] extends AnyFunction ? O[K]
        : ExpandRecursively<O[K], Unless>;
    }
  : never
  : T;

/**
 * Returns a type that represents the difference between two types T1 and T2.
 * It omits the keys in T2 from T1.
 */
export type Diff<T1, T2> = Expand<Omit<T1, keyof T2>>;

/**
 * Makes all properties in T optional.
 */
export type DeepPartial<T> = T extends NativeObject ? T
  : T extends AnyRecord ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export type MakeOptional<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>;

export type MakeRequired<T, K extends keyof T> = Required<Pick<T, K>> & Omit<T, K>;

// deno-lint-ignore ban-types
type NativeObject = Date | String | Number | Function;
