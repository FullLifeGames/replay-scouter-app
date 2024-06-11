export const toRawDeep = <T>(observed: T): T => {
  const value = toRaw(observed);

  if (Array.isArray(value)) {
    return value.map((element) => toRawDeep(element)) as T;
  }

  if (value === null) return null as T;

  if (typeof value === "object") {
    const entries = Object.entries(value).map(([key, value_]) => [
      key,
      toRawDeep(value_),
    ]);

    return Object.fromEntries(entries);
  }

  return value;
};
