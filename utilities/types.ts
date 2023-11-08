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
 * Type representing an empty object type where all properties are `never`.
 * Useful for representing objects with no properties.
 */
export type EmptyRecord = Record<string | number | symbol, never>;

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
export type Diff<T1, T2> = T1 extends NativeObject ? T1
  : T1 extends AnyRecord ? T2 extends AnyRecord ? Expand<Omit<T1, keyof T2>> : T1
  : T1;

/**
 * Returns a type representing the recursive difference between two object types T1 and T2.
 * For each key in T1, it checks if that key exists in T2. If so, it recursively checks the difference between the values.
 * If the key doesn't exist in T2, the original T1 value is kept.
 */
export type DeepDiff<T1, T2> = {
  [
    P in keyof T1 as P extends keyof T2 ? T2[P] extends NativeObject ? never
      : T2[P] extends AnyRecord ? EmptyRecord extends Diff<T1[P], T2[P]> ? never : P
      : never
      : P
  ]: P extends keyof T2 ? Diff<T1[P], T2[P]> : T1[P];
};

/**
 * Makes all properties in T optional.
 */
export type DeepPartial<T> = T extends NativeObject ? T
  : T extends AnyRecord ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

/**
 * Makes the properties specified in K optional in type T.
 */
export type MakeOptional<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>;

/**
 * Makes the properties specified in K required in type T.
 */
export type MakeRequired<T, K extends keyof T> = Required<Pick<T, K>> & Omit<T, K>;

/**
 * Excludes any properties with `never` type from type T.
 *
 * This is useful for cleaning up types after mapped types that may
 * introduce `never` properties.
 *
 * @example
 *
 * ```ts
 * type Test = {
 *   foo: string;
 *   bar?: never;
 * }
 *
 * type Clean = ExcludeNever<Test>;
 * // { foo: string }
 * ```
 */
export type ExcludeNever<T> = {
  [
    K in keyof T as NonNullable<T[K]> extends never ? never
      : K
  ]: T[K] extends Array<infer L> ? L extends AnyRecord ? ExcludeNever<L>[]
    : T[K]
    : T[K] extends AnyRecord ? ExcludeNever<T[K]>
    : T[K];
};

/**
 * Type representing a JSON value, which can be a {@link Primitive}, `array`, or `object`.
 */
export type JsonValue = Primitive | JsonValue[] | {
  [key: PropertyKey]: JsonValue;
};

/**
 * Represents a primitive value.
 */
export type Primitive = string | number | null | undefined | boolean;

// deno-lint-ignore ban-types
type NativeObject = Date | String | Number | Function;
