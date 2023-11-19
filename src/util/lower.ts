// Helper function for detection objects
export const isObject = (object: unknown) =>
  Object.prototype.toString.call(object) === "[object Object]";

// Helper function for detection arrays
export const isArray = (object: unknown) => Array.isArray(object);

// The entry point for recursion, iterates and maps object properties
export const lowerCaseObjectKeys = (object: object): object =>
  Object.fromEntries(Object.entries(object).map((x) => objectKeyMapper(x)));

// The entry point for recursion, iterates and maps object properties
export const lowerCaseArraysKeys = (object: unknown[]): unknown[] =>
  object.map((value) =>
    isObject(value)
      ? lowerCaseObjectKeys(value as object)
      : isArray(value)
        ? lowerCaseArraysKeys(value as [])
        : value,
  );

export function lowerFirstLetter(string_: string) {
  return string_.charAt(0).toLowerCase() + string_.slice(1);
}
// Converts keys to lowercase, detects object values
// and sends them off for further conversion
export const objectKeyMapper = ([key, value]: [string, unknown]): [
  string,
  unknown,
] => [
  lowerFirstLetter(key),
  isObject(value)
    ? lowerCaseObjectKeys(value as object)
    : isArray(value)
      ? lowerCaseArraysKeys(value as [])
      : value,
];
