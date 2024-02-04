import { Literal, NamedNode, Term } from "@rdfjs/types";

export function makeNamedNode(uri: string): NamedNode {
  return {
    termType: "NamedNode",
    value: uri,
    equals: (other: Term | null | undefined) => { 
      return !!other && other.termType === 'NamedNode' && other.value === uri
    },
  }
}

export function makeLiteral(lex: string, dt: string): Literal {
  const datatype = makeNamedNode(dt);
  return {
    termType: "Literal",
    value: lex,
    datatype: datatype,
    language: "",
    equals: (other: Term | null | undefined) => { 
      return !!other && other.termType === 'Literal' && other.value === lex && other.datatype === datatype
    },
  }
}
