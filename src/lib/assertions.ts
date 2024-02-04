export function assert(test: any): asserts test {
  if (!test) { throw Error("assertion failed"); }
}
