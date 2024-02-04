// Capitalize the first letter
// see https://stackoverflow.com/a/53930826/1235487
export function cap(str: string): string {
  if (!str) return '';

  const firstCodePoint = str.codePointAt(0) as number;
  const index = firstCodePoint > 0xFFFF ? 2 : 1;

  return String.fromCodePoint(firstCodePoint).toUpperCase() + str.slice(index);
}
