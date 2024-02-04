// Useful namespaces

const SOLID = "http://www.w3.org/ns/solid/terms#";
const RDF = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
const RDFS = "http://www.w3.org/2000/01/rdf-schema#";
const XSD = "http://www.w3.org/2001/XMLSchema#";

export const solid = {
  forClass: SOLID + 'forClass',
  TypeRegistration: SOLID + 'TypeRegistration',
}

export const rdf = {
  langString: RDF + 'langString',
  type: RDF + 'type',
};

export const rdfs = {
  label: RDFS + 'label',
  seeAlso: RDFS + 'seeAlso',
};

export const xsd = {
  boolean: XSD + 'boolean',
  datetime: XSD + 'dateTime',
  decimal: XSD + 'decimal',
  double: XSD + 'double',
  float: XSD + 'float',
  integer: XSD + 'integer',
  string: XSD + 'string',
};

export const SPOTY = "https://w3id.org/SpOTy/ontology#";

export const spoty = {
  SentenceCollection: SPOTY + 'SentenceCollection',
  Sentence: SPOTY + 'Sentence',
  language: SPOTY + 'language',
  trajectoiresId: SPOTY + 'trajectoiresId',
};

export const WDT= "http://www.wikidata.org/prop/direct/";

export const wdt = {
  P220: WDT + "P220",
};

