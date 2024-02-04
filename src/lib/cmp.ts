import { Container, Leaf } from "@ldo/solid";

export function cmpResource(a: Container | Leaf, b: Container | Leaf): number {
  return cmpStr(a.type, b.type) || cmpStr(a.uri, b.uri)
}

export function cmpAtId(a: { '@id'?: string }, b: { '@id'?: string }): number {
  return cmpStr(a['@id'], b['@id'])
}

export function cmpStr(a: string | undefined, b: string | undefined): number {
  a = a || "";
  b = b || "";
  if (a < b) { return -1; }
  else if (a > b) { return 1; }
  else { return 0; }
}
