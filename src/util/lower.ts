// Helper function for detection objects
export const isObject = (obj: unknown) =>
  Object.prototype.toString.call(obj) === "[object Object]";

// Helper function for detection arrays
export const isArray = (obj: unknown) => Array.isArray(obj);

// The entry point for recursion, iterates and maps object properties
export const lowerCaseObjectKeys = (obj: object): object =>
  Object.fromEntries(Object.entries(obj).map(objectKeyMapper));

// The entry point for recursion, iterates and maps object properties
export const lowerCaseArraysKeys = (obj: unknown[]): unknown[] =>
  obj.map((val) =>
    isObject(val)
      ? lowerCaseObjectKeys(val as object)
      : isArray(val)
      ? lowerCaseArraysKeys(val as [])
      : val,
  );

export function lowerFirstLetter(str: string) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}
// Converts keys to lowercase, detects object values
// and sends them off for further conversion
export const objectKeyMapper = ([key, val]: [string, unknown]): [
  string,
  unknown,
] => [
  lowerFirstLetter(key),
  isObject(val)
    ? lowerCaseObjectKeys(val as object)
    : isArray(val)
    ? lowerCaseArraysKeys(val as [])
    : val,
];
