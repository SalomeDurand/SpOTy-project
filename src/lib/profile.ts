// A library of functions for accessing the user's extended profile.

import { useLdo, useSolidAuth, useSubject } from "@ldo/solid-react";
import { SolidLdoDataset } from "@ldo/solid";
import { SolidProfileShapeShapeType } from "../.ldo/solidProfile.shapeTypes";
import { parseRdf } from "@ldo/ldo";
import { ContainerUri } from "@ldo/solid";
import { useCallback, useEffect } from "react";
import { SolidProfileShape } from "../.ldo/solidProfile.typings";
import { NamedNode, Quad, Term } from "@rdfjs/types";
import { rdfs } from "./ns";

// TODO maybe create a class that derives from SolidProfileShape,
// with *methods* for getting the name, the storages, etc...
// That class should also store the webId

// Get the profile of the logged-in in user, if it is loaded.
export function useProfile(): SolidProfileShape | undefined {
  const { session } = useSolidAuth();
  return useSubject(SolidProfileShapeShapeType, session.webId);
}

// Get the best available name for the given profile.
export function getName(profile: SolidProfileShape): string {
  return profile.fn || profile.name || profile['@id'] as string
}

// Get the list of storages (pods) declared in the given profile.
export function getStorageUris(profile: SolidProfileShape): ContainerUri[] {
  if (!profile.storage) { return []; }
  return profile.storage
    .map(i => i["@id"])
    .map(ensureContainerUri)
  ;
}

// Get the best available name for the logged-in user.
export function useProfileName(): string | undefined {
  const profile = useProfile();
  if (profile === undefined) { return undefined }
  return profile.fn || profile.name || profile['@id'] as string
}

// Load profile from webId, recursively following rdfs:seeAlso links,
// and invoking `finalizeLogin` when the consolidated profile is loaded.
// This will actually only happen if `loginInProgress` is true.
//
// Parameters:
// * `webId` is the webId to load the profile for
// * `guard`, if set to false, will prevent the effect from running
//   (this is useful since hooks can not be called conditionnally)
// * `finalize`, if set, will be called once the profile is entirely loaded
//
// NB: internally, this function does not use LDO's `getResource` (nor `useResource`)
// because it has a number of limitations that cause issues with webIds:
// * it does not seem to follow redirections
//   (such as https://id.inrupt.com/p20n -> https://id.inrupt.com/p20n?lookout)
// * it does not do proper content-negotiation,
//   which is a problem with webIds returning HTML by default
export function useEffectLoadFullProfile(
  webId: string | undefined,
  guard?: boolean,
  finalize?: () => void,
) {
  const { fetch } = useSolidAuth();
  const { dataset } = useLdo();

  const loadProfilePart = useCallback(async (uri: string) => {
    console.debug("loadProfilePart: start:", uri);
    if (hasNamedGraph(dataset, uri)) {
      console.debug("loadProfilePart: already loaded:", uri);
      return;
    }

    let resp;
    try {
      resp = await fetch(uri, {
        headers: { accept: "text/turtle"}
      });
    }
    catch (e) {
      console.log("ERROR fetching", webId, e);
      return;
    }
    if (resp.status >= 400) {
      console.log("ERROR fetching", webId, resp?.statusText);
      return;
    }

    const resourceTurtle = await resp.text();
    let resourceDataset;
    console.debug("loadProfilePart: got turtle for", uri)
    try {
      resourceDataset = await parseRdf(resourceTurtle, {
        baseIRI: uri,
      });
    }
    catch (e) {
      console.log("ERROR parsing", webId, e);
      return;
    }

    // recursively follow rdfs:seeAlso
    const s = { termType: "NamedNode", value: uri };
    const p = { termType: "NamedNode", value: rdfs.seeAlso };
    const seeAlsoPromises = Array
      .from(resourceDataset.match(s as Term, p as Term))
      .map(q => loadProfilePart(q.object.value));

    // include loaded resource in LDO dataset
    dataset.addAll(resourceDataset.map(graphChanger(uri)));

    await Promise.all(seeAlsoPromises);
    // console.debug("loadProfilePart: exit:", uri);
  }, [dataset, fetch, webId]);

  if (guard === undefined) { guard = true; }
  useEffect(() => {
    console.debug("useEffectLoadProfile", guard, webId);
    if (guard && webId) {
      loadProfilePart(webId).then(finalize);
    }
  }, [guard, webId, loadProfilePart, finalize]);
}

function ensureContainerUri(uri: string): ContainerUri {
  if (uri.endsWith("/")) {
    return uri as ContainerUri;
  } else {
    return uri+"/" as ContainerUri;
  }
}

function makeNamedNode(uri: string): NamedNode {
  return {
    termType: "NamedNode",
    value: uri,
    equals: (other: Term | null | undefined) => { 
      return !!other && other.termType === 'NamedNode' && other.value === uri
    },
  }
}

// produce a *function* transforming quads,
// more precisely replacing the graph component of the quad
// with the given uri.
//  
function graphChanger(uri: string): (q:Quad) => Quad {
  const gn = makeNamedNode(uri);
  return q => {
    return {
      termType: "Quad",
      value: "",
      subject: q.subject,
      predicate: q.predicate,
      object: q.object,
      graph: gn,
      equals: (t: Term | null | undefined) => {
        if (t?.termType !== "Quad") {
          return false;
        }
        const tq = t as Quad;
        return q.subject.equals(tq.subject) && q.predicate.equals(tq.predicate) && q.object.equals(tq.object) && gn.equals(tq.graph)
      },
    } as Quad;
  }
}

function hasNamedGraph(dataset: SolidLdoDataset, uri: string): boolean {
  const gn = makeNamedNode(uri);
  return !dataset.match(null, null, null, gn)[Symbol.iterator]().next().done;
}
