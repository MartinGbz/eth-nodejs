export const replacer = (key: unknown, value: unknown) =>
  typeof value === "bigint" ? { $bigint: value.toString() } : value;

export const reviver = (key: unknown, value: unknown) =>
  value !== null &&
  typeof value === "object" &&
  "$bigint" in value &&
  typeof value.$bigint === "string"
    ? BigInt(value.$bigint)
    : value;
